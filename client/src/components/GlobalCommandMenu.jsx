import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './ui/command';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Settings,
  Receipt,
  BarChart,
  LogOut,
  ArrowDownToLine,
  Send,
  ArrowRightLeft
} from 'lucide-react';

export function GlobalCommandMenu({ open, setOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  const isManagement = user?.role === 'admin' || user?.role === 'librarian';

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/books'))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Inventory Catalog</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/fines'))}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Fines & Payments</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/reports'))}>
            <BarChart className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        {isManagement && (
          <CommandGroup heading="Circulation & Members">
            <CommandItem onSelect={() => runCommand(() => navigate('/members'))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Manage Members</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/borrow/issue'))}>
              <Send className="mr-2 h-4 w-4" />
              <span>Issue Book</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/borrow/return'))}>
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              <span>Return Book</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/active-borrows'))}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              <span>Active Circulation</span>
            </CommandItem>
          </CommandGroup>
        )}
        
        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Preferences</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => logout())}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
