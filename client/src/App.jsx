import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme'; // Our new Stitch UI theme
import Layout from './components/Layout'; // Our new Stitch UI Layout
import AdminDashboard from './pages/AdminDashboard'; // Our new Dashboard

import LandingPage from './pages/LandingPage'; // Our new Landing Page
import Login from './pages/Login';
import Register from './pages/Register';

import BookCatalog from './pages/Books/BookCatalog';
import BookDetail from './pages/Books/BookDetail';

// Preserving existing member routes
import MemberList from './pages/Members/MemberList';
import MemberProfile from './pages/Members/MemberProfile';
import MemberHistory from './pages/Members/MemberHistory';
import MemberDashboard from './pages/Members/MemberDashboard';
import ReservationList from './pages/Reservations/ReservationList';
import ActiveBorrows from './pages/Borrowing/ActiveBorrows';
import FineManagement from './pages/Fines/FineManagement';
import StaffManagement from './pages/Staff/StaffManagement';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<Layout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="books" element={<BookCatalog />} />
            <Route path="books/:id" element={<BookDetail />} />
            
            <Route path="member-dashboard" element={<MemberDashboard />} />
            <Route path="members" element={<MemberList />} />
            <Route path="members/:id" element={<MemberProfile />} />
            <Route path="members/:id/history" element={<MemberHistory />} />
            <Route path="reservations" element={<ReservationList />} />
            <Route path="active-borrows" element={<ActiveBorrows />} />
            <Route path="fines" element={<FineManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
