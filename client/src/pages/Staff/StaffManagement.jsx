import React, { useState } from 'react';

const StaffManagement = () => {
  const [search, setSearch] = useState('');

  // Mock data for Staff
  const mockStaff = [
    {
      id: 'LV-8821',
      name: 'Eleanor Vance',
      email: 'e.vance@libravault.edu',
      initials: 'EV',
      role: 'Admin',
      department: 'Systems Operations',
      gradient: 'linear-gradient(135deg, #5B4FE8, #A78BFA)',
      roleBg: 'bg-primary-container/10',
      roleColor: 'text-primary-container'
    },
    {
      id: 'LV-9042',
      name: 'Marcus Daly',
      email: 'm.daly@libravault.edu',
      initials: 'MD',
      role: 'Librarian',
      department: 'Rare Books',
      gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
      roleBg: 'bg-info/10',
      roleColor: 'text-info'
    },
    {
      id: 'LV-9105',
      name: 'Sarah Jenkins',
      email: 's.jenkins@libravault.edu',
      initials: 'SJ',
      role: 'Librarian',
      department: 'Circulation Desk',
      gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
      roleBg: 'bg-info/10',
      roleColor: 'text-info'
    }
  ];

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display-3xl text-display-3xl text-on-surface mb-1">Staff Management</h2>
          <p className="font-body-base text-body-base text-text-secondary">Manage library personnel, roles, and access permissions.</p>
        </div>
        <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-body-sm text-body-sm font-semibold hover:shadow-[0_4px_14px_0_rgba(91,79,232,0.39)] active:scale-[0.97] transition-all duration-200">
          <span className="material-symbols-outlined text-sm">add</span>
          Add Staff
        </button>
      </div>

      {/* Toolbar/Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-[14px] shadow-sm border border-border-subtle">
        <div className="relative flex-grow sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">search</span>
          <input 
            className="w-full bg-surface-container-low border border-border-default rounded-[6px] pl-9 pr-3 py-2 font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-focus-ring outline-none transition-all" 
            placeholder="Search staff..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-border-default rounded-[6px] font-body-sm text-body-sm text-on-surface-variant hover:bg-bg-hover transition-colors">
            <span className="material-symbols-outlined text-sm">filter_list</span> Role
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-border-default rounded-[6px] font-body-sm text-body-sm text-on-surface-variant hover:bg-bg-hover transition-colors">
            <span className="material-symbols-outlined text-sm">sort</span> Sort
          </button>
        </div>
      </div>

      {/* Staff Data Table */}
      <div className="bg-surface rounded-[14px] shadow-sm border border-border-subtle overflow-hidden flex-grow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-lowest">
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest hidden md:table-cell">Department</th>
                <th className="px-6 py-4 font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {mockStaff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())).map(staff => (
                <tr key={staff.id} className="hover:bg-bg-hover transition-colors group h-[48px]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-body-sm font-semibold" style={{ background: staff.gradient }}>
                        {staff.initials}
                      </div>
                      <div>
                        <p className="font-body-sm text-body-sm font-semibold text-on-surface">{staff.name}</p>
                        <p className="font-label-xs text-label-xs text-text-secondary lowercase">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-code-mono text-code-mono text-on-surface-variant">{staff.id}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-xs text-label-xs ${staff.roleBg} ${staff.roleColor}`}>{staff.role}</span>
                  </td>
                  <td className="px-6 py-3 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">{staff.department}</td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-text-tertiary hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border-subtle bg-surface-container-lowest">
          <p className="font-body-sm text-body-sm text-text-secondary">Showing 1 to {mockStaff.length} of {mockStaff.length} staff</p>
          <div className="flex items-center gap-1">
            <button className="p-1 text-on-surface-variant hover:bg-bg-hover rounded transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="p-1 text-on-surface-variant hover:bg-bg-hover rounded transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
