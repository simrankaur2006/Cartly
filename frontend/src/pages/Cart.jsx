import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Cart() {
  const { items, total, loading, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container section">
      <div className="section-head">
        <h2>Your cart</h2>
        {items.length > 0 && (
          <button className="link-btn danger-text" onClick={clearCart}>
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          text="Add something you like and it will show up here."
          action={
            <Link className="btn btn-primary" to="/products">
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
          <aside className="summary">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <span>{items.reduce((n, i) => n + i.quantity, 0)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
              Proceed to checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
