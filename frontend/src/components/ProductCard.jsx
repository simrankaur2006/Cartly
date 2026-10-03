import { Link, useNavigate } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import ProductImage from './ProductImage';
import Rating from './Rating';

export default function ProductCard({ product }) {
  const { isSignedIn } = useAppAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }
    addToCart(product.id, 1);
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image">
        <ProductImage src={product.imageUrl} alt={product.name} />
      </Link>
      <div className="product-card-body">
        <span className="muted small">{product.category}</span>
        <Link to={`/products/${product.id}`} className="product-card-title">
          {product.name}
        </Link>
        <Rating value={product.rating} />
        <div className="product-card-footer">
          <strong className="price">{formatCurrency(product.price)}</strong>
          <button className="btn btn-primary btn-sm" disabled={outOfStock} onClick={handleAdd}>
            {outOfStock ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
