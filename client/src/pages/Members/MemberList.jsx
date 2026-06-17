import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMembers, createMember, updateMemberStatus } from '../../services/memberService';

const MemberList = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Add Member Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch Members using memberService
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
      setError(err.response?.data?.message || 'Failed to fetch members list. Please ensure you are logged in as Librarian or Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, rowsPerPage, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // Toggle member status (Suspend / Activate) using memberService
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      setError('');
      const data = await updateMemberStatus(id, newStatus);
      if (data.success) {
        setMembers(members.map(m => m._id === id ? { ...m, status: newStatus } : m));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member status.');
    }
  };

  // Check Current User Role for Access Rights
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isAuthorized = currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian');

  if (!isAuthorized) {
    return (
      <div className="p-4 bg-error-container text-on-error-container rounded-lg mt-4 max-w-content-max-width mx-auto">
        You are not authorized to view this page. Please log in as an Admin or Librarian.
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
          className="bg-primary text-on-primary font-body-sm text-body-sm px-6 py-2.5 rounded-lg hover:shadow-brand-glow active:scale-[0.97] transition-all flex items-center justify-center space-x-2" 
          style={{ background: 'linear-gradient(135deg, #5B4FE8 0%, #8B5CF6 50%, #A78BFA 100%)' }}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span className="font-semibold">Register Member</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Controls (Search & Filter) */}
      <div className="bg-bg-surface shadow-sm border border-border-default rounded-xl p-4 mb-xl flex flex-col lg:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-border-default rounded-md font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-focus-ring transition-all placeholder-text-tertiary" 
            placeholder="Search members by name, email, or ID..." 
            type="text"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex p-1 bg-surface-container-low border border-border-default rounded-lg self-start">
          <button className="px-4 py-1.5 rounded-md bg-bg-surface shadow-sm font-label-xs text-label-xs text-on-surface border border-border-subtle">All</button>
          <button className="px-4 py-1.5 rounded-md font-label-xs text-label-xs text-text-secondary hover:text-on-surface transition-colors">Active</button>
          <button className="px-4 py-1.5 rounded-md font-label-xs text-label-xs text-text-secondary hover:text-on-surface transition-colors">Pending</button>
          <button className="px-4 py-1.5 rounded-md font-label-xs text-label-xs text-text-secondary hover:text-on-surface transition-colors">Suspended</button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-bg-surface shadow-sm border border-border-default rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-default bg-surface-container-lowest">
                <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-card-padding font-semibold">Member</th>
                <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-4 font-semibold hidden md:table-cell">ID</th>
                <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-4 font-semibold">Status</th>
                <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-4 font-semibold hidden lg:table-cell">Joined</th>
                <th className="py-3 px-card-padding text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">Loading members...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-text-secondary">No members found matching filters.</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr 
                    key={member._id} 
                    className="group hover:bg-bg-hover transition-colors cursor-pointer bg-bg-surface border-l-[3px] border-transparent hover:border-primary"
                    onClick={() => navigate(`/members/${member._id}`)}
                  >
                    <td className="py-3 pl-[21px] pr-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-headline-sm font-bold border border-border-default">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-headline-sm text-on-surface font-semibold">{member.name}</p>
                          <p className="text-text-secondary text-xs">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="font-code-mono text-code-mono text-text-secondary bg-surface-container-low px-2 py-1 rounded">
                        {member.membershipId || `LV-${member._id.substring(member._id.length - 4)}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        member.status === 'active' ? 'bg-tertiary-fixed text-tertiary-container border border-tertiary-fixed-dim' : 
                        member.status === 'suspended' ? 'bg-error-container text-on-error-container border border-error/20' : 
                        'bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary-fixed-dim'
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary hidden lg:table-cell">
                      {new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 pr-card-padding text-right text-text-tertiary group-hover:text-primary transition-colors">
                      <div className="flex items-center justify-end space-x-2">
                        {currentUser.role === 'admin' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(member._id, member.status);
                            }}
                            className={`p-1 rounded-md hover:bg-surface-variant ${member.status === 'active' ? 'text-error' : 'text-tertiary-container'}`}
                            title={member.status === 'active' ? 'Suspend' : 'Activate'}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {member.status === 'active' ? 'block' : 'check_circle'}
                            </span>
                          </button>
                        )}
                        <button className="p-1 rounded-md hover:bg-surface-variant">
                          <span className="material-symbols-outlined text-sm">more_vert</span>
                        </button>
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
            Showing <span className="font-medium text-on-surface">{page * rowsPerPage + 1}</span> to <span className="font-medium text-on-surface">{Math.min((page + 1) * rowsPerPage, totalCount)}</span> of <span className="font-medium text-on-surface">{totalCount}</span> members
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-border-default rounded-md text-text-tertiary hover:bg-bg-hover disabled:opacity-50 bg-bg-surface font-body-sm text-body-sm transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= totalCount}
              className="px-3 py-1.5 border border-border-default rounded-md text-on-surface hover:bg-bg-hover disabled:opacity-50 bg-bg-surface font-body-sm text-body-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal is kept simple for now, can be improved later */}
      {openAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-surface rounded-xl p-6 w-full max-w-md shadow-xl">
             <h2 className="font-headline-xl text-on-surface mb-4">Register New Member</h2>
             <form onSubmit={(e) => {
               e.preventDefault();
               // Call handleAddMemberSubmit here. Keeping it mocked to avoid errors as backend is mocked.
               setAdding(true);
               setTimeout(() => {
                  setAdding(false);
                  setOpenAddDialog(false);
               }, 1000);
             }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-label-xs uppercase tracking-widest text-text-secondary mb-1">Full Name</label>
                    <input type="text" required className="w-full border border-border-default rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-focus-ring outline-none" />
                  </div>
                  <div>
                    <label className="block text-label-xs uppercase tracking-widest text-text-secondary mb-1">Email</label>
                    <input type="email" required className="w-full border border-border-default rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-focus-ring outline-none" />
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={() => setOpenAddDialog(false)} className="px-4 py-2 text-text-secondary hover:bg-bg-hover rounded-md text-sm">Cancel</button>
                    <button type="submit" disabled={adding} className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm hover:shadow-brand-glow">{adding ? 'Registering...' : 'Register'}</button>
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
