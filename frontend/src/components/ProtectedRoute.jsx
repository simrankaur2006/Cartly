import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Only signed-in users may see the nested routes.
export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAppAuth();
  const location = useLocation();
  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}
