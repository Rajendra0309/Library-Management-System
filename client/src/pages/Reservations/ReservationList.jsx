import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllReservations, getMemberReservations, cancelReservation } from '../../services/reservationService';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, ChevronRight, Ban, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const ReservationList = () => {
  const { user: currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const isLibrarianOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian');

  // ─── Fetch Reservations ─────────────────────────────────────────────────────
  const fetchReservationsData = async () => {
    if (!currentUser) { setLoading(false); return; }
    try {
      setLoading(true);
      setError('');
      const data = isLibrarianOrAdmin
        ? await getAllReservations()
        : await getMemberReservations(currentUser.id);
      if (data.success) setReservations(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reservations.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservationsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Cancel Reservation ─────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    try {
      setError('');
      const data = await cancelReservation(id);
      if (data.success) {
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

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        <Alert variant="destructive">
          <Ban className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>Please log in to view reservations.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const filteredReservations = reservations.filter((res) => {
    const titleMatch = res.book?.title?.toLowerCase().includes(search.toLowerCase()) || false;
    const nameMatch  = res.member?.name?.toLowerCase().includes(search.toLowerCase()) || false;
    const idMatch    = res.member?.membershipId?.toLowerCase().includes(search.toLowerCase()) || false;
    return titleMatch || nameMatch || idMatch;
  });

  const paginatedReservations = filteredReservations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted-foreground text-sm">Circulation</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground text-sm font-semibold">Reservations</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isLibrarianOrAdmin ? 'All Reservations' : 'My Reservations'}
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 w-full md:w-64"
              placeholder="Search reservations..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table Container */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {isLibrarianOrAdmin && <TableHead className="font-semibold text-xs uppercase tracking-wider">Member</TableHead>}
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Book</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Reserved Date</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Queue</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
              {isLibrarianOrAdmin && <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Notified</TableHead>}
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isLibrarianOrAdmin ? 7 : 5} className="py-8 text-center text-muted-foreground">
                  Loading reservations...
                </TableCell>
              </TableRow>
            ) : paginatedReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isLibrarianOrAdmin ? 7 : 5} className="py-8 text-center text-muted-foreground">
                  {filteredReservations.length === 0 && reservations.length > 0
                    ? 'No reservations match your search.'
                    : 'No reservations found.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedReservations.map((res) => (
                <TableRow key={res.id}>
                  {isLibrarianOrAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {(res.member?.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{res.member?.name || 'Unknown User'}</div>
                          <div className="font-mono text-muted-foreground text-xs">{res.member?.membershipId || '-'}</div>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="font-semibold text-foreground">{res.book?.title || 'Unknown Title'}</div>
                    <div className="font-mono text-muted-foreground text-xs">{res.book?.isbn || '-'}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(res.reservedAt || res.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-semibold text-primary bg-primary/5">
                      #{res.queuePosition || 1}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {res.status === 'cancelled' ? (
                      <Badge variant="secondary">Cancelled</Badge>
                    ) : res.status === 'expired' ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : res.status === 'fulfilled' ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">Fulfilled</Badge>
                    ) : res.notified ? (
                      <Badge variant="outline" className="text-orange-500 border-orange-500/50 bg-orange-500/10">
                        Ready for Pickup
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  {isLibrarianOrAdmin && (
                    <TableCell className="text-center">
                      {res.notified
                        ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                        : <span className="text-muted-foreground font-semibold">—</span>}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    {res.status === 'pending' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancel(res.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Cancel Reservation"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredReservations.length === 0 ? 0 : Math.min(page * rowsPerPage + 1, filteredReservations.length)}</span>
            {' '}to <span className="font-medium text-foreground">{Math.min((page + 1) * rowsPerPage, filteredReservations.length)}</span>
            {' '}of <span className="font-medium text-foreground">{filteredReservations.length}</span> entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= filteredReservations.length}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReservationList;
