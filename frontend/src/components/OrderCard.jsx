import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, shortId } from '../utils/format';
import StatusBadge from './StatusBadge';

export default function OrderCard({ order }) {
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <div className="order-card">
      <div>
        <strong>Order #{shortId(order.id)}</strong>
        <div className="muted small">
          {formatDate(order.createdAt)} &middot; {itemCount} item{itemCount === 1 ? '' : 's'}
        </div>
      </div>
      <StatusBadge status={order.orderStatus} />
      <strong>{formatCurrency(order.totalAmount)}</strong>
      <Link className="btn btn-ghost btn-sm" to={`/orders/${order.id}`}>
        View details
      </Link>
    </div>
  );
}
