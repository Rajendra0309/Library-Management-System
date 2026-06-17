import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          Verifying session…
        </Typography>
      </Box>
    );
  }

  // Not authenticated — redirect to /login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — if roles list is provided and user's role is not in it
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" fontWeight={700} color="error">
          403 — Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to view this page. Your current role is <strong>{user?.role}</strong>.
        </Typography>
      </Box>
    );
  }

  // All checks passed — render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
