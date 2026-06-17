import React from 'react';

const Reports = () => {
  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex flex-col gap-4xl">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg">
        <div>
          <h2 className="font-headline-2xl text-headline-2xl text-on-surface">Reports & Analytics</h2>
          <p className="font-body-sm text-body-sm text-text-secondary mt-xs">Overview of library performance and activity.</p>
        </div>
        <div className="flex items-center gap-sm w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <select className="w-full md:w-auto appearance-none bg-surface border border-border-default rounded-lg px-md py-sm pr-4xl font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring cursor-pointer">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
            <span className="material-symbols-outlined absolute right-md top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none text-[16px]">calendar_today</span>
          </div>
          <button className="flex items-center justify-center gap-xs bg-surface border border-border-default rounded-lg px-md py-sm font-body-sm text-body-sm text-primary hover:bg-bg-hover transition-colors whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Total Circulation</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">swap_horiz</span>
            </div>
          </div>
          <div className="font-display-3xl text-display-3xl text-on-surface">12,482</div>
          <div className="flex items-center gap-xs mt-sm">
            <span className="material-symbols-outlined text-tertiary-container text-[16px]">trending_up</span>
            <span className="font-body-sm text-body-sm text-tertiary-container font-semibold">+14.2%</span>
            <span className="font-body-sm text-body-sm text-text-tertiary ml-xs">vs last period</span>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Active Members</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">group</span>
            </div>
          </div>
          <div className="font-display-3xl text-display-3xl text-on-surface">3,851</div>
          <div className="flex items-center gap-xs mt-sm">
            <span className="material-symbols-outlined text-tertiary-container text-[16px]">trending_up</span>
            <span className="font-body-sm text-body-sm text-tertiary-container font-semibold">+5.1%</span>
            <span className="font-body-sm text-body-sm text-text-tertiary ml-xs">vs last period</span>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Overdue Items</span>
            <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-error-container text-[18px]">warning</span>
            </div>
          </div>
          <div className="font-display-3xl text-display-3xl text-on-surface">142</div>
          <div className="flex items-center gap-xs mt-sm">
            <span className="material-symbols-outlined text-error text-[16px]">trending_down</span>
            <span className="font-body-sm text-body-sm text-error font-semibold">-2.4%</span>
            <span className="font-body-sm text-body-sm text-text-tertiary ml-xs">vs last period</span>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Fines Collected</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            </div>
          </div>
          <div className="font-display-3xl text-display-3xl text-on-surface">$1,240</div>
          <div className="flex items-center gap-xs mt-sm">
            <span className="material-symbols-outlined text-tertiary-container text-[16px]">trending_up</span>
            <span className="font-body-sm text-body-sm text-tertiary-container font-semibold">+8.9%</span>
            <span className="font-body-sm text-body-sm text-text-tertiary ml-xs">vs last period</span>
          </div>
        </div>
      </div>

      {/* 2x3 Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-xl">
        {/* 1. Borrowing Trends */}
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle col-span-1 lg:col-span-2 xl:col-span-2 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Borrowing Trends</h3>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
          <div className="flex-grow min-h-[240px] relative rounded-lg overflow-hidden border border-border-subtle flex items-end" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-primary-fixed-dim/20 to-transparent"></div>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,100 L0,60 Q10,50 20,65 T40,40 T60,55 T80,30 T100,45 L100,100 Z" fill="url(#indigoGradient)" opacity="0.4"></path>
              <path d="M0,60 Q10,50 20,65 T40,40 T60,55 T80,30 T100,45" fill="none" stroke="#5B4FE8" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
              <defs>
                <linearGradient id="indigoGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#5B4FE8"></stop>
                  <stop offset="100%" stopColor="rgba(91, 79, 232, 0)"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 2. Top Titles */}
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle col-span-1 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Top Titles</h3>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
          <div className="flex-grow flex flex-col gap-md">
            <div>
              <div className="flex justify-between text-body-sm font-body-sm text-on-surface mb-xs">
                <span className="truncate pr-sm">The Midnight Library</span>
                <span className="font-code-mono text-text-secondary">342</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-body-sm font-body-sm text-on-surface mb-xs">
                <span className="truncate pr-sm">Dune</span>
                <span className="font-code-mono text-text-secondary">289</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary/80 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-body-sm font-body-sm text-on-surface mb-xs">
                <span className="truncate pr-sm">Project Hail Mary</span>
                <span className="font-code-mono text-text-secondary">245</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary/60 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-body-sm font-body-sm text-on-surface mb-xs">
                <span className="truncate pr-sm">1984</span>
                <span className="font-code-mono text-text-secondary">190</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary/40 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Genre Distribution */}
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle col-span-1 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Genre Distribution</h3>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
          <div className="flex-grow flex items-center justify-center relative min-h-[200px]">
            <div className="w-40 h-40 rounded-full border-[16px] border-surface-container relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[16px] border-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 50% 50%)', transform: 'rotate(45deg)' }}></div>
              <div className="absolute inset-0 rounded-full border-[16px] border-secondary-container" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 0 100%, 0 0)', transform: 'rotate(45deg)' }}></div>
              <div className="text-center bg-surface w-full h-full rounded-full absolute -inset-[16px] flex flex-col items-center justify-center m-auto shadow-inner" style={{ width: 'calc(100% - 32px)', height: 'calc(100% - 32px)' }}>
                <span className="font-display-3xl text-display-3xl text-on-surface">12</span>
                <span className="font-label-xs text-label-xs text-text-secondary uppercase">Genres</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-sm mt-md">
            <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="font-label-xs text-label-xs text-text-secondary">Fiction</span></div>
            <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-secondary-container"></div><span className="font-label-xs text-label-xs text-text-secondary">Non-Fiction</span></div>
          </div>
        </div>

        {/* 4. Fine Collection */}
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle col-span-1 lg:col-span-2 xl:col-span-1 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Fine Collection</h3>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
          <div className="flex-grow min-h-[200px] flex items-end justify-between gap-sm border-b border-border-subtle pb-xs pt-4xl">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <div key={day} className="w-1/6 flex flex-col justify-end h-full gap-xs">
                <div className="w-full bg-error/80 rounded-t-sm" style={{ height: `${[20, 10, 30, 5, 15][i]}%` }}></div>
                <div className="w-full bg-primary rounded-t-sm" style={{ height: `${[40, 60, 30, 80, 50][i]}%` }}></div>
                <span className="text-center font-label-xs text-label-xs text-text-secondary mt-xs">{day}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-lg mt-md">
            <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="font-label-xs text-label-xs text-text-secondary">Collected</span></div>
            <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-error/80"></div><span className="font-label-xs text-label-xs text-text-secondary">Outstanding</span></div>
          </div>
        </div>

        {/* 5. Member Growth */}
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle col-span-1 lg:col-span-1 xl:col-span-1 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Member Growth</h3>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
          <div className="flex-grow min-h-[200px] relative border border-border-subtle rounded-lg" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <svg className="absolute inset-0 w-full h-full p-4" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 L20,75 L40,60 L60,65 L80,40 L100,20" fill="none" stroke="#fea619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" vectorEffect="non-scaling-stroke"></path>
              <circle cx="0" cy="80" fill="#ffffff" r="3" stroke="#fea619" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
              <circle cx="20" cy="75" fill="#ffffff" r="3" stroke="#fea619" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
              <circle cx="40" cy="60" fill="#ffffff" r="3" stroke="#fea619" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
              <circle cx="60" cy="65" fill="#ffffff" r="3" stroke="#fea619" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
              <circle cx="80" cy="40" fill="#ffffff" r="3" stroke="#fea619" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
              <circle cx="100" cy="20" fill="#ffffff" r="3" stroke="#fea619" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
