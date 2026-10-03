import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { errorMessage, orderApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PAYMENT_LABELS, formatCurrency, formatDateTime, shortId } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import ProductImage from '../components/ProductImage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function OrderDetails() {
  const { id } = useParams();
  const toast = useToast();
  const { data: order, setData, loading, error, reload } = useFetch(() => orderApi.get(id), [id]);
  const [cancelling, setCancelling] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="container narrow section">
        <ErrorMessage message={error} onRetry={reload} />
        <Link to="/orders" className="link-btn">
          Back to orders
        </Link>
      </div>
    );
  }

  const canCancel = order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED';

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      setData(await orderApi.cancel(order.id));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const address = order.shippingAddress;

  return (
    <div className="container narrow section">
      <Link to="/orders" className="link-btn">
        &larr; Back to orders
      </Link>
      <div className="section-head">
        <h2>Order #{shortId(order.id)}</h2>
        <StatusBadge status={order.orderStatus} />
      </div>
      <p className="muted">Placed on {formatDateTime(order.createdAt)}</p>

      <div className="panel">
        {order.items.map((item) => (
          <div className="order-line" key={item.productId}>
            <ProductImage className="order-line-image" src={item.imageUrl} alt={item.productName} />
            <div>
              <Link to={`/products/${item.productId}`} className="product-card-title">
                {item.productName}
              </Link>
              <div className="muted small">
                {formatCurrency(item.price)} &times; {item.quantity}
              </div>
            </div>
            <strong>{formatCurrency(item.price * item.quantity)}</strong>
          </div>
        ))}
        <div className="summary-row summary-total">
          <span>Total</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <div className="panel info-grid">
        <div>
          <h3>Shipping to</h3>
          <p>
            {address.fullName}
            <br />
            {address.addressLine}
            <br />
            {address.city} {address.postalCode}
            <br />
            {address.phone}
          </p>
        </div>
        <div>
          <h3>Payment</h3>
          <p>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
          <p className="muted small">Demo payment only</p>
        </div>
      </div>

      {canCancel && (
        <button className="btn btn-danger" onClick={cancel} disabled={cancelling}>
          {cancelling ? 'Cancelling...' : 'Cancel order'}
        </button>
      )}
    </div>
  );
}
