import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import ProductImage from './ProductImage';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();
  return (
    <div className="cart-item">
      <ProductImage className="cart-item-image" src={item.imageUrl} alt={item.productName} />
      <div className="cart-item-info">
        <Link to={`/products/${item.productId}`} className="product-card-title">
          {item.productName}
        </Link>
        <span className="muted">{formatCurrency(item.price)} each</span>
        <button className="link-btn danger-text" onClick={() => removeItem(item.productId)}>
          Remove
        </button>
      </div>
      <div className="qty">
        <button aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
          -
        </button>
        <span>{item.quantity}</span>
        <button aria-label="Increase quantity" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
          +
        </button>
      </div>
      <strong className="cart-item-subtotal">{formatCurrency(item.price * item.quantity)}</strong>
    </div>
  );
}
