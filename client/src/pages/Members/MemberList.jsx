import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMembers, createMember, updateMemberStatus } from '../../services/memberService';

const MemberList = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', phone: '' });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // ─── Fetch Members ─────────────────────────────────────────────────────────
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMembers(page + 1, rowsPerPage, search);
      if (data.success) {
        setMembers(data.data);
        setTotalCount(data.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch members list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // ─── Toggle Member Status ──────────────────────────────────────────────────
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      setError('');
      const data = await updateMemberStatus(id, newStatus);
      if (data.success) {
        setMembers(members.map(m => m.id === id ? { ...m, status: newStatus } : m));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member status.');
    }
  };

  // ─── Add Member Submit ─────────────────────────────────────────────────────
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddError('');
    try {
      const data = await createMember(newMember);
      if (data.success) {
        setOpenAddDialog(false);
        setNewMember({ name: '', email: '', password: '', phone: '' });
        fetchMembers();
      }
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create member.');
    } finally {
      setAdding(false);
    }
  };

  // ─── Access Guard ──────────────────────────────────────────────────────────
  const isAuthorized = currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian');

  if (!isAuthorized) {
    return (
      <div className="max-w-content-max-width mx-auto px-page-padding py-4xl">
        <div className="p-4 bg-error-container text-on-error-container rounded-lg">
          You are not authorized to view this page. Please log in as an Admin or Librarian.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content-max-width mx-auto px-page-padding py-4xl w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4xl gap-4">
        <div>
          <h1 className="font-display-4xl text-display-4xl text-on-surface mb-2">Members</h1>
          <p className="font-body-base text-body-base text-text-secondary">
            Manage library members and their circulation status.
            <span className="font-semibold text-on-surface ml-1">{totalCount} total</span>
          </p>
        </div>
        <button
          onClick={() => setOpenAddDialog(true)}
          className="bg-primary text-on-primary font-body-sm text-body-sm px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-[0.97] transition-all flex items-center justify-center space-x-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span className="font-semibold">Register Member</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-4">{error}</div>
      )}

      {/* Search Bar */}
      <div className="bg-bg-surface shadow-sm border border-border-default rounded-xl p-4 mb-xl flex flex-col lg:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-border-default rounded-md font-body-sm text-body-sm focus:outline-none focus:border-primary transition-all placeholder-text-tertiary"
            placeholder="Search by name, email, or Membership ID..."
            type="text"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-bg-surface shadow-sm border border-border-default rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-default bg-surface-container-lowest">
                <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-card-padding font-semibold">Member</th>
                <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-4 font-semibold hidden md:table-cell">Membership ID</th>
                <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-4 font-semibold">Status</th>
                <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-4 font-semibold hidden lg:table-cell">Joined</th>
                <th className="py-3 px-card-padding text-right"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm divide-y divide-border-subtle">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-text-secondary">Loading members...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-text-secondary">No members found.</td></tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="group hover:bg-bg-hover transition-colors cursor-pointer"
                    onClick={() => navigate(`/members/${member.id}`)}
                  >
                    <td className="py-3 pl-card-padding pr-4">
                      <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-container text-on-primary-container font-headline-sm text-headline-sm shrink-0 overflow-hidden">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        <div>
                          <p className="font-semibold text-on-surface">{member.name}</p>
                          <p className="text-text-secondary text-xs">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="font-code-mono text-code-mono text-text-secondary bg-surface-container-low px-2 py-1 rounded">
                        {member.membershipId || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        member.status === 'active' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                        member.status === 'suspended' ? 'bg-error-container text-on-error-container' :
                        'bg-secondary-fixed text-on-secondary-fixed'
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary hidden lg:table-cell">
                      {new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 pr-card-padding text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/members/${member.id}`); }}
                          className="p-1.5 rounded-md hover:bg-surface-variant text-text-secondary hover:text-primary transition-colors"
                          title="View Profile"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(member.id, member.status); }}
                            className={`p-1.5 rounded-md hover:bg-surface-variant transition-colors ${member.status === 'active' ? 'text-error' : 'text-tertiary'}`}
                            title={member.status === 'active' ? 'Suspend' : 'Activate'}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {member.status === 'active' ? 'block' : 'check_circle'}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-card-padding py-3 border-t border-border-default bg-surface-container-lowest flex items-center justify-between">
          <p className="font-body-sm text-body-sm text-text-secondary">
            Showing <span className="font-medium text-on-surface">{totalCount === 0 ? 0 : page * rowsPerPage + 1}</span>
            {' '}to <span className="font-medium text-on-surface">{Math.min((page + 1) * rowsPerPage, totalCount)}</span>
            {' '}of <span className="font-medium text-on-surface">{totalCount}</span> members
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-border-default rounded-md text-text-secondary hover:bg-bg-hover disabled:opacity-50 bg-bg-surface font-body-sm text-body-sm transition-colors"
            >Previous</button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= totalCount}
              className="px-3 py-1.5 border border-border-default rounded-md text-on-surface hover:bg-bg-hover disabled:opacity-50 bg-bg-surface font-body-sm text-body-sm transition-colors"
            >Next</button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {openAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-surface rounded-xl p-6 w-full max-w-md shadow-xl border border-border-default">
            <h2 className="font-headline-2xl text-headline-2xl text-on-surface mb-4">Register New Member</h2>
            {addError && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg mb-4 text-sm">{addError}</div>
            )}
            <form onSubmit={handleAddMemberSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-label-xs font-label-xs uppercase tracking-widest text-text-secondary mb-1">Full Name *</label>
                  <input type="text" required value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full border border-border-default rounded-md px-3 py-2 text-sm focus:border-primary outline-none bg-surface"
                    placeholder="e.g. Jane Smith" />
                </div>
                <div>
                  <label className="block text-label-xs font-label-xs uppercase tracking-widest text-text-secondary mb-1">Email *</label>
                  <input type="email" required value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full border border-border-default rounded-md px-3 py-2 text-sm focus:border-primary outline-none bg-surface"
                    placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-label-xs font-label-xs uppercase tracking-widest text-text-secondary mb-1">Password *</label>
                  <input type="password" required value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    className="w-full border border-border-default rounded-md px-3 py-2 text-sm focus:border-primary outline-none bg-surface"
                    placeholder="Min. 8 characters" />
                </div>
                <div>
                  <label className="block text-label-xs font-label-xs uppercase tracking-widest text-text-secondary mb-1">Phone</label>
                  <input type="tel" value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full border border-border-default rounded-md px-3 py-2 text-sm focus:border-primary outline-none bg-surface"
                    placeholder="9876543210" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" disabled={adding}
                    onClick={() => { setOpenAddDialog(false); setAddError(''); setNewMember({ name: '', email: '', password: '', phone: '' }); }}
                    className="px-4 py-2 text-text-secondary hover:bg-bg-hover rounded-lg text-sm transition-colors">Cancel</button>
                  <button type="submit" disabled={adding}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm hover:opacity-90 transition-all disabled:opacity-60">
                    {adding ? 'Registering...' : 'Register Member'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
