import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { orderApi } from '../services/api';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Orders() {
  const { data: orders, loading, error, reload } = useFetch(() => orderApi.mine(), []);

  return (
    <div className="container narrow section">
      <h2>My orders</h2>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          text="When you place an order it will show up here."
          action={
            <Link className="btn btn-primary" to="/products">
              Start shopping
            </Link>
          }
        />
      ) : (
        <div className="stack">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
