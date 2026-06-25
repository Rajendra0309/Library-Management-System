import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Settings, Plus } from 'lucide-react';

const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search inventory, members, or transactions..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </button>
        
        <button 
          onClick={() => navigate('/settings')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </button>
        
        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
        
        <button 
          onClick={() => navigate('/borrow/issue')}
          className="hidden sm:inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Plus className="h-4 w-4" />
          New Transaction
        </button>
        
        <div 
          onClick={() => navigate('/profile')}
          className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-semibold cursor-pointer ring-offset-background hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
