import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookmarkPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
      <Button disabled variant="secondary" className="gap-2">
        <BookmarkPlus className="h-4 w-4" />
        In Stock
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={handleOpen} 
        className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg transition-all"
      >
        <BookmarkPlus className="h-4 w-4" />
        Reserve Book
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reserve Book</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            {!success && (
              <DialogDescription className="text-base text-foreground">
                All copies of <strong className="font-semibold">"{book.title}"</strong> are currently borrowed. 
                Do you want to join the reservation queue? 
                You will be notified by email once a copy becomes available.
              </DialogDescription>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            {!success && (
              <Button 
                onClick={handleReserve} 
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  'Confirm Reservation'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReserveBook;
