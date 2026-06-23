import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActiveBorrows, getBorrowHistory, renewBook, returnBook } from '../../services/borrowService';

const ActiveBorrows = () => {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('All Statuses');
  const [search, setSearch] = useState('');

  const isMember = user?.role === 'member';

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      setError('');
      if (isMember) {
        const data = await getBorrowHistory(user.id);
        // Only show currently active ones from history if it returns all
        const activeOnly = data.data.filter(b => b.status === 'issued');
        setBorrows(activeOnly);
      } else {
        const data = await getActiveBorrows();
        setBorrows(data.data);
      }
    } catch (err) {
      setError(isMember ? 'Failed to fetch your borrows.' : 'Failed to fetch active borrows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const handleRenew = async (id) => {
    try {
      setError('');
      const response = await renewBook(id);
      if (response.success) {
        setSuccess('Book renewed successfully!');
        fetchBorrows();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to renew book');
    }
  };

  const handleReturn = async (id) => {
    try {
      setError('');
      const response = await returnBook(id);
      if (response.success) {
        setSuccess(response.message || 'Book returned successfully!');
        fetchBorrows();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book');
    }
  };

  const filteredBorrows = borrows.filter(b => {
    const matchesSearch = b.book.title.toLowerCase().includes(search.toLowerCase()) ||
      b.member.name.toLowerCase().includes(search.toLowerCase()) ||
      b.member.membershipId.toLowerCase().includes(search.toLowerCase());

    if (filter === 'All Statuses') return matchesSearch;
    if (filter === 'Overdue') return matchesSearch && new Date(b.dueDate) < new Date();
    if (filter === 'Active') return matchesSearch && new Date(b.dueDate) >= new Date();
    return matchesSearch;
  });

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
      <div className="mb-3xl flex flex-col lg:flex-row lg:items-end justify-between gap-lg">
        <div>
          <h2 className="font-headline-2xl text-headline-2xl text-on-surface mb-xs">
            {isMember ? 'My Active Borrows' : 'Active Borrows'}
          </h2>
          <p className="font-body-sm text-text-secondary">
            {isMember ? `You have ${borrows.length} books with you.` : `Managing ${borrows.length} items currently in circulation.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-4 pr-8 py-2 bg-bg-surface border border-border-default rounded-[6px] text-body-sm focus:border-primary outline-none"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Overdue">Overdue</option>
          </select>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[16px]">search</span>
            <input
              className="pl-9 pr-4 py-2 bg-bg-surface border border-border-default rounded-[6px] text-body-sm focus:border-primary outline-none w-64"
              placeholder={isMember ? "Search your books..." : "Search member or book..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">error</span>
        {error}
      </div>}
      {success && <div className="p-4 bg-tertiary-fixed text-tertiary-container rounded-lg mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">check_circle</span>
        {success}
      </div>}

      <div className="bg-bg-surface rounded-[14px] shadow-sm border border-border-subtle overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-bright border-b border-border-subtle text-label-xs uppercase tracking-widest text-text-secondary">
              {!isMember && <th className="px-6 py-4 font-semibold">Member</th>}
              <th className="px-6 py-4 font-semibold">Book Title</th>
              <th className="px-6 py-4 font-semibold">Issue Date</th>
              <th className="px-6 py-4 font-semibold">Due Date</th>
              <th className="px-6 py-4 text-center font-semibold">Status</th>
              {!isMember && <th className="px-6 py-4 text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="font-body-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-text-secondary">Loading active borrows...</span>
                  </div>
                </td>
              </tr>
            ) : filteredBorrows.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-20 text-text-tertiary">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl">folder_open</span>
                    <span>No active borrows found.</span>
                  </div>
                </td>
              </tr>
            ) : filteredBorrows.map(b => {
              const overdueDate = new Date(b.dueDate);
              const isOverdue = overdueDate < new Date();
              return (
                <tr key={b.id} className="border-b border-border-subtle hover:bg-bg-hover group transition-colors">
                  {!isMember && (
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface">{b.member.name}</div>
                      <div className="text-[11px] text-text-tertiary font-code-mono uppercase">{b.member.membershipId}</div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="font-medium text-on-surface">{b.book.title}</div>
                    <div className="text-[11px] text-text-tertiary">ISBN: {b.book.isbn}</div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{new Date(b.issueDate).toLocaleDateString()}</td>
                  <td className={`px-6 py-4 ${isOverdue ? 'text-error font-semibold' : 'text-text-secondary'}`}>
                    {overdueDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOverdue ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
                      {isOverdue ? 'Overdue' : 'Active'}
                    </span>
                  </td>
                  {!isMember && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleRenew(b.id)}
                          className="p-2 hover:bg-primary-container hover:text-primary rounded-full transition-all text-text-secondary"
                          title="Renew (Extends 7 days)"
                        >
                          <span className="material-symbols-outlined text-[20px]">update</span>
                        </button>
                        <button
                          onClick={() => handleReturn(b.id)}
                          className="p-2 hover:bg-tertiary-container hover:text-tertiary rounded-full transition-all text-text-secondary"
                          title="Return Book"
                        >
                          <span className="material-symbols-outlined text-[20px]">keyboard_return</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveBorrows;
