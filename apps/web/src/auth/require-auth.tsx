import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/use-auth-store';

export function RequireAuth(props: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return props.children;
}

