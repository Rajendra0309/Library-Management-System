import React from 'react';

const TopBar = () => {
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
        
        <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-headline-lg text-headline-lg hover:brand-glow transition-all active:scale-95 flex items-center gap-sm shadow-sm">
          New Transaction
        </button>
        
        <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-border-default cursor-pointer">
          <img 
            alt="Member Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9_TBLoCHMAM1mbU1IFORN77Xd7jnzb_bu_e-RxCY_MvglfWfGIPRe6BZtUfUJd1lLXxt6Ptospgr7OOwtZCJUuezklAvmfFzTarHHgPHw80IN6irhMwsCWgKTvRgGq462CavKs78QGAnjrNn21kC8oXTR_fm02UBtOeJmEebV88Uqbu2oZIwZRe1nTwQ0JLVQWXBDRwUYaJ3yQCJn2o2yrNhJZDrnn9_JEvXqB9uV5i0GGzEgo5i72KlEBB_GdMIvXbAFRvnNojo"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
