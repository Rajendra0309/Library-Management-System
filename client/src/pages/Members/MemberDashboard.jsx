import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemberHistory, getMemberById } from '../../services/memberService';

const MemberDashboard = () => {
  const [member, setMember] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || currentUser.role !== 'member') {
        setError('Unauthorized or not a member.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [profileRes, historyRes] = await Promise.all([
           getMemberById(currentUser.id),
           getMemberHistory(currentUser.id)
        ]);

        if (profileRes.success) setMember(profileRes.data);
        if (historyRes.success) setBorrowHistory(historyRes.data);
      } catch (err) {
         // Using mock data or silently failing history if endpoint not fully ready
         if (err.response?.status !== 404) {
             setError(err.response?.data?.message || 'Failed to load dashboard.');
         }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
     return <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex justify-center py-20 text-text-secondary">Loading dashboard...</div>;
  }

  if (error && !member) {
     return <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding"><div className="p-4 bg-error-container text-on-error-container rounded-lg">{error}</div></div>;
  }

  const activeBorrows = borrowHistory.filter(item => item.status === 'active' || item.status === 'overdue' || !item.returnDate);
  const overdueBorrows = activeBorrows.filter(item => item.status === 'overdue' || new Date(item.dueDate) < new Date());

  // Using member data if available, fallback to currentUser basic info
  const memberName = member?.name || currentUser?.name || 'Member';
  const firstName = memberName.split(' ')[0];

  return (
    <div className="flex-1 lg:ml-sidebar-width lg:max-w-[calc(1360px-256px)] mx-auto w-full p-lg lg:p-page-padding pb-24 lg:pb-page-padding">
      {/* Header / Welcome Banner */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4xl gap-lg">
        <div>
          <p className="font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest mb-xs">Member Dashboard</p>
          <h2 className="font-display-4xl text-display-4xl text-on-background flex items-center gap-sm">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {firstName} <span className="animate-bounce inline-block origin-bottom-right">👋</span>
          </h2>
          <p className="font-body-base text-body-base text-text-secondary mt-xs max-w-2xl">
            Here's a quick overview of your current loans and recommendations from the archive.
          </p>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mb-4xl">
        {/* Stat 1 */}
        <div className="bg-surface rounded-xl p-card-padding border border-border-subtle shadow-sm hover:-translate-y-1 transition-transform flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Active Borrows</span>
            <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[18px]">library_books</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-sm">
              <span className="font-display-3xl text-display-3xl text-on-background">{activeBorrows.length}</span>
              <span className="font-body-sm text-body-sm text-text-tertiary">/ 5 Limit</span>
            </div>
            {overdueBorrows.length > 0 ? (
                <p className="font-body-sm text-body-sm text-error mt-1 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">warning</span> {overdueBorrows.length} Overdue
                </p>
            ) : (
                <p className="font-body-sm text-body-sm text-tertiary-container mt-1 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> All in good standing
                </p>
            )}
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-surface rounded-xl p-card-padding border border-border-subtle shadow-sm hover:-translate-y-1 transition-transform flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Next Due Date</span>
            <div className="w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary-container">
              <span className="material-symbols-outlined text-[18px]">event</span>
            </div>
          </div>
          <div>
            {activeBorrows.length > 0 ? (
               <>
                 <span className="font-display-3xl text-display-3xl text-on-background">
                    {new Date(Math.min(...activeBorrows.map(b => new Date(b.dueDate).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                 </span>
                 <p className="font-body-sm text-body-sm text-secondary-container mt-1 flex items-center gap-xs">
                   <span className="material-symbols-outlined text-[14px]">schedule</span> Action needed soon
                 </p>
               </>
            ) : (
               <>
                 <span className="font-display-3xl text-display-3xl text-text-tertiary">-</span>
                 <p className="font-body-sm text-body-sm text-text-tertiary mt-1 flex items-center gap-xs">
                   <span className="material-symbols-outlined text-[14px]">done</span> No upcoming dues
                 </p>
               </>
            )}
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-surface rounded-xl p-card-padding border border-border-subtle shadow-sm hover:-translate-y-1 transition-transform flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Pending Fines</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <span className="font-display-3xl text-display-3xl text-on-background">$0.00</span>
            <p className="font-body-sm text-body-sm text-text-tertiary mt-1 flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">info</span> Clear account
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4xl">
        {/* Left Column (Borrows & Recommendations) */}
        <div className="lg:col-span-2 space-y-4xl">
          {/* Currently Borrowed */}
          <section>
            <div className="flex justify-between items-end mb-xl">
              <h3 className="font-headline-2xl text-headline-2xl text-on-background">Currently Borrowed</h3>
              <Link to="/profile" className="font-body-sm text-body-sm text-primary hover:underline flex items-center gap-xs">
                View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
               {activeBorrows.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-text-secondary bg-surface rounded-xl border border-border-subtle">
                     You don't have any active borrows right now.
                  </div>
               ) : (
                  activeBorrows.slice(0, 4).map(borrow => (
                     <div key={borrow._id} className="bg-surface rounded-xl border border-border-subtle flex p-sm gap-lg shadow-sm hover:-translate-y-1 transition-transform group relative overflow-hidden">
                       <div className="absolute inset-0 bg-secondary-container/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                       <div className="w-[80px] h-[110px] rounded bg-surface-variant flex-shrink-0 overflow-hidden shadow-sm relative flex items-center justify-center text-primary-fixed">
                         <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>menu_book</span>
                       </div>
                       <div className="flex flex-col justify-between py-xs pr-sm flex-1">
                         <div>
                           <div className="flex justify-between items-start mb-1">
                             <h4 className="font-headline-lg text-headline-lg text-on-background line-clamp-1">{borrow.bookId?.title || 'Unknown Title'}</h4>
                             <button className="text-text-tertiary hover:text-primary"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                           </div>
                         </div>
                         <div>
                           <div className="flex items-center gap-xs mb-1">
                             <span className={`w-2 h-2 rounded-full ${borrow.status === 'overdue' ? 'bg-error' : 'bg-secondary-container'}`}></span>
                             <span className={`font-code-mono text-code-mono text-xs ${borrow.status === 'overdue' ? 'text-error' : 'text-secondary-container'}`}>
                               Due {new Date(borrow.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                             </span>
                           </div>
                           <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                             <div className={`h-full rounded-full w-[50%] ${borrow.status === 'overdue' ? 'bg-error' : 'bg-secondary-container'}`}></div>
                           </div>
                         </div>
                       </div>
                     </div>
                  ))
               )}
            </div>
          </section>

          {/* Recommended For You */}
          <section>
            <div className="flex justify-between items-end mb-xl">
              <div>
                <h3 className="font-headline-2xl text-headline-2xl text-on-background">Recommended For You</h3>
                <p className="font-body-sm text-body-sm text-text-secondary">Based on recent catalog additions</p>
              </div>
            </div>
            <div className="flex gap-xl overflow-x-auto pb-lg pt-sm -mx-lg px-lg lg:mx-0 lg:px-0">
                {/* Mock Recommendations */}
                <div className="w-[140px] flex-shrink-0 group cursor-pointer">
                  <div className="w-[140px] h-[190px] rounded-[10px] bg-surface-variant overflow-hidden mb-sm shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all border border-border-subtle relative flex items-center justify-center text-primary/30">
                    <span className="material-symbols-outlined text-4xl">menu_book</span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-white text-primary rounded-full px-4 py-2 font-label-xs text-label-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Reserve</button>
                    </div>
                  </div>
                  <h4 className="font-body-sm text-body-sm font-semibold text-on-background line-clamp-1 group-hover:text-primary transition-colors">Atomic Habits</h4>
                  <p className="font-label-xs text-label-xs text-text-tertiary mt-1">James Clear</p>
                </div>
                
                <div className="w-[140px] flex-shrink-0 group cursor-pointer">
                  <div className="w-[140px] h-[190px] rounded-[10px] bg-surface-variant overflow-hidden mb-sm shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all border border-border-subtle relative flex items-center justify-center text-primary/30">
                    <span className="material-symbols-outlined text-4xl">menu_book</span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-white text-primary rounded-full px-4 py-2 font-label-xs text-label-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Reserve</button>
                    </div>
                  </div>
                  <h4 className="font-body-sm text-body-sm font-semibold text-on-background line-clamp-1 group-hover:text-primary transition-colors">The Lean Startup</h4>
                  <p className="font-label-xs text-label-xs text-text-tertiary mt-1">Eric Ries</p>
                </div>
                
                <div className="w-[140px] flex-shrink-0 group cursor-pointer">
                  <div className="w-[140px] h-[190px] rounded-[10px] bg-surface-variant overflow-hidden mb-sm shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all border border-border-subtle relative flex items-center justify-center text-primary/30">
                    <span className="material-symbols-outlined text-4xl">menu_book</span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-white text-primary rounded-full px-4 py-2 font-label-xs text-label-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Reserve</button>
                    </div>
                  </div>
                  <h4 className="font-body-sm text-body-sm font-semibold text-on-background line-clamp-1 group-hover:text-primary transition-colors">Clean Code</h4>
                  <p className="font-label-xs text-label-xs text-text-tertiary mt-1">Robert C. Martin</p>
                </div>
            </div>
          </section>
        </div>

        {/* Right Column (Activity Timeline) */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl p-card-padding border border-border-subtle shadow-sm h-full">
            <h3 className="font-headline-xl text-headline-xl text-on-background mb-xl">Recent Activity</h3>
            
            <div className="relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border-default before:to-transparent">
              {borrowHistory.slice(0, 5).map(history => (
                 <div key={history._id} className="relative flex items-start justify-between gap-md mb-xl">
                   <div className="flex items-center gap-md">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface z-10 shrink-0 shadow-sm ${
                        history.status === 'returned' ? 'bg-surface-container text-primary' :
                        history.status === 'overdue' ? 'bg-error-container text-error' :
                        'bg-primary text-white'
                     }`}>
                       <span className="material-symbols-outlined text-[12px]">{history.status === 'returned' ? 'keyboard_return' : 'book'}</span>
                     </div>
                     <div>
                       <p className="font-body-sm text-body-sm text-on-background">
                         <span className="font-semibold">{history.status === 'returned' ? 'Returned' : history.status === 'overdue' ? 'Overdue' : 'Borrowed'}</span> "{history.bookId?.title || 'Unknown'}"
                       </p>
                       <p className="font-label-xs text-label-xs text-text-tertiary mt-xs">
                          {new Date(history.updatedAt || history.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
                     </div>
                   </div>
                 </div>
              ))}

              {borrowHistory.length === 0 && (
                 <div className="text-text-secondary text-center py-4">No recent activity.</div>
              )}
            </div>

            <Link to="/profile" className="block text-center w-full mt-4xl py-2 rounded-md border border-border-default font-label-xs text-label-xs text-text-secondary uppercase tracking-widest hover:bg-surface-container hover:text-primary transition-colors">
              View Full History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
