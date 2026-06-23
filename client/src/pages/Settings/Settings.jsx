import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('libraryConfig');

  // Library Config State
  const [loanPeriod, setLoanPeriod] = useState(14);
  const [maxBorrows, setMaxBorrows] = useState(5);
  const [fineRate, setFineRate] = useState(0.25);
  const [reservationExpiry, setReservationExpiry] = useState(48);
  const [autoRenew, setAutoRenew] = useState(true);
  const [preDueReminders, setPreDueReminders] = useState(true);
  const [enforceFineCaps, setEnforceFineCaps] = useState(false);

  const tabs = [
    { id: 'profile', icon: 'person', label: 'Profile' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
    { id: 'appearance', icon: 'palette', label: 'Appearance' },
    { id: 'libraryConfig', icon: 'tune', label: 'Library Config' },
  ];

  return (
    <div className="flex-1 max-w-content-max-width w-full mx-auto p-page-padding flex gap-4xl flex-col md:flex-row">
      {/* Settings Sub-Navigation Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col gap-xs sticky top-24">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-md px-md py-3 rounded-lg font-body-sm text-body-sm transition-all w-full text-left ${
                activeTab === tab.id
                  ? 'bg-surface-tint/10 text-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-bg-hover hover:text-primary'
              }`}
            >
              <span 
                className="material-symbols-outlined text-[20px]" 
                style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Settings Content Canvas */}
      <div className="flex-1 flex flex-col gap-4xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-headline-2xl text-headline-2xl text-on-surface mb-xs">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="font-body-sm text-body-sm text-text-secondary">
              {activeTab === 'libraryConfig' && 'Manage global rules, loan limits, and system behaviors for the institution.'}
              {activeTab === 'profile' && 'Update your personal details and public profile information.'}
              {activeTab === 'notifications' && 'Choose what updates you want to receive and how you receive them.'}
              {activeTab === 'appearance' && 'Customize the look and feel of your dashboard.'}
            </p>
          </div>
          <div className="flex gap-sm">
            <button className="bg-surface hover:bg-bg-hover border border-border-default text-primary font-body-sm text-body-sm px-4 py-2 rounded-lg transition-all active:scale-[0.97]">
                Discard Changes
            </button>
            <button className="bg-primary-container text-on-primary font-body-sm text-body-sm px-4 py-2 rounded-lg hover:shadow-[0_4px_14px_0_rgba(91,79,232,0.39)] transition-all active:scale-[0.97]">
                Save Changes
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <section className="bg-surface rounded-xl shadow-sm border border-border-subtle p-card-padding flex flex-col gap-xl">
            <div className="flex items-center gap-xl border-b border-border-subtle pb-xl">
              <div className="w-20 h-20 rounded-full bg-brand-gradient text-white flex items-center justify-center text-2xl font-bold shadow-md">
                LV
              </div>
              <div className="flex gap-sm">
                <button className="bg-surface-container-low border border-border-default px-4 py-2 rounded-md text-sm font-semibold hover:bg-bg-hover transition-colors">Change Avatar</button>
                <button className="text-error hover:bg-error-container/50 px-4 py-2 rounded-md text-sm transition-colors">Remove</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="flex flex-col gap-xs">
                <label className="font-label-xs text-label-xs uppercase text-text-secondary">Full Name</label>
                <input type="text" defaultValue="Librarian Admin" className="border border-border-default rounded-md px-md py-2 text-sm focus:border-primary focus:ring-1 focus:ring-focus-ring outline-none bg-surface-bright" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-xs text-label-xs uppercase text-text-secondary">Email Address</label>
                <input type="email" defaultValue="admin@libravault.io" className="border border-border-default rounded-md px-md py-2 text-sm focus:border-primary focus:ring-1 focus:ring-focus-ring outline-none bg-surface-bright" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-xs text-label-xs uppercase text-text-secondary">Role</label>
                <input type="text" disabled defaultValue="Administrator" className="border border-border-default rounded-md px-md py-2 text-sm bg-surface-container-low text-text-secondary cursor-not-allowed" />
              </div>
            </div>
          </section>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <section className="bg-surface rounded-xl shadow-sm border border-border-subtle p-card-padding">
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xl border-b border-border-subtle pb-md">Email Notifications</h3>
            <div className="flex flex-col gap-xl">
              {[
                { title: 'New Member Registrations', desc: 'Get notified when a new user signs up.' },
                { title: 'Overdue Alerts', desc: 'Receive daily summaries of items that are overdue.' },
                { title: 'System Updates', desc: 'Announcements about new features and maintenance.' }
              ].map((item, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 pr-md">
                      <span className="font-headline-lg text-[16px] text-on-surface">{item.title}</span>
                      <span className="font-body-sm text-[13px] text-text-secondary">{item.desc}</span>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-outline-variant z-10 transition-all duration-300" />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-outline-variant cursor-pointer transition-colors duration-300"></label>
                    </div>
                  </div>
                  {idx < 2 && <div className="h-px w-full bg-border-subtle"></div>}
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <section className="bg-surface rounded-xl shadow-sm border border-border-subtle p-card-padding">
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xl border-b border-border-subtle pb-md">Theme Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="border-2 border-primary rounded-xl p-md flex flex-col gap-sm cursor-pointer relative overflow-hidden group">
                <div className="absolute top-2 right-2 material-symbols-outlined text-primary text-[20px]">check_circle</div>
                <div className="h-24 bg-white border border-gray-200 rounded flex gap-2 p-2">
                  <div className="w-1/4 bg-gray-100 rounded"></div>
                  <div className="w-3/4 bg-blue-50 rounded"></div>
                </div>
                <span className="font-semibold text-center mt-2">Light Mode</span>
              </div>
              <div className="border border-border-default rounded-xl p-md flex flex-col gap-sm cursor-pointer hover:border-text-secondary transition-colors group opacity-60">
                <div className="h-24 bg-gray-900 border border-gray-700 rounded flex gap-2 p-2">
                  <div className="w-1/4 bg-gray-800 rounded"></div>
                  <div className="w-3/4 bg-blue-900/30 rounded"></div>
                </div>
                <span className="font-semibold text-center mt-2">Dark Mode (Coming Soon)</span>
              </div>
              <div className="border border-border-default rounded-xl p-md flex flex-col gap-sm cursor-pointer hover:border-text-secondary transition-colors group">
                <div className="h-24 bg-gradient-to-br from-white to-gray-900 border border-gray-300 rounded flex gap-2 p-2 items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-gray-400">desktop_windows</span>
                </div>
                <span className="font-semibold text-center mt-2">System Sync</span>
              </div>
            </div>
          </section>
        )}

        {/* Library Config Tab (Original Content) */}
        {activeTab === 'libraryConfig' && (
          <>
            {/* Core Rules Card */}
            <section className="bg-surface rounded-xl shadow-sm border border-border-subtle p-card-padding">
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xl border-b border-border-subtle pb-md">Circulation Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                {/* Loan Period */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-xs text-label-xs text-on-surface uppercase text-text-secondary">Standard Loan Period (Days)</label>
                  <div className="flex items-center border border-border-default rounded-md focus-within:border-primary focus-within:ring-[3px] focus-within:ring-focus-ring overflow-hidden bg-surface-bright">
                    <button 
                      className="px-sm py-2 text-text-secondary hover:bg-bg-hover hover:text-primary transition-colors border-r border-border-default active:bg-surface-dim" 
                      onClick={() => setLoanPeriod(Math.max(1, loanPeriod - 1))}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">remove</span>
                    </button>
                    <input 
                      className="w-full text-center border-none focus:ring-0 font-code-mono text-code-mono text-on-surface bg-transparent outline-none" 
                      min="1" 
                      type="number" 
                      value={loanPeriod}
                      onChange={(e) => setLoanPeriod(parseInt(e.target.value) || 0)}
                    />
                    <button 
                      className="px-sm py-2 text-text-secondary hover:bg-bg-hover hover:text-primary transition-colors border-l border-border-default active:bg-surface-dim" 
                      onClick={() => setLoanPeriod(loanPeriod + 1)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  </div>
                  <p className="font-body-sm text-[12px] text-text-tertiary mt-1">Default duration for physical materials.</p>
                </div>

                {/* Max Borrows */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-xs text-label-xs text-on-surface uppercase text-text-secondary">Max Concurrent Borrows</label>
                  <div className="relative">
                    <input 
                      className="w-full border border-border-default rounded-md px-md py-2 font-code-mono text-code-mono text-on-surface focus:border-primary focus:ring-[3px] focus:ring-focus-ring outline-none bg-surface-bright transition-all" 
                      min="1" 
                      type="number" 
                      value={maxBorrows}
                      onChange={(e) => setMaxBorrows(parseInt(e.target.value) || 0)}
                    />
                    <span className="absolute right-md top-1/2 -translate-y-1/2 text-text-tertiary material-symbols-outlined text-[20px]">book_4</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-text-tertiary mt-1">Maximum items a member can hold simultaneously.</p>
                </div>

                {/* Fine Rate */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-xs text-label-xs text-on-surface uppercase text-text-secondary">Overdue Fine Rate (Rs/Day)</label>
                  <div className="relative">
                    <span className="absolute left-md top-1/2 -translate-y-1/2 text-text-secondary font-code-mono">Rs </span>
                    <input 
                      className="w-full border border-border-default rounded-md pl-8 pr-md py-2 font-code-mono text-code-mono text-on-surface focus:border-primary focus:ring-[3px] focus:ring-focus-ring outline-none bg-surface-bright transition-all" 
                      min="0" 
                      step="0.05" 
                      type="number" 
                      value={fineRate}
                      onChange={(e) => setFineRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <p className="font-body-sm text-[12px] text-text-tertiary mt-1">Applied daily per overdue item.</p>
                </div>

                {/* Reservation Expiry */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-xs text-label-xs text-on-surface uppercase text-text-secondary">Reservation Hold Expiry (Hours)</label>
                  <div className="relative">
                    <select 
                      className="w-full border border-border-default rounded-md px-md py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-[3px] focus:ring-focus-ring outline-none bg-surface-bright transition-all appearance-none cursor-pointer"
                      value={reservationExpiry}
                      onChange={(e) => setReservationExpiry(parseInt(e.target.value))}
                    >
                      <option value="24">24 Hours (1 Day)</option>
                      <option value="48">48 Hours (2 Days)</option>
                      <option value="72">72 Hours (3 Days)</option>
                      <option value="168">168 Hours (1 Week)</option>
                    </select>
                    <span className="absolute right-md top-1/2 -translate-y-1/2 text-text-tertiary material-symbols-outlined pointer-events-none text-[20px]">expand_more</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-text-tertiary mt-1">Time before an unclaimed hold is released.</p>
                </div>
              </div>
            </section>

            {/* System Behaviors Card */}
            <section className="bg-surface rounded-xl shadow-sm border border-border-subtle p-card-padding">
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xl border-b border-border-subtle pb-md">System Behaviors & Alerts</h3>
              <div className="flex flex-col gap-xl">
                {/* Toggle Item 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 pr-md">
                    <span className="font-headline-lg text-[16px] text-on-surface">Auto-Renew Eligible Items</span>
                    <span className="font-body-sm text-[13px] text-text-secondary">Automatically renew items on due date if no pending holds exist.</span>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-outline-variant z-10 transition-all duration-300"
                      checked={autoRenew}
                      onChange={(e) => setAutoRenew(e.target.checked)}
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-outline-variant cursor-pointer transition-colors duration-300"></label>
                  </div>
                </div>

                <div className="h-px w-full bg-border-subtle"></div>

                {/* Toggle Item 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 pr-md">
                    <span className="font-headline-lg text-[16px] text-on-surface">Send Pre-due Reminders</span>
                    <span className="font-body-sm text-[13px] text-text-secondary">Email members 48 hours before an item is due.</span>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-outline-variant z-10 transition-all duration-300"
                      checked={preDueReminders}
                      onChange={(e) => setPreDueReminders(e.target.checked)}
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-outline-variant cursor-pointer transition-colors duration-300"></label>
                  </div>
                </div>

                <div className="h-px w-full bg-border-subtle"></div>

                {/* Toggle Item 3 */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 pr-md">
                    <span className="font-headline-lg text-[16px] text-on-surface">Enforce Fine Caps</span>
                    <span className="font-body-sm text-[13px] text-text-secondary">Stop accruing fines when they reach the replacement value of the item.</span>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-outline-variant z-10 transition-all duration-300"
                      checked={enforceFineCaps}
                      onChange={(e) => setEnforceFineCaps(e.target.checked)}
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-outline-variant cursor-pointer transition-colors duration-300"></label>
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-error-container/20 rounded-xl border border-error/20 p-card-padding mt-4xl">
              <h3 className="font-headline-lg text-headline-lg text-on-error-container mb-md">Danger Zone</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">Actions here can result in data loss or significant operational disruption.</p>
              <div className="flex items-center justify-between p-md border border-error/30 rounded-lg bg-surface">
                <div className="flex flex-col gap-1">
                  <span className="font-headline-lg text-[14px] text-on-surface font-semibold">Purge Inactive Members</span>
                  <span className="font-body-sm text-[12px] text-text-secondary">Remove accounts inactive for over 5 years with no pending fines.</span>
                </div>
                <button className="bg-surface hover:bg-error-container/50 border border-error text-error font-body-sm text-body-sm px-4 py-2 rounded-lg transition-all active:scale-[0.97]">
                    Initiate Purge
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
