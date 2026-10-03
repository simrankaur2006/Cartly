import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/customers', label: 'Customers' },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <p className="admin-sidebar-title">Admin</p>
      <nav>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            {l.label}
          </NavLink>
        ))}
        <NavLink to="/" className="back-link">
          Back to store
        </NavLink>
      </nav>
    </aside>
  );
}
