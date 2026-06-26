import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Toaster } from './components/ui/sonner';

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// ─── Main Pages ───────────────────────────────────────────────────────────────
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import BookCatalog from './pages/Books/BookCatalog';
import BookDetail from './pages/Books/BookDetail';
import AddBook from './pages/Books/AddBook';
import EditBook from './pages/Books/EditBook';
import MemberList from './pages/Members/MemberList';
import MemberProfile from './pages/Members/MemberProfile';
import MemberDashboard from './pages/Members/MemberDashboard';
import ReservationList from './pages/Reservations/ReservationList';
import ActiveBorrows from './pages/Borrowing/ActiveBorrows';
import IssueBook from './pages/Borrowing/IssueBook';
import ReturnBook from './pages/Borrowing/ReturnBook';
import FineManagement from './pages/Fines/FineManagement';
import FineDetail from './pages/Fines/FineDetail';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';

// ─── Staff Pages (Module 1) ───────────────────────────────────────────────────
import StaffList from './pages/Staff/StaffList';
import AddStaff from './pages/Staff/AddStaff';
import EditStaff from './pages/Staff/EditStaff';

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'member') {
    return <MemberDashboard />;
  }
  return <AdminDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected: any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="dashboard" element={<DashboardRouter />} />
              <Route path="books" element={<BookCatalog />} />
              <Route path="books/:id" element={<BookDetail />} />
              <Route path="settings" element={<Settings />} />

              {/* Management routes: admin and librarian */}
              <Route element={<ProtectedRoute roles={['admin', 'librarian']} />}>
                <Route path="books/add" element={<AddBook />} />
                <Route path="books/edit/:id" element={<EditBook />} />
                <Route path="member-dashboard" element={<MemberDashboard />} />
                <Route path="members" element={<MemberList />} />
                <Route path="members/:id" element={<MemberProfile />} />
                <Route path="reservations" element={<ReservationList />} />
                <Route path="active-borrows" element={<ActiveBorrows />} />
                <Route path="borrow/issue" element={<IssueBook />} />
                <Route path="borrow/return" element={<ReturnBook />} />
                <Route path="fines" element={<FineManagement />} />
                <Route path="fines/:memberId" element={<FineDetail />} />
              </Route>

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
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}

export default App;