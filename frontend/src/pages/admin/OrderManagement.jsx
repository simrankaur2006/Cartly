import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { adminApi, errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ORDER_STATUSES, formatCurrency, formatDate, shortId } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function OrderManagement() {
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const { data, loading, error, reload } = useFetch(() => adminApi.orders(filter), [filter]);

  const changeStatus = async (order, status) => {
    if (status === order.orderStatus) return;
    try {
      await adminApi.updateOrderStatus(order.id, status);
      toast.success(`Order #${shortId(order.id)} is now ${status}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
    reload();
  };

  return (
    <>
      <div className="section-head">
        <h2>Orders</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState title="No orders found" text="Orders will appear here as customers place them." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Update status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => {
                const locked = o.orderStatus === 'CANCELLED' || o.orderStatus === 'DELIVERED';
                return (
                  <tr key={o.id}>
                    <td>
                      <Link className="link-btn" to={`/orders/${o.id}`}>
                        #{shortId(o.id)}
                      </Link>
                    </td>
                    <td>
                      {o.customerName}
                      {o.customerEmail && <div className="muted small">{o.customerEmail}</div>}
                    </td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{formatCurrency(o.totalAmount)}</td>
                    <td>
                      <StatusBadge status={o.orderStatus} />
                    </td>
                    <td>
                      <select value={o.orderStatus} disabled={locked} onChange={(e) => changeStatus(o, e.target.value)} aria-label="Change order status">
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
