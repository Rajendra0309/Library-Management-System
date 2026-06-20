import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { BookmarkAdd as ReserveIcon } from '@mui/icons-material';
import api from '../../api/axios';

/**
 * ReserveBook widget
 * @param {Object} book - The book object to check availability and reserve
 * @param {Function} onReservationCreated - Callback after successful reservation
 */
const ReserveBook = ({ book, onReservationCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  // Book is only reserveable if copies are out of stock (availableCopies === 0)
  const isReservable = book && book.availableCopies === 0;

  const handleOpen = () => {
    setError('');
    setSuccess('');
    setOpen(true);
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
    }
  };

  const handleReserve = async () => {
    if (!currentUser) {
      setError('You must be logged in to reserve books.');
      return;
    }

    if (currentUser.role === 'member' && currentUser.status === 'suspended') {
      setError('Your membership is suspended. Suspended accounts cannot make reservations.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/reservations', {
        bookId: book.id,
        memberId: currentUser.id
      });

      if (response.data.success) {
        setSuccess('Reservation placed successfully! You will receive an email once this book is returned.');
        if (typeof onReservationCreated === 'function') {
          onReservationCreated(response.data.data);
        }
        // Auto-close dialog after 2.5 seconds on success
        setTimeout(() => {
          setOpen(false);
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isReservable) {
    return (
      <Button
        variant="contained"
        disabled
        startIcon={<ReserveIcon />}
        size="small"
      >
        In Stock
      </Button>
    );
  }

  return (
    <Box>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<ReserveIcon />}
        onClick={handleOpen}
        size="medium"
        sx={{
          background: 'linear-gradient(45deg, #ec4899 30%, #f43f5e 90%)',
          boxShadow: '0 3px 5px 2px rgba(236, 72, 153, .3)',
        }}
      >
        Reserve Book
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose}
        PaperProps={{ sx: { background: '#1e293b', width: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
          Reserve Book
        </DialogTitle>
        
        <DialogContent sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          {!success && (
            <Typography variant="body1" color="text.primary">
              All copies of <strong>"{book.title}"</strong> are currently borrowed. 
              Do you want to join the reservation queue? 
              You will be notified by email once a copy becomes available.
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          {!success && (
            <Button 
              onClick={handleReserve} 
              variant="contained" 
              color="secondary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReserveBook;
