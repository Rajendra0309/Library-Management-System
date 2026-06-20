import React, { useEffect } from 'react';

const AdminDashboard = () => {
  useEffect(() => {
    // Count-up animation
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace(/,/g, '');
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc).toLocaleString();
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        
        let observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        }, {threshold: 0.5});
        
        observer.observe(counter);
    });
  }, []);

  return (
    <div className="p-page-padding max-w-[1360px] mx-auto space-y-4xl">
      {/* Header */}
      <div>
        <h2 className="font-display-4xl text-display-4xl text-on-surface">Dashboard Overview</h2>
        <p className="font-body-base text-body-base text-text-secondary mt-xs">Real-time metrics and recent activity for the LibraVault ecosystem.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover-lift relative overflow-hidden group">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <p className="font-label-xs text-label-xs text-text-secondary uppercase">Total Books</p>
              <h3 className="font-display-3xl text-display-3xl text-on-surface mt-xs counter" data-target="12450">0</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="inline-flex items-center gap-1 font-label-xs text-label-xs text-tertiary-container bg-tertiary-fixed-dim/20 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +5.2%
            </span>
            <span className="font-body-sm text-body-sm text-text-tertiary">vs last month</span>
          </div>
        </div>

        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover-lift relative overflow-hidden group">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <p className="font-label-xs text-label-xs text-text-secondary uppercase">Active Members</p>
              <h3 className="font-display-3xl text-display-3xl text-on-surface mt-xs counter" data-target="3892">0</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="inline-flex items-center gap-1 font-label-xs text-label-xs text-tertiary-container bg-tertiary-fixed-dim/20 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +1.8%
            </span>
            <span className="font-body-sm text-body-sm text-text-tertiary">vs last month</span>
          </div>
        </div>

        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover-lift relative overflow-hidden group">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <p className="font-label-xs text-label-xs text-text-secondary uppercase">Active Borrows</p>
              <h3 className="font-display-3xl text-display-3xl text-on-surface mt-xs counter" data-target="845">0</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>swap_horiz</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="inline-flex items-center gap-1 font-label-xs text-label-xs text-error bg-error-container/50 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_down</span> -2.4%
            </span>
            <span className="font-body-sm text-body-sm text-text-tertiary">vs last month</span>
          </div>
        </div>

        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover-lift relative overflow-hidden group">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <p className="font-label-xs text-label-xs text-text-secondary uppercase">Revenue (Fines)</p>
              <h3 className="font-display-3xl text-display-3xl text-on-surface mt-xs">$<span className="counter" data-target="1240">0</span></h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#fef3c7] text-[#f59e0b] flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="inline-flex items-center gap-1 font-label-xs text-label-xs text-tertiary-container bg-tertiary-fixed-dim/20 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12.5%
            </span>
            <span className="font-body-sm text-body-sm text-text-tertiary">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <div className="lg:col-span-8 bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-xl text-headline-xl text-on-surface">Borrowing Activity</h3>
            <div className="flex gap-2">
              <button className="px-md py-xs text-body-sm font-body-sm text-text-secondary hover:bg-bg-hover rounded-md transition-colors">1W</button>
              <button className="px-md py-xs text-body-sm font-body-sm bg-surface-container-low text-primary rounded-md shadow-sm">1M</button>
              <button className="px-md py-xs text-body-sm font-body-sm text-text-secondary hover:bg-bg-hover rounded-md transition-colors">1Y</button>
            </div>
          </div>
          <div className="flex-1 relative min-h-[300px] w-full flex items-center justify-center text-text-tertiary border border-dashed border-border-subtle rounded-lg">
            Chart integration goes here (using Recharts or Chart.js)
          </div>
        </div>

        <div className="lg:col-span-4 bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-xl text-headline-xl text-on-surface">Genre Distribution</h3>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>more_horiz</span>
            </button>
          </div>
          <div className="flex-1 relative min-h-[250px] w-full flex items-center justify-center text-text-tertiary border border-dashed border-border-subtle rounded-lg">
            Donut Chart goes here
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        <div className="bg-bg-surface rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col">
          <div className="p-card-padding border-b border-border-subtle flex justify-between items-center">
            <h3 className="font-headline-xl text-headline-xl text-on-surface">Recent Borrows</h3>
            <a className="text-primary font-body-sm text-body-sm hover:underline" href="#">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-border-subtle">
                  <th className="py-md px-lg font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Book Title</th>
                  <th className="py-md px-lg font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Member ID</th>
                  <th className="py-md px-lg font-label-xs text-label-xs text-text-secondary uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm divide-y divide-border-subtle">
                {[
                  { title: 'The Martian', author: 'Andy Weir', member: 'MBR-8921', status: 'Active' },
                  { title: 'Dune', author: 'Frank Herbert', member: 'MBR-4412', status: 'Active' },
                  { title: 'Project Hail Mary', author: 'Andy Weir', member: 'MBR-9932', status: 'Active' },
                  { title: 'Neuromancer', author: 'William Gibson', member: 'MBR-1024', status: 'Active' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-bg-hover transition-colors group cursor-pointer">
                    <td className="py-md px-lg">
                      <div className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px]">{row.title}</div>
                      <div className="text-text-tertiary">{row.author}</div>
                    </td>
                    <td className="py-md px-lg font-code-mono text-code-mono text-text-secondary">{row.member}</td>
                    <td className="py-md px-lg text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-high text-primary font-label-xs text-label-xs">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-xl text-headline-xl text-on-surface">Overdue Alerts</h3>
            <span className="bg-error-container text-error font-label-xs text-label-xs px-2 py-1 rounded-full">12 Critical</span>
          </div>
          <div className="space-y-md flex-1 overflow-y-auto pr-sm custom-scrollbar">
            <div className="flex items-start gap-md p-md rounded-lg border border-error/20 bg-error-container/10 hover:bg-error-container/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0 text-error">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline-lg text-headline-lg text-on-surface truncate">1984</p>
                <p className="font-body-sm text-body-sm text-text-secondary">MBR-2210 · George Orwell</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-label-xs text-label-xs text-error font-bold">14 Days Late</p>
                <p className="font-code-mono text-code-mono text-text-tertiary text-[10px] mt-xs">Fine: $7.00</p>
              </div>
            </div>

            <div className="flex items-start gap-md p-md rounded-lg border border-secondary-container/20 bg-secondary-container/10 hover:bg-secondary-container/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#fef3c7] flex items-center justify-center shrink-0 text-[#f59e0b]">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline-lg text-headline-lg text-on-surface truncate">Fahrenheit 451</p>
                <p className="font-body-sm text-body-sm text-text-secondary">MBR-5541 · Ray Bradbury</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-label-xs text-label-xs text-[#f59e0b] font-bold">3 Days Late</p>
                <p className="font-code-mono text-code-mono text-text-tertiary text-[10px] mt-xs">Fine: $1.50</p>
              </div>
            </div>
            
            <div className="flex items-start gap-md p-md rounded-lg border border-secondary-container/20 bg-secondary-container/10 hover:bg-secondary-container/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#fef3c7] flex items-center justify-center shrink-0 text-[#f59e0b]">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline-lg text-headline-lg text-on-surface truncate">Brave New World</p>
                <p className="font-body-sm text-body-sm text-text-secondary">MBR-1198 · Aldous Huxley</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-label-xs text-label-xs text-[#f59e0b] font-bold">1 Day Late</p>
                <p className="font-code-mono text-code-mono text-text-tertiary text-[10px] mt-xs">Fine: $0.50</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-md py-sm border border-border-default rounded-lg text-primary font-body-sm text-body-sm hover:bg-surface-container-low transition-colors">
              Notify All (12)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
