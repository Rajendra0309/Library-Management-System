import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import Login from './pages/Login';
import Register from './pages/Register';

// ─── Main Pages ───────────────────────────────────────────────────────────────
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import BookCatalog from './pages/Books/BookCatalog';
import BookDetail from './pages/Books/BookDetail';
import AddBook from './pages/Books/AddBook';
import EditBook from './pages/Books/EditBook';
import MemberList from './pages/Members/MemberList';
import MemberProfile from './pages/Members/MemberProfile';
import MemberHistory from './pages/Members/MemberHistory';
import MemberDashboard from './pages/Members/MemberDashboard';
import ReservationList from './pages/Reservations/ReservationList';
import ActiveBorrows from './pages/Borrowing/ActiveBorrows';
import FineManagement from './pages/Fines/FineManagement';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';

// ─── Staff Pages (Module 1) ───────────────────────────────────────────────────
import StaffList from './pages/Staff/StaffList';
import AddStaff from './pages/Staff/AddStaff';
import EditStaff from './pages/Staff/EditStaff';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected: any authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="books" element={<BookCatalog />} />
                <Route path="books/:id" element={<BookDetail />} />
                <Route path="books/add" element={<AddBook />} />
                <Route path="books/edit/:id" element={<EditBook />} />
                <Route path="member-dashboard" element={<MemberDashboard />} />
                <Route path="members" element={<MemberList />} />
                <Route path="members/:id" element={<MemberProfile />} />
                <Route path="members/:id/history" element={<MemberHistory />} />
                <Route path="reservations" element={<ReservationList />} />
                <Route path="active-borrows" element={<ActiveBorrows />} />
                <Route path="fines" element={<FineManagement />} />
                <Route path="settings" element={<Settings />} />

                {/* Staff routes: admin only */}
                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="staff" element={<StaffList />} />
                  <Route path="staff/add" element={<AddStaff />} />
                  <Route path="staff/edit/:id" element={<EditStaff />} />
                  <Route path="reports" element={<Reports />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;