import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Plus, BellOff, Check } from 'lucide-react';
import api from '../api/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const TopBar = ({ setCommandOpen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };
  
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-4">
        <div 
          className="relative w-full max-w-md cursor-pointer group"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors" />
          <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors group-hover:bg-muted/50 group-hover:border-primary/50 text-muted-foreground pl-9">
            <span className="flex-1 text-left">Search inventory, members...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
              )}
              <span className="sr-only">Notifications</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Mark all read</button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <BellOff className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No new notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-primary/5'}`}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm ${notif.isRead ? 'font-medium' : 'font-semibold text-foreground'}`}>{notif.title}</p>
                      <span className="text-[10px] text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
        
        {user?.role !== 'member' && (
          <button 
            onClick={() => navigate('/borrow/issue')}
            className="hidden sm:inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <Plus className="h-4 w-4" />
            New Transaction
          </button>
        )}
        
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/settings')}>
          {user?.city && (
            <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {user.city}
            </span>
          )}
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-semibold ring-offset-background hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
