import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { adminApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';

function StatCard({ label, value, tone }) {
  return (
    <div className={`stat-card ${tone || ''}`}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(() => adminApi.dashboard(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const maxRevenue = Math.max(...data.salesLast7Days.map((d) => d.revenue), 1);
  const totalStatus = Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stat-grid">
        <StatCard label="Total revenue" value={formatCurrency(data.totalRevenue)} tone="stat-brand" />
        <StatCard label="Total orders" value={data.totalOrders} />
        <StatCard label="Total products" value={data.totalProducts} />
        <StatCard label="Total customers" value={data.totalCustomers} />
        <StatCard label="Pending orders" value={data.pendingOrders} tone={data.pendingOrders > 0 ? 'stat-warn' : ''} />
        <StatCard label="Low stock" value={data.lowStockCount} tone={data.lowStockCount > 0 ? 'stat-danger' : ''} />
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h3>Sales in the last 7 days</h3>
          <div className="bars">
            {data.salesLast7Days.map((d) => (
              <div className="bar-col" key={d.date} title={`${d.orders} order(s)`}>
                <span className="bar-value">{d.revenue > 0 ? formatCurrency(d.revenue) : ''}</span>
                <div className="bar" style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 4 : 0)}%` }} />
                <span className="bar-label">{new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
          <p className="muted small">Cancelled orders are not counted.</p>
        </div>

        <div className="panel">
          <h3>Orders by status</h3>
          {Object.entries(data.ordersByStatus).map(([status, count]) => (
            <div className="status-row" key={status}>
              <StatusBadge status={status} />
              <div className="status-track">
                <div className="status-fill" style={{ width: `${(count / totalStatus) * 100}%` }} />
              </div>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-head">
          <h3>Low stock products</h3>
          <Link className="link-btn" to="/admin/inventory">
            Manage inventory
          </Link>
        </div>
        {data.lowStockProducts.length === 0 ? (
          <p className="muted">Everything is well stocked.</p>
        ) : (
          data.lowStockProducts.map((p) => (
            <div className="status-row" key={p.id}>
              <span>{p.name}</span>
              <span className="grow" />
              <span className={p.stock === 0 ? 'danger-text' : ''}>{p.stock} left</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
