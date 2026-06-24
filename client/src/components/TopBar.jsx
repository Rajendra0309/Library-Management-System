import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <header className="hidden md:flex justify-between items-center px-page-padding w-full sticky top-0 z-40 h-[56px] bg-bg-surface border-b border-border-subtle">
      <div className="flex items-center w-1/3">
        <div className="relative w-full max-w-md">
          <span 
            className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-text-secondary" 
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            search
          </span>
          <input 
            className="w-full pl-4xl pr-md py-sm rounded-lg border border-border-default bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all font-body-sm text-body-sm" 
            placeholder="Search inventory, members, or transactions..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-xl">
        <button className="text-text-secondary hover:text-primary transition-colors active:opacity-80">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
        </button>
        <button className="text-text-secondary hover:text-primary transition-colors active:opacity-80">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>settings</span>
        </button>
        
        <div className="w-px h-6 bg-border-default"></div>
        
        <button 
          onClick={() => navigate('/borrow/issue')}
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-headline-lg text-headline-lg hover:brand-glow transition-all active:scale-95 flex items-center gap-sm shadow-sm">
          New Transaction
        </button>
        
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold border border-border-default cursor-pointer">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
