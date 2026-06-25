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
  Plus,
  ChevronLeft,
  ChevronRight
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

const NavItem = ({ path, icon: Icon, label, isCollapsed }) => (
  <NavLink
    to={path}
    title={isCollapsed ? label : undefined}
    className={({ isActive }) =>
      cn(
        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
        isCollapsed ? "justify-center" : "gap-3",
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )
    }
  >
    <Icon className="h-4 w-4 shrink-0" />
    {!isCollapsed && <span>{label}</span>}
  </NavLink>
);

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isManagement = user?.role === 'admin' || user?.role === 'librarian';
  const isAdmin = user?.role === 'admin';

  return (
    <aside className={cn(
      "hidden md:flex flex-col h-full border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed left-0 top-0 z-50 transition-all duration-300",
      isCollapsed ? "w-[80px]" : "w-[260px]"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b border-border/40 relative",
        isCollapsed ? "justify-center px-0" : "px-6"
      )}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center w-full hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
            isCollapsed ? "justify-center" : "gap-3"
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Logo className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-start overflow-hidden text-left">
              <span className="text-base font-semibold leading-none text-foreground tracking-tight whitespace-nowrap">LibraVault</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 whitespace-nowrap">Institutional</span>
            </div>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {/* New Record CTA */}
        {isManagement && (
          <div className="px-4 pb-4">
            <button 
              onClick={() => navigate('/books/add')}
              title={isCollapsed ? "New Record" : undefined}
              className={cn(
                "w-full inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                isCollapsed ? "px-0 gap-0" : "px-4 py-2 gap-2"
              )}>
              <Plus className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>New Record</span>}
            </button>
          </div>
        )}

        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {commonNavItems.map((item) => (
            <NavItem key={item.path} {...item} isCollapsed={isCollapsed} />
          ))}

          {isManagement && (
            <>
              {!isCollapsed && (
                <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Management
                </div>
              )}
              {isCollapsed && <div className="h-4" />}
              {managementNavItems.map((item) => (
                <NavItem key={item.path} {...item} isCollapsed={isCollapsed} />
              ))}
            </>
          )}

          {!isCollapsed && (
            <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              System
            </div>
          )}
          {isCollapsed && <div className="h-4" />}
          {sharedNavItems.map((item) => {
            if (item.path === '/reports' && !isAdmin) return null;
            if (item.path === '/fines' && !isManagement) return null;
            return <NavItem key={item.path} {...item} isCollapsed={isCollapsed} />;
          })}

          {isAdmin && (
            <>
              {!isCollapsed && (
                <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Administration
                </div>
              )}
              {isCollapsed && <div className="h-4" />}
              {adminNavItems.map((item) => (
                <NavItem key={item.path} {...item} isCollapsed={isCollapsed} />
              ))}
            </>
          )}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border/40 grid gap-1 mt-auto">
        <button
          onClick={logout}
          title={isCollapsed ? "Log Out" : undefined}
          className={cn(
            "flex w-full items-center rounded-md py-2 text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors",
            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
