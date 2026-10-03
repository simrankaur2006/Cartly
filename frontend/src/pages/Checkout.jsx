import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage, orderApi, profileApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/format';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

export default function Checkout() {
  const { items, total, refresh } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', phone: '', addressLine: '', city: '', postalCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill name, phone and address from the saved profile.
  useEffect(() => {
    profileApi
      .get()
      .then((p) => setForm((f) => ({ ...f, fullName: p.name || '', phone: p.phone || '', addressLine: p.address || '' })))
      .catch(() => {});
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const order = await orderApi.create({ shippingAddress: form, paymentMethod });
      await refresh();
      toast.success('Order placed successfully');
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      toast.error(errorMessage(err));
      await refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container narrow section">
        <EmptyState
          title="Nothing to check out"
          text="Your cart is empty."
          action={
            <Link className="btn btn-primary" to="/products">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container section">
      <h2>Checkout</h2>
      <form className="cart-layout" onSubmit={submit}>
        <div className="panel">
          <h3>Shipping details</h3>
          <div className="form-grid">
            <label>
              Full name
              <input name="fullName" value={form.fullName} onChange={change} required />
            </label>
            <label>
              Phone number
              <input name="phone" value={form.phone} onChange={change} required />
            </label>
            <label className="span-2">
              Address
              <input name="addressLine" value={form.addressLine} onChange={change} required />
            </label>
            <label>
              City
              <input name="city" value={form.city} onChange={change} required />
            </label>
            <label>
              Postal code
              <input name="postalCode" value={form.postalCode} onChange={change} required />
            </label>
          </div>

          <h3>Payment method</h3>
          <p className="muted small">This is a demo store. No real payment is taken.</p>
          <div className="radio-cards">
            <label className={paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''}>
              <input type="radio" name="payment" checked={paymentMethod === 'CASH_ON_DELIVERY'} onChange={() => setPaymentMethod('CASH_ON_DELIVERY')} />
              <strong>Cash on Delivery</strong>
              <span className="muted small">Pay when the order arrives</span>
            </label>
            <label className={paymentMethod === 'DEMO_CARD' ? 'selected' : ''}>
              <input type="radio" name="payment" checked={paymentMethod === 'DEMO_CARD'} onChange={() => setPaymentMethod('DEMO_CARD')} />
              <strong>Demo Card Payment</strong>
              <span className="muted small">Simulated card payment, nothing is charged</span>
            </label>
          </div>
          {paymentMethod === 'DEMO_CARD' && <p className="demo-note">Demo card: 4242 4242 4242 4242. No card details are collected or stored.</p>}
          <ErrorMessage message={error} />
        </div>

        <aside className="summary">
          <h3>Order summary</h3>
          {items.map((i) => (
            <div className="summary-row" key={i.productId}>
              <span>
                {i.productName} &times; {i.quantity}
              </span>
              <span>{formatCurrency(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
