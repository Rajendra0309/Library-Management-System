import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ActiveBorrows = () => {
  const [filter, setFilter] = useState('All Statuses');
  const [search, setSearch] = useState('');

  // Mock data for Active Borrows
  const mockBorrows = [
    {
      _id: 'b1',
      member: { name: 'Alice Johnson', id: 'ID-8842', initials: 'AJ' },
      book: { title: 'The Design of Everyday Things', isbn: '978-0465050659' },
      issueDate: '2023-10-12',
      dueDate: '2023-11-02',
      status: 'active',
      daysLeft: 12
    },
    {
      _id: 'b2',
      member: { name: 'Marcus Kane', id: 'ID-7109', initials: 'MK' },
      book: { title: 'Introduction to Algorithms', isbn: '978-0262033848' },
      issueDate: '2023-09-01',
      dueDate: '2023-09-22',
      status: 'overdue',
      daysOverdue: 28
    },
    {
      _id: 'b3',
      member: { name: 'Sarah Chen', id: 'ID-9201', initials: 'SC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ0AfvylHx2oxFfxawwp1oRb-KKdovfCl0digaIR0o93_QGFcGpWy08-6-MnY-y_eDwfIGAT9WbXlGOdKKavwK5LC7b7WE5pl6pLrPwn8M2uxVsD5xxv_bmb8A7t3sUkbKcUn-Jfq2AOg70sZ4w60H96B7wvxH6DR_kgCsa9q01fxivt9ztwAYh0529oaD37N90DQ4DUjrvHatjcs7n4GTu2AjmqJEAR1Q3m342QFhrKSR367jjDOGEz8k8ci-7eeq-hVW4AlJCW0' },
      book: { title: 'Sapiens: A Brief History', isbn: '978-0062316097' },
      issueDate: '2023-10-05',
      dueDate: '2023-10-26',
      status: 'due soon',
      daysLeft: 2
    },
    {
      _id: 'b4',
      member: { name: 'David Torres', id: 'ID-4412', initials: 'DT' },
      book: { title: 'Thinking, Fast and Slow', isbn: '978-0374533557' },
      issueDate: '2023-10-18',
      dueDate: '2023-11-08',
      status: 'active',
      daysLeft: 18
    }
  ];

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
      {/* Page Header & Filters */}
      <div className="mb-3xl flex flex-col lg:flex-row lg:items-end justify-between gap-lg">
        <div>
          <h2 className="font-headline-2xl text-headline-2xl text-on-surface mb-xs">Active Borrows</h2>
          <p className="font-body-sm text-text-secondary">Managing {mockBorrows.length} currently circulated items.</p>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[16px]">filter_list</span>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-40 pl-9 pr-8 py-2 bg-bg-surface border border-border-default rounded-[6px] text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring appearance-none"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[16px]">search</span>
            <input 
              className="w-full sm:w-48 pl-9 pr-4 py-2 bg-bg-surface border border-border-default rounded-[6px] text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring" 
              placeholder="Search..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 border border-border-default text-text-secondary rounded-[6px] hover:bg-bg-hover transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
        </div>
      </div>

      {/* Data Table Component */}
      <div className="bg-bg-surface rounded-[14px] shadow-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-bright border-b border-border-subtle font-label-xs text-label-xs text-text-secondary uppercase tracking-[0.06em]">
                <th className="px-2xl py-md font-semibold">Member</th>
                <th className="px-2xl py-md font-semibold">Book Title</th>
                <th className="px-2xl py-md font-semibold">Issue Date</th>
                <th className="px-2xl py-md font-semibold">Due Date</th>
                <th className="px-2xl py-md font-semibold text-center">Status</th>
                <th className="px-2xl py-md font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-on-surface">
              {mockBorrows.map(borrow => (
                <tr key={borrow._id} className={`border-b border-border-subtle transition-colors h-[48px] group ${borrow.status === 'overdue' ? 'bg-error-container/20 hover:bg-error-container/30' : 'hover:bg-bg-hover'}`}>
                  <td className="px-2xl py-sm align-middle">
                    <div className="flex items-center gap-md">
                      {borrow.member.avatar ? (
                        <img src={borrow.member.avatar} alt="Member" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-primary font-medium text-xs">{borrow.member.initials}</div>
                      )}
                      <div>
                        <div className="font-medium">{borrow.member.name}</div>
                        <div className="font-code-mono text-code-mono text-text-tertiary text-[11px]">{borrow.member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2xl py-sm align-middle">
                    <div className="font-medium">{borrow.book.title}</div>
                    <div className="font-code-mono text-code-mono text-text-tertiary text-[11px]">{borrow.book.isbn}</div>
                  </td>
                  <td className="px-2xl py-sm align-middle text-text-secondary">{new Date(borrow.issueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                  <td className={`px-2xl py-sm align-middle ${borrow.status === 'overdue' ? 'text-error font-medium' : 'text-text-secondary'}`}>
                    {new Date(borrow.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-2xl py-sm align-middle text-center">
                    {borrow.status === 'overdue' ? (
                       <span className="inline-flex items-center px-2 py-1 rounded-full bg-error-container text-on-error-container font-medium text-[11px] gap-1">
                         <span className="material-symbols-outlined text-[14px]">warning</span>
                         Overdue ({borrow.daysOverdue}d)
                       </span>
                    ) : borrow.status === 'due soon' ? (
                       <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-fixed/50 text-secondary font-medium text-[11px]">
                         {borrow.daysLeft} Days Left
                       </span>
                    ) : (
                       <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container text-primary font-medium text-[11px]">
                         {borrow.daysLeft} Days Left
                       </span>
                    )}
                  </td>
                  <td className="px-2xl py-sm align-middle text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-sm">
                      {borrow.status === 'overdue' && (
                        <button className="px-3 py-1 bg-surface border border-border-default text-text-secondary hover:text-primary rounded-[6px] text-xs font-medium transition-colors">
                          Notify
                        </button>
                      )}
                      {borrow.status !== 'overdue' && (
                        <button className="p-1.5 text-text-secondary hover:text-primary rounded hover:bg-surface-dim transition-colors tooltip-trigger" title="Renew">
                          <span className="material-symbols-outlined text-[18px]">update</span>
                        </button>
                      )}
                      <button className="p-1.5 text-text-secondary hover:text-tertiary rounded hover:bg-surface-dim transition-colors tooltip-trigger" title="Return">
                        <span className="material-symbols-outlined text-[18px]">keyboard_return</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-surface border-t border-border-subtle px-2xl py-sm flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">Showing 1 to {mockBorrows.length} of {mockBorrows.length} records</span>
          <div className="flex items-center gap-xs">
            <button className="p-1 rounded text-text-tertiary hover:text-primary hover:bg-surface-dim transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="p-1 rounded text-text-secondary hover:text-primary hover:bg-surface-dim transition-colors" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveBorrows;
