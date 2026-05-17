import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../app/authContext';
import { Spinner } from '../feedback/Spinner';

export const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
};
