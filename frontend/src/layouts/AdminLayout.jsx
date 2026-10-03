import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="admin-shell">
        <AdminSidebar />
        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
