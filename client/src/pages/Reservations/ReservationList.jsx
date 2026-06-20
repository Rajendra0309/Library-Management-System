import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllReservations, getMemberReservations, cancelReservation } from '../../services/reservationService';

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
      <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
        <div className="p-4 bg-error-container text-on-error-container rounded-lg">Please log in to view reservations.</div>
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
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-xl mb-4xl">
        <div>
          <div className="flex items-center gap-sm mb-xs">
            <span className="text-text-tertiary font-body-sm text-body-sm">Circulation</span>
            <span className="material-symbols-outlined text-[16px] text-text-tertiary">chevron_right</span>
            <span className="text-on-surface font-body-sm text-body-sm font-semibold">Reservations</span>
          </div>
          <h2 className="font-headline-2xl text-headline-2xl text-on-surface">
            {isLibrarianOrAdmin ? 'All Reservations' : 'My Reservations'}
          </h2>
        </div>
        <div className="flex gap-md">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface border border-border-default rounded-md text-body-sm font-body-sm focus:border-primary focus:ring focus:ring-focus-ring outline-none w-64 transition-all"
              placeholder="Search reservations..."
              type="text"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-6">{error}</div>
      )}

      {/* Table Container */}
      <div className="bg-surface rounded-xl shadow-sm border border-border-subtle overflow-hidden p-card-padding">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle">
                {isLibrarianOrAdmin && <th className="pb-md font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest px-md">Member</th>}
                <th className="pb-md font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest px-md">Book</th>
                <th className="pb-md font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest px-md">Reserved Date</th>
                <th className="pb-md font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest px-md text-center">Queue</th>
                <th className="pb-md font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest px-md">Status</th>
                {isLibrarianOrAdmin && <th className="pb-md font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest px-md text-center">Notified</th>}
                <th className="pb-md font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest px-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm">
              {loading ? (
                <tr><td colSpan={isLibrarianOrAdmin ? 7 : 5} className="py-8 text-center text-text-secondary">Loading reservations...</td></tr>
              ) : paginatedReservations.length === 0 ? (
                <tr><td colSpan={isLibrarianOrAdmin ? 7 : 5} className="py-8 text-center text-text-secondary">
                  {filteredReservations.length === 0 && reservations.length > 0
                    ? 'No reservations match your search.'
                    : 'No reservations found.'}
                </td></tr>
              ) : (
                paginatedReservations.map((res) => (
                  <tr key={res.id} className="border-b border-border-subtle hover:bg-bg-hover transition-all duration-200">
                    {isLibrarianOrAdmin && (
                      <td className="py-md px-md">
                        <div className="flex items-center gap-md">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm">
                            {(res.member?.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{res.member?.name || 'Unknown User'}</div>
                            <div className="font-code-mono text-code-mono text-text-tertiary text-[12px]">{res.member?.membershipId || '-'}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="py-md px-md">
                      <div className="font-semibold text-on-surface">{res.book?.title || 'Unknown Title'}</div>
                      <div className="font-code-mono text-code-mono text-text-tertiary text-[12px]">{res.book?.isbn || '-'}</div>
                    </td>
                    <td className="py-md px-md text-on-surface-variant">
                      {new Date(res.reservedAt || res.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-md px-md text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-surface-container-high text-primary font-semibold text-[12px]">
                        #{res.queuePosition || 1}
                      </span>
                    </td>
                    <td className="py-md px-md">
                      {res.status === 'cancelled' ? (
                        <span className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-surface-variant text-text-secondary font-semibold text-[12px]">Cancelled</span>
                      ) : res.status === 'expired' ? (
                        <span className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-error-container text-on-error-container font-semibold text-[12px]">Expired</span>
                      ) : res.status === 'fulfilled' ? (
                        <span className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-[12px]">Fulfilled</span>
                      ) : res.notified ? (
                        <span className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-surface-container-high text-tertiary font-semibold text-[12px]">
                          <div className="w-2 h-2 rounded-full bg-tertiary"></div> Ready for Pickup
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-primary-fixed text-primary font-semibold text-[12px]">
                          <div className="w-2 h-2 rounded-full bg-primary"></div> Pending
                        </span>
                      )}
                    </td>
                    {isLibrarianOrAdmin && (
                      <td className="py-md px-md text-center">
                        {res.notified
                          ? <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                          : <span className="text-text-tertiary text-[12px] font-semibold">—</span>}
                      </td>
                    )}
                    <td className="py-md px-md text-right">
                      {res.status === 'pending' ? (
                        <button
                          onClick={() => handleCancel(res.id)}
                          className="text-text-tertiary hover:text-error transition-colors p-sm rounded-md hover:bg-error-container"
                          title="Cancel Reservation"
                        >
                          <span className="material-symbols-outlined text-[20px]">cancel</span>
                        </button>
                      ) : (
                        <span className="text-text-tertiary text-[12px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-xl pt-md border-t border-border-subtle">
          <div className="text-text-tertiary font-body-sm text-body-sm">
            Showing {filteredReservations.length === 0 ? 0 : Math.min(page * rowsPerPage + 1, filteredReservations.length)}
            {' '}to {Math.min((page + 1) * rowsPerPage, filteredReservations.length)}
            {' '}of {filteredReservations.length} entries
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-sm rounded-md border border-border-default text-text-tertiary hover:bg-bg-hover disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= filteredReservations.length}
              className="p-sm rounded-md border border-border-default text-on-surface hover:bg-bg-hover disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationList;
