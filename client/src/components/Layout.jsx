import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { LayoutDashboard, BookOpen, ArrowRightLeft, Receipt, User } from 'lucide-react';
import { cn } from '../lib/utils';

const MobileNavItem = ({ path, icon: Icon, label }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      cn(
        "flex flex-col items-center justify-center w-full h-full gap-1 transition-all",
        isActive 
          ? "text-primary scale-105" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )
    }
  >
    <Icon className="h-5 w-5" strokeWidth={2.5} />
    <span className="text-[10px] font-medium tracking-tight">{label}</span>
  </NavLink>
);

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20">
      <Sidebar />
      <main className="flex-1 md:pl-[260px] min-w-0 pb-[64px] md:pb-0 flex flex-col transition-all duration-300">
        <TopBar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 p-6 md:p-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Mobile BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] z-50">
        <MobileNavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <MobileNavItem path="/books" icon={BookOpen} label="Books" />
        <MobileNavItem path="/active-borrows" icon={ArrowRightLeft} label="Circulation" />
        <MobileNavItem path="/fines" icon={Receipt} label="Fines" />
        <MobileNavItem path="/profile" icon={User} label="Profile" />
      </nav>
    </div>
  );
};

export default Layout;
