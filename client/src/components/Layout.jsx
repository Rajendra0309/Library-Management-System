import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  return (
    <div className="bg-bg-page text-on-surface font-body-base antialiased min-h-screen flex">
      <Sidebar />
      <main className="flex-1 md:ml-[256px] min-w-0 pb-[80px] md:pb-0">
        <TopBar />
        {/* Main Content Canvas */}
        <Outlet />
      </main>
      
      {/* Mobile BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-[64px] bg-bg-surface border-t border-border-subtle shadow-lg z-50">
        <a className="flex flex-col items-center justify-center text-primary font-bold w-full h-full hover:bg-bg-hover active:scale-95 transition-transform" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="font-label-xs text-label-xs mt-xs">Dashboard</span>
        </a>
        <a className="flex flex-col items-center justify-center text-text-secondary w-full h-full hover:bg-bg-hover active:scale-95 transition-transform" href="/books">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>book</span>
          <span className="font-label-xs text-label-xs mt-xs">Books</span>
        </a>
        <a className="flex flex-col items-center justify-center text-text-secondary w-full h-full hover:bg-bg-hover active:scale-95 transition-transform" href="/borrows">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shortcut</span>
          <span className="font-label-xs text-label-xs mt-xs">Borrow</span>
        </a>
        <a className="flex flex-col items-center justify-center text-text-secondary w-full h-full hover:bg-bg-hover active:scale-95 transition-transform" href="/fines">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>payments</span>
          <span className="font-label-xs text-label-xs mt-xs">Fines</span>
        </a>
        <a className="flex flex-col items-center justify-center text-text-secondary w-full h-full hover:bg-bg-hover active:scale-95 transition-transform" href="/profile">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
          <span className="font-label-xs text-label-xs mt-xs">Profile</span>
        </a>
      </nav>
    </div>
  );
};

export default Layout;
