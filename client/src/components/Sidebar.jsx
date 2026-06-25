import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import Logo from './ui/Logo';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Send,
  ArrowDownToLine,
  ArrowRightLeft,
  Receipt,
  BarChart,
  Settings,
  ShieldCheck,
  LifeBuoy,
  LogOut,
  Plus
} from 'lucide-react';

const commonNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/books', icon: BookOpen, label: 'Inventory' },
];

const managementNavItems = [
  { path: '/members', icon: Users, label: 'Members' },
  { path: '/borrow/issue', icon: Send, label: 'Issue Book' },
  { path: '/borrow/return', icon: ArrowDownToLine, label: 'Return Book' },
  { path: '/active-borrows', icon: ArrowRightLeft, label: 'Circulation' },
];

const sharedNavItems = [
  { path: '/fines', icon: Receipt, label: 'Fines' },
  { path: '/reports', icon: BarChart, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const adminNavItems = [
  { path: '/staff', icon: ShieldCheck, label: 'Staff' },
];

const NavItem = ({ path, icon: Icon, label }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )
    }
  >
    <Icon className="h-4 w-4" />
    {label}
  </NavLink>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isManagement = user?.role === 'admin' || user?.role === 'librarian';
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="hidden md:flex flex-col h-full border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-[260px] fixed left-0 top-0 z-50">
      {/* Brand */}
      <div className="flex h-16 items-center px-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Logo className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-none text-foreground tracking-tight">LibraVault</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Institutional</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {/* New Record CTA */}
        {isManagement && (
          <div className="px-4 pb-4">
            <button 
              onClick={() => navigate('/books/add')}
              className="w-full inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              <Plus className="h-4 w-4" />
              New Record
            </button>
          </div>
        )}

        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {commonNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}

          {isManagement && (
            <>
              <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Management
              </div>
              {managementNavItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </>
          )}

          <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            System
          </div>
          {sharedNavItems.map((item) => {
            if (item.path === '/reports' && !isManagement) return null;
            return <NavItem key={item.path} {...item} />;
          })}

          {isAdmin && (
            <>
              <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Administration
              </div>
              {adminNavItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </>
          )}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border/40 grid gap-1 mt-auto">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <LifeBuoy className="h-4 w-4" />
          Help Center
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
