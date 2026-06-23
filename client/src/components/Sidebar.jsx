import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Nav items visible to ALL authenticated roles
const commonNavItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/books', icon: 'menu_book', label: 'Inventory' },
];

// Nav items for Librarians and Admins only
const managementNavItems = [
  { path: '/members', icon: 'group', label: 'Members' },
  { path: '/borrow/issue', icon: 'input', label: 'Issue Book' },
  { path: '/borrow/return', icon: 'output', label: 'Return Book' },
  { path: '/active-borrows', icon: 'swap_horiz', label: 'Circulation' },
];

const sharedNavItems = [
  { path: '/fines', icon: 'payments', label: 'Fines' },
  { path: '/reports', icon: 'analytics', label: 'Reports' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

// Nav items visible ONLY to admin
const adminNavItems = [
  { path: '/staff', icon: 'badge', label: 'Staff' },
];

const NavItem = ({ path, icon, label }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      `flex items-center gap-md px-md py-sm rounded-lg font-body-base text-body-base transition-colors ${isActive
        ? 'bg-surface-container-low text-primary'
        : 'text-text-secondary hover:bg-bg-hover hover:text-primary'
      }`
    }
  >
    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
      {icon}
    </span>
    {label}
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isManagement = user?.role === 'admin' || user?.role === 'librarian';
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="hidden md:flex flex-col h-full border-r border-border-subtle bg-bg-sidebar shadow-sm fixed left-0 top-0 w-[256px] transition-all duration-300 z-50">
      {/* Brand */}
      <div className="p-2xl flex items-center gap-md border-b border-border-subtle">
        <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center text-on-primary font-bold shadow-sm">
          LV
        </div>
        <div>
          <h1 className="font-display-3xl text-display-3xl font-bold text-primary m-0">LibraVault</h1>
          <p className="font-label-xs text-label-xs text-text-secondary uppercase m-0">Institutional Access</p>
        </div>
      </div>

      {/* New Record CTA - Admin/Librarian only */}
      {isManagement && (
        <div className="p-lg">
          <button className="w-full bg-primary text-on-primary rounded-lg py-md px-lg font-headline-lg text-headline-lg hover:brand-glow transition-all active:scale-95 flex items-center justify-center gap-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
            New Record
          </button>
        </div>
      )}

      {/* Main Nav */}
      <nav className={`flex-1 px-lg py-sm overflow-y-auto space-y-xs ${!isManagement ? 'mt-4' : ''}`}>
        {commonNavItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        {isManagement && managementNavItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        {sharedNavItems.map((item) => {
          // Hide reports for members based on user's 403 screenshot
          if (item.path === '/reports' && !isManagement) return null;
          return <NavItem key={item.path} {...item} />;
        })}

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <div className="pt-md pb-xs px-md">
              <p className="font-label-xs text-label-xs text-text-tertiary uppercase tracking-widest">
                Administration
              </p>
            </div>
            {adminNavItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom: Help + Logout */}
      <div className="p-lg border-t border-border-subtle mt-auto space-y-xs">
        <a
          className="flex items-center gap-md px-md py-sm text-text-secondary hover:bg-bg-hover hover:text-primary transition-colors rounded-lg font-body-base text-body-base"
          href="#"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>help</span>
          Help Center
        </a>
        <button
          className="w-full flex items-center gap-md px-md py-sm text-error hover:bg-error-container transition-colors rounded-lg font-body-base text-body-base"
          onClick={logout}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
