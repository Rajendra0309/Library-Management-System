import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ROLE_STYLES = {
  admin:     { bg: 'bg-purple-100',  text: 'text-purple-700',  label: 'Admin' },
  librarian: { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Librarian' }
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #5B4FE8, #A78BFA)',
  'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'linear-gradient(135deg, #10B981, #34D399)',
  'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'linear-gradient(135deg, #EF4444, #F87171)'
];

const StaffList = () => {
  const [staff, setStaff]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null); // staff being confirmed for delete
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');

  const navigate = useNavigate();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search)              params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const res = await api.get(`/staff?${params.toString()}`);
      setStaff(res.data.data);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  // Fetch on mount and whenever deps change (debounce search)
  useEffect(() => {
    const timer = setTimeout(fetchStaff, 300);
    return () => clearTimeout(timer);
  }, [fetchStaff]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/staff/${deleteTarget.id}`);
      setSuccessMsg(`"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
      fetchStaff();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-3xl text-display-3xl text-on-surface mb-1">Staff Management</h1>
          <p className="font-body-base text-body-base text-text-secondary">
            Manage library personnel, roles, and access permissions. {total > 0 && `(${total} total)`}
          </p>
        </div>
        <button
          id="add-staff-btn"
          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold hover:shadow-[0_4px_14px_0_rgba(91,79,232,0.39)] active:scale-[0.97] transition-all duration-200"
          onClick={() => navigate('/staff/add')}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Staff
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
          <p className="font-body-sm text-body-sm text-green-700">{successMsg}</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <span className="material-symbols-outlined text-red-500 text-xl">error</span>
          <p className="font-body-sm text-body-sm text-red-700">{error}</p>
          <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError('')}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* Toolbar/Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-[14px] shadow-sm border border-border-subtle">
        <div className="relative flex-grow sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">search</span>
          <input
            className="w-full bg-surface-container-low border border-border-default rounded-[6px] pl-9 pr-3 py-2 font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-focus-ring outline-none transition-all"
            placeholder="Search by name, email, department…"
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="staff-search-input"
          />
        </div>
        <select
          className="bg-surface-container-low border border-border-default rounded-[6px] px-3 py-2 font-body-sm text-body-sm focus:border-primary outline-none transition-all"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          id="role-filter-select"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="librarian">Librarian</option>
        </select>
        <button
          className="flex items-center gap-2 px-3 py-1.5 border border-border-default rounded-[6px] font-body-sm text-body-sm text-on-surface-variant hover:bg-bg-hover transition-colors ml-auto"
          onClick={fetchStaff}
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-surface rounded-[14px] shadow-sm border border-border-subtle overflow-hidden flex-grow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-lowest">
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest">Employee ID</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest hidden md:table-cell">Department</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest hidden md:table-cell">Status</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-text-tertiary animate-spin">progress_activity</span>
                      <p className="font-body-sm text-body-sm text-text-secondary">Loading staff…</p>
                    </div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-text-tertiary">group_off</span>
                      <p className="font-body-sm text-body-sm text-text-secondary">No staff members found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                staff.map((member, idx) => {
                  const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.librarian;
                  const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                  return (
                    <tr key={member.id} className="hover:bg-bg-hover transition-colors group h-[56px]">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-body-sm font-semibold flex-shrink-0"
                            style={{ background: gradient }}
                          >
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <p className="font-body-sm text-body-sm font-semibold text-on-surface">{member.name}</p>
                            <p className="font-label-xs text-label-xs text-text-secondary">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-code-mono text-code-mono text-on-surface-variant">
                        {member.employeeId || <span className="text-text-tertiary italic">—</span>}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-xs text-label-xs ${roleStyle.bg} ${roleStyle.text}`}>
                          {roleStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">
                        {member.department || <span className="text-text-tertiary italic">—</span>}
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-xs text-label-xs ${
                          member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${member.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Edit staff"
                            onClick={() => navigate(`/staff/edit/${member.id}`)}
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete staff"
                            onClick={() => setDeleteTarget(member)}
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border-subtle bg-surface-container-lowest">
          <p className="font-body-sm text-body-sm text-text-secondary">
            Page {page} of {totalPages} — {total} staff member{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1">
            <button
              className="p-1 text-on-surface-variant hover:bg-bg-hover rounded transition-colors disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              className="p-1 text-on-surface-variant hover:bg-bg-hover rounded transition-colors disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-red-500 text-xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface">Delete Staff Member</h3>
                <p className="font-body-sm text-body-sm text-text-secondary">This action cannot be undone.</p>
              </div>
            </div>
            <p className="font-body-base text-body-base text-on-surface mb-6">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> from the system?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-lg border border-border-default font-body-sm text-body-sm text-on-surface hover:bg-bg-hover transition-colors"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-body-sm text-body-sm hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                onClick={handleDelete}
                disabled={deleteLoading}
                id="confirm-delete-btn"
              >
                {deleteLoading ? (
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-lg">delete</span>
                )}
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
