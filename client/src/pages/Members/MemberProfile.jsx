import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMemberById, updateMember, updateMemberStatus, getMemberHistory } from '../../services/memberService';

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [member, setMember] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('active');

  const [editMode, setEditMode] = useState(false);
  const [updatedMember, setUpdatedMember] = useState({ name: '', phone: '' });
  const [updating, setUpdating] = useState(false);

  const profileId = id || (currentUser ? currentUser.id : null);
  const isSelf = currentUser && currentUser.id === profileId;
  const isLibrarianOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian');

  const fetchProfileData = async () => {
    if (!profileId) {
      setError('Profile ID missing. Please log in.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const profileData = await getMemberById(profileId);
      if (profileData.success) {
        setMember(profileData.data);
        setUpdatedMember({
          name: profileData.data.name,
          phone: profileData.data.phone || ''
        });
      }
      try {
        const historyData = await getMemberHistory(profileId);
        if (historyData.success) setBorrowHistory(historyData.data);
      } catch {
        setBorrowHistory([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const handleEditChange = (e) => {
    setUpdatedMember({ ...updatedMember, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setUpdating(true);
    try {
      const data = await updateMember(profileId, updatedMember);
      if (data.success) {
        setMember(data.data);
        setEditMode(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!member) return;
    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      const data = await updateMemberStatus(member.id, newStatus);
      if (data.success) setMember({ ...member, status: newStatus });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex justify-center py-20 text-text-secondary">Loading profile...</div>;
  }

  if (error && !member) {
    return (
      <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
        <button onClick={() => navigate(-1)} className="mb-4 text-primary font-body-sm flex items-center gap-2 hover:underline">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
        <div className="p-4 bg-error-container text-on-error-container rounded-lg">{error}</div>
      </div>
    );
  }

  const activeBorrows = borrowHistory.filter(item => item.status === 'active' || !item.returnDate);

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-text-secondary mb-6">
        <Link to="/members" className="font-body-sm text-body-sm hover:text-primary transition-colors">Members</Link>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
        <span className="font-body-sm text-body-sm text-on-surface">{member.name}</span>
      </nav>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')}><span className="material-symbols-outlined">close</span></button>
        </div>
      )}

      {/* Profile Header Card */}
      <section className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle mb-4xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-primary-fixed text-primary font-display-3xl ring-4 ring-primary-fixed">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-surface rounded-full ${member.status === 'active' ? 'bg-tertiary-fixed-dim' : member.status === 'suspended' ? 'bg-error' : 'bg-secondary'}`}></div>
            </div>

            <div className="flex-1">
              {editMode ? (
                <div className="space-y-3 max-w-md">
                  <input type="text" name="name" value={updatedMember.name} onChange={handleEditChange}
                    className="w-full font-headline-2xl text-headline-2xl text-on-surface mb-1 bg-surface-bright border border-border-default rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none" />
                  <input type="text" name="phone" placeholder="Phone" value={updatedMember.phone} onChange={handleEditChange}
                    className="w-full font-body-sm text-body-sm text-on-surface mb-1 bg-surface-bright border border-border-default rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              ) : (
                <>
                  <h2 className="font-headline-2xl text-headline-2xl text-on-surface mb-1">{member.name}</h2>
                  <p className="font-body-sm text-body-sm text-text-secondary mb-1">{member.email}</p>
                  {member.phone && <p className="font-body-sm text-body-sm text-text-secondary mb-3">{member.phone}</p>}
                </>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="font-code-mono text-code-mono bg-bg-page px-2 py-1 rounded border border-border-default text-on-surface-variant">
                  {member.membershipId || member.id}
                </span>
                <span className="font-label-xs text-label-xs uppercase tracking-widest bg-primary-fixed text-primary-container px-3 py-1 rounded-full">
                  Member
                </span>
                <span className={`font-label-xs text-label-xs uppercase tracking-widest px-3 py-1 rounded-full ${
                  member.status === 'active' ? 'bg-surface-container-high text-tertiary-container' :
                  member.status === 'suspended' ? 'bg-error-container text-on-error-container' :
                  'bg-secondary-fixed text-on-secondary-fixed-variant'
                }`}>
                  {member.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-0">
            {editMode ? (
              <>
                <button onClick={handleSaveProfile} disabled={updating}
                  className="flex-1 md:flex-none px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm hover:-translate-y-[2px] transition-all flex items-center gap-2 justify-center">
                  <span className="material-symbols-outlined text-sm">save</span> Save
                </button>
                <button onClick={() => setEditMode(false)}
                  className="flex-1 md:flex-none px-4 py-2 bg-surface border border-border-default text-text-secondary rounded-lg font-body-sm text-body-sm hover:bg-bg-hover transition-all">
                  Cancel
                </button>
              </>
            ) : (
              (isSelf || isLibrarianOrAdmin) && (
                <button onClick={() => setEditMode(true)}
                  className="flex-1 md:flex-none px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm hover:-translate-y-[2px] transition-all flex items-center gap-2 justify-center">
                  <span className="material-symbols-outlined text-sm">edit</span> Edit Profile
                </button>
              )
            )}

            {isLibrarianOrAdmin && !isSelf && (
              <button onClick={handleToggleStatus}
                className={`flex-1 md:flex-none px-4 py-2 bg-surface border rounded-lg font-body-sm text-body-sm transition-all flex items-center gap-2 justify-center shadow-sm ${
                  member.status === 'active'
                    ? 'border-error-container text-error hover:bg-error-container hover:text-on-error-container'
                    : 'border-tertiary-fixed text-tertiary hover:bg-tertiary-fixed hover:text-on-tertiary-fixed'
                }`}>
                <span className="material-symbols-outlined text-sm">{member.status === 'active' ? 'block' : 'check_circle'}</span>
                {member.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="border-b border-border-default mb-6">
        <nav className="flex gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`font-headline-lg text-headline-lg pb-3 px-1 transition-colors whitespace-nowrap flex items-center ${activeTab === 'active' ? 'text-primary border-b-2 border-primary -mb-[1px]' : 'text-text-secondary hover:text-on-surface'}`}
          >
            Active Borrows
            <span className={`ml-2 font-label-xs text-label-xs rounded-full px-2 py-0.5 ${activeTab === 'active' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-text-secondary'}`}>{activeBorrows.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`font-headline-lg text-headline-lg pb-3 px-1 transition-colors whitespace-nowrap flex items-center ${activeTab === 'history' ? 'text-primary border-b-2 border-primary -mb-[1px]' : 'text-text-secondary hover:text-on-surface'}`}
          >
            Borrowing History
          </button>
        </nav>
      </div>

      {/* Tab: Active Borrows */}
      {activeTab === 'active' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl mb-4xl">
          {activeBorrows.length === 0 ? (
            <div className="col-span-full py-8 text-center text-text-secondary bg-surface rounded-xl border border-border-subtle">
              No active borrows.
            </div>
          ) : (
            activeBorrows.map(borrow => (
              <div key={borrow.id} className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle hover:shadow-md hover:-translate-y-[3px] transition-all group">
                <div className="flex gap-4">
                  <div className="w-20 h-[106px] bg-surface-container rounded-md shadow-sm flex items-center justify-center text-primary-fixed shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>menu_book</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline-lg text-headline-lg text-on-surface line-clamp-2 leading-tight mb-2" title={borrow.book?.title}>
                      {borrow.book?.title || 'Unknown Book'}
                    </h3>
                    <p className="font-body-sm text-body-sm text-text-secondary mb-3">Due: {new Date(borrow.dueDate).toLocaleDateString()}</p>
                    <div className="flex items-center justify-between">
                      <span className={`font-label-xs text-label-xs uppercase tracking-widest px-2 py-1 rounded border ${borrow.status === 'overdue' ? 'bg-error-container text-on-error-container border-error/20' : 'bg-bg-page text-text-secondary border-border-default'}`}>
                        {borrow.status === 'overdue' ? 'OVERDUE' : 'Borrowed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Tab: Borrowing History */}
      {activeTab === 'history' && (
        <section className="bg-surface rounded-xl shadow-sm border border-border-subtle overflow-hidden mb-4xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default bg-surface-container-lowest">
                  <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-card-padding font-semibold">Book Title</th>
                  <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-4 font-semibold">Issue Date</th>
                  <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-4 font-semibold">Return Date</th>
                  <th className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest py-3 px-card-padding font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm divide-y divide-border-subtle">
                {borrowHistory.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-text-secondary">No historical borrowing records.</td></tr>
                ) : (
                  borrowHistory.map(historyItem => (
                    <tr key={historyItem.id} className="hover:bg-bg-hover transition-colors bg-bg-surface">
                      <td className="py-3 px-card-padding font-medium text-on-surface">{historyItem.book?.title || 'Unknown Title'}</td>
                      <td className="py-3 px-4 text-text-secondary">{new Date(historyItem.issueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-text-secondary">{historyItem.returnDate ? new Date(historyItem.returnDate).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-card-padding text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          historyItem.status === 'returned' ? 'bg-tertiary-fixed text-tertiary-container' :
                          historyItem.status === 'overdue' ? 'bg-error-container text-on-error-container' :
                          'bg-primary-fixed text-primary'
                        }`}>
                          {historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default MemberProfile;
