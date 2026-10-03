import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Only admins (configured on the backend with ADMIN_CLERK_USER_IDS) may see the nested routes.
export default function AdminRoute() {
  const { isLoaded, isSignedIn, isAdmin, adminChecked } = useAppAuth();
  if (!isLoaded || (isSignedIn && !adminChecked)) return <LoadingSpinner />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  if (!isAdmin) {
    return (
      <div className="container narrow">
        <div className="empty-state">
          <h3>Admin access required</h3>
          <p className="muted">Your account is not on the admin list. Add your Clerk user ID to ADMIN_CLERK_USER_IDS on the backend.</p>
          <Link className="btn btn-primary" to="/">
            Back to store
          </Link>
        </div>
      </div>
    );
  }
  return <Outlet />;
}
