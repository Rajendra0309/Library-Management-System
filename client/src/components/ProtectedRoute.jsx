import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * ProtectedRoute
 * Wraps routes that require authentication and/or a specific role.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>               // any authenticated user
 *   <Route element={<ProtectedRoute roles={['admin']} />}>  // admin only
 *
 * @param {string[]} roles - Optional list of allowed roles. If omitted, any authenticated user passes.
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show a full-screen spinner while session is being verified on mount
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Verifying session...</p>
      </div>
    );
  }

  // Not authenticated — redirect to /login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — if roles list is provided and user's role is not in it
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-background">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">403 — Access Denied</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          You don't have permission to view this page. Your current role is <span className="font-semibold text-foreground uppercase">{user?.role}</span>.
        </p>
      </div>
    );
  }

  // All checks passed — render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
