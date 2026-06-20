import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  CancelOutlined as CancelIcon,
  NotificationsActive as NotificationIcon,
  HourglassEmpty as PendingIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { getAllReservations, getMemberReservations, cancelReservation } from '../../services/reservationService';

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Get current user information
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isLibrarianOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian');

  const fetchReservationsData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      let data;
      
      if (isLibrarianOrAdmin) {
        // Fetch ALL reservations for Admin/Librarian view
        data = await getAllReservations();
      } else {
        // Fetch only own reservations for Member view
        data = await getMemberReservations(currentUser.id);
      }

      if (data.success) {
        setReservations(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reservations.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservationsData();
  }, []);

  const handleCancel = async (id) => {
    try {
      setError('');
      const data = await cancelReservation(id);
      if (data.success) {
        // Set the reservation state locally to cancelled
        setReservations(reservations.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!currentUser) {
    return (
      <Alert severity="warning" sx={{ mt: 4 }}>
        Please log in to view reservations.
      </Alert>
    );
  }

  // Filter reservations based on search text (filters by member name and book title)
  const filteredReservations = reservations.filter((res) => {
    const titleMatch = res.book?.title?.toLowerCase().includes(search.toLowerCase()) || false;
    const nameMatch = res.member?.name?.toLowerCase().includes(search.toLowerCase()) || false;
    const idMatch = res.member?.membershipId?.toLowerCase().includes(search.toLowerCase()) || false;
    return titleMatch || nameMatch || idMatch;
  });

  // Client-side pagination calculations
  const paginatedReservations = filteredReservations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" color="secondary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            🔔 Book Reservations Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLibrarianOrAdmin 
              ? 'Library-wide active and completed book reservation queues.' 
              : 'Inspect your active reservation holds or cancel pending pickup orders.'
            }
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 3, background: '#1e293b', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
        {/* Search Panel */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <SearchIcon sx={{ color: 'text.secondary' }} />
          <TextField
            placeholder={
              isLibrarianOrAdmin 
                ? 'Search reservations by book title, member name, or membership ID...' 
                : 'Search your reservations by book title...'
            }
            variant="standard"
            fullWidth
            value={search}
            onChange={handleSearchChange}
            InputProps={{ disableUnderline: true }}
            sx={{
              background: '#0f172a',
              borderRadius: 2,
              p: '10px 15px',
              input: { color: '#f8fafc' }
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : filteredReservations.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No reservations found.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Book Title</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>ISBN</TableCell>
                  {isLibrarianOrAdmin && (
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Member (ID)</TableCell>
                  )}
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Reserved On</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Pickup Deadline</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedReservations.map((res) => (
                  <TableRow key={res.id} hover sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.light' }}>{res.book?.title || 'Unknown Title'}</TableCell>
                    <TableCell>{res.book?.isbn || '-'}</TableCell>
                    {isLibrarianOrAdmin && (
                      <TableCell>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 550 }}>
                          {res.member?.name || 'Deleted User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {res.member?.membershipId || '-'}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>{new Date(res.reservedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {res.expiresAt ? (
                        <strong style={{ color: '#ef4444' }}>
                          {new Date(res.expiresAt).toLocaleDateString()}
                        </strong>
                      ) : (
                        <span style={{ opacity: 0.5 }}>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          res.status === 'pending' && res.notified 
                            ? 'READY FOR PICKUP' 
                            : res.status.toUpperCase()
                        }
                        size="small"
                        color={
                          res.status === 'fulfilled' ? 'success' :
                          res.status === 'cancelled' ? 'default' :
                          res.status === 'expired' ? 'error' : 'warning'
                        }
                        icon={
                          res.status === 'pending' && res.notified ? <NotificationIcon /> : 
                          res.status === 'pending' ? <PendingIcon /> : undefined
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {res.status === 'pending' ? (
                        <Tooltip title="Cancel Reservation">
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancel(res.id)}
                          >
                            Cancel
                          </Button>
                        </Tooltip>
                      ) : (
                        <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>Closed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredReservations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ color: 'text.secondary', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
        />
      </Paper>
    </Box>
  );
};

export default ReservationList;
