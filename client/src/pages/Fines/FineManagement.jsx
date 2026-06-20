import React, { useState } from 'react';

const FineManagement = () => {
  const [filter, setFilter] = useState('All Statuses');
  
  // Mock data for Fines
  const mockFines = [
    {
      _id: 'f1',
      member: { name: 'Eleanor Vance', id: 'M-84920', initials: 'ER' },
      book: { title: 'The Haunting of Hill House', reason: 'Overdue (14 days)' },
      amount: 7.00,
      status: 'Pending'
    },
    {
      _id: 'f2',
      member: { name: 'John Locke', id: 'M-11204', initials: 'JL' },
      book: { title: 'An Essay Concerning Human Understanding', reason: 'Damaged Cover' },
      amount: 15.50,
      status: 'Paid'
    },
    {
      _id: 'f3',
      member: { name: 'Sarah Waters', id: 'M-55321', initials: 'SW' },
      book: { title: 'Fingersmith', reason: 'Overdue (3 days)' },
      amount: 1.50,
      status: 'Pending'
    },
    {
      _id: 'f4',
      member: { name: 'Donna Tartt', id: 'M-99012', initials: 'DT' },
      book: { title: 'The Secret History', reason: 'Overdue (1 day)' },
      amount: 0.50,
      status: 'Waived'
    }
  ];

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-lg mb-4xl">
        <div>
          <h2 className="font-display-3xl text-display-3xl text-on-surface mb-sm">Fine Management</h2>
          <p className="font-body-base text-body-base text-text-secondary">Track, collect, and manage member financial obligations.</p>
        </div>
        <div className="flex gap-md">
          <button className="flex items-center gap-xs px-md py-sm rounded-lg border border-border-default text-primary bg-bg-surface hover:-translate-y-[2px] hover:shadow-md transition-all duration-200 font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mb-4xl">
        {/* Total Collected */}
        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover:-translate-y-[3px] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-lg opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-tertiary-container">account_balance</span>
          </div>
          <h3 className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest mb-sm">Total Collected</h3>
          <div className="flex items-baseline gap-sm mb-lg">
            <span className="font-display-4xl text-display-4xl text-on-surface">$12,450</span>
            <span className="font-body-sm text-body-sm text-tertiary-container flex items-center"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> 8.2%</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full w-[75%]"></div>
          </div>
        </div>
        
        {/* Pending Fines */}
        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover:-translate-y-[3px] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-lg opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-secondary-container">pending_actions</span>
          </div>
          <h3 className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest mb-sm">Pending Fines</h3>
          <div className="flex items-baseline gap-sm mb-lg">
            <span className="font-display-4xl text-display-4xl text-on-surface">$3,820</span>
            <span className="font-body-sm text-body-sm text-error flex items-center"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> 2.1%</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary-container h-full rounded-full w-[45%]"></div>
          </div>
        </div>
        
        {/* Waived */}
        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover:-translate-y-[3px] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-lg opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-text-tertiary">waving_hand</span>
          </div>
          <h3 className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest mb-sm">Waived (YTD)</h3>
          <div className="flex items-baseline gap-sm mb-lg">
            <span className="font-display-4xl text-display-4xl text-on-surface">$845</span>
            <span className="font-body-sm text-body-sm text-text-tertiary flex items-center">142 items</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-outline-variant h-full rounded-full w-[15%]"></div>
          </div>
        </div>
      </div>

      {/* Detailed Table Section */}
      <div className="bg-bg-surface rounded-xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="px-card-padding py-lg border-b border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Recent Fine Activity</h3>
          <div className="flex items-center gap-sm">
            <div className="relative">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-bg-page border border-border-default rounded-md pl-md pr-xl py-xs font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Waived">Waived</option>
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">expand_more</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-bright">
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Member ID & Name</th>
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Book & Reason</th>
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Amount</th>
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Status</th>
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {mockFines.map(fine => (
                <tr key={fine._id} className="border-b border-border-subtle hover:bg-bg-hover transition-colors">
                  <td className="px-card-padding py-md">
                    <div className="flex items-center gap-md">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-headline-lg text-headline-lg shrink-0 ${
                          fine.status === 'Paid' ? 'bg-tertiary-container text-on-tertiary' :
                          fine.status === 'Waived' ? 'bg-surface-variant text-on-surface-variant' :
                          'bg-primary-container text-on-primary-container'
                      }`}>
                        {fine.member.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{fine.member.name}</div>
                        <div className="font-code-mono text-code-mono text-text-tertiary">{fine.member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-card-padding py-md">
                    <div className="text-on-surface font-medium truncate max-w-[200px]">{fine.book.title}</div>
                    <div className="text-text-secondary">{fine.book.reason}</div>
                  </td>
                  <td className={`px-card-padding py-md font-code-mono text-code-mono ${fine.status === 'Waived' ? 'line-through text-text-tertiary' : 'text-on-surface'}`}>
                    ${fine.amount.toFixed(2)}
                  </td>
                  <td className="px-card-padding py-md">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full font-label-xs text-label-xs ${
                        fine.status === 'Paid' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                        fine.status === 'Waived' ? 'bg-surface-variant text-on-surface-variant' :
                        'bg-secondary-fixed text-on-secondary-fixed'
                    }`}>
                      {fine.status}
                    </span>
                  </td>
                  <td className="px-card-padding py-md text-right">
                    {fine.status === 'Pending' ? (
                      <div className="flex justify-end gap-sm">
                        <button className="px-sm py-xs rounded text-primary hover:bg-surface-container-low transition-colors font-semibold">Mark Paid</button>
                        <button className="px-sm py-xs rounded text-text-secondary hover:bg-surface-container-low transition-colors">Waive</button>
                      </div>
                    ) : (
                      <span className="text-text-tertiary italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-card-padding py-md border-t border-border-subtle bg-bg-surface flex justify-between items-center text-body-sm text-text-secondary">
          <span>Showing 1 to {mockFines.length} of 48 entries</span>
          <div className="flex gap-xs">
            <button className="p-1 rounded hover:bg-bg-hover text-text-tertiary disabled:opacity-50" disabled><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 rounded bg-primary-container text-on-primary-container font-semibold">1</button>
            <button className="w-8 h-8 rounded hover:bg-bg-hover">2</button>
            <button className="w-8 h-8 rounded hover:bg-bg-hover">3</button>
            <button className="p-1 rounded hover:bg-bg-hover"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FineManagement;
