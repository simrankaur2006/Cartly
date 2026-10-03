import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { productApi } from '../services/api';
import { useAppAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import ProductImage from '../components/ProductImage';
import Rating from '../components/Rating';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useAppAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { data: product, loading, error, reload } = useFetch(() => productApi.get(id), [id]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="container section">
        <ErrorMessage message={error} onRetry={reload} />
        <Link to="/products" className="link-btn">
          Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const maxQty = Math.max(product.stock, 1);

  const handleAdd = async () => {
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }
    await addToCart(product.id, quantity);
  };

  return (
    <div className="container section">
      <Link to="/products" className="link-btn">
        &larr; Back to products
      </Link>
      <div className="details">
        <ProductImage className="details-image" src={product.imageUrl} alt={product.name} />
        <div className="details-info">
          <span className="muted">{product.category}</span>
          <h1>{product.name}</h1>
          <Rating value={product.rating} />
          <p className="details-price">{formatCurrency(product.price)}</p>
          <p className="details-desc">{product.description}</p>
          <p>
            {outOfStock ? (
              <span className="badge badge-cancelled">Out of stock</span>
            ) : product.stock <= 10 ? (
              <span className="badge badge-placed">Only {product.stock} left</span>
            ) : (
              <span className="badge badge-delivered">In stock ({product.stock})</span>
            )}
          </p>
          <div className="details-actions">
            <div className="qty">
              <button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}>
                -
              </button>
              <span>{quantity}</span>
              <button aria-label="Increase quantity" disabled={quantity >= maxQty} onClick={() => setQuantity(quantity + 1)}>
                +
              </button>
            </div>
            <button className="btn btn-primary" disabled={outOfStock} onClick={handleAdd}>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
