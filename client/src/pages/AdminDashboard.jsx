import React, { useEffect, useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboardData } from '../services/reportService';
import { getActiveBorrows } from '../services/borrowService';

const COLORS = ['#5B4FE8', '#20B2AA', '#fea619', '#EF4444', '#8B5CF6'];

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, borrowsRes] = await Promise.all([
          getDashboardData().catch(() => ({ data: null })),
          getActiveBorrows().catch(() => ({ data: [] }))
        ]);
        setReport(reportRes.data);
        setRecentBorrows(borrowsRes.data.slice(0, 5));
      } catch (error) {
        console.error("Fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
      return (
          <div className="p-page-padding max-w-[1360px] mx-auto flex items-center justify-center min-h-[60vh]">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  // Format genre stats for pie chart
  const genreData = report?.genreStats ? Object.entries(report.genreStats).map(([name, value]) => ({ name, value })) : [];

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
              <h3 className="font-display-3xl text-display-3xl text-on-surface mt-xs">{report?.totalBooks || 0}</h3>
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
              <h3 className="font-display-3xl text-display-3xl text-on-surface mt-xs">{report?.totalMembers || 0}</h3>
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
              <h3 className="font-display-3xl text-display-3xl text-on-surface mt-xs">{report?.activeBorrows || 0}</h3>
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
              <h3 className="font-display-3xl text-display-3xl text-on-surface mt-xs">Rs {report?.totalFines || 0}</h3>
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
          <div className="flex-1 relative min-h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report?.borrowingTrends || []}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B4FE8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5B4FE8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="borrows" stroke="#5B4FE8" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-xl text-headline-xl text-on-surface">Genre Distribution</h3>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>more_horiz</span>
            </button>
          </div>
          <div className="flex-1 relative min-h-[250px] w-full flex flex-col items-center justify-center">
             {genreData.length > 0 ? (
                 <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={genreData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {genreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {genreData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1 text-xs text-text-secondary">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                 </>
             ) : (
                 <div className="text-text-tertiary text-sm">No genre data available</div>
             )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        <div className="bg-bg-surface rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col">
          <div className="p-card-padding border-b border-border-subtle flex justify-between items-center">
            <h3 className="font-headline-xl text-headline-xl text-on-surface">Recent Borrows</h3>
            <a className="text-primary font-body-sm text-body-sm hover:underline" href="/active-borrows">View All</a>
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
                {recentBorrows.length > 0 ? recentBorrows.map((row) => (
                  <tr key={row.id} className="hover:bg-bg-hover transition-colors group cursor-pointer">
                    <td className="py-md px-lg">
                      <div className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px]">{row.book?.title}</div>
                      <div className="text-text-tertiary">{row.book?.author}</div>
                    </td>
                    <td className="py-md px-lg font-code-mono text-code-mono text-text-secondary">{row.member?.membershipId}</td>
                    <td className="py-md px-lg text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-high text-primary font-label-xs text-label-xs">{row.status}</span>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan="3" className="py-8 text-center text-text-tertiary">No recent borrows</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-xl text-headline-xl text-on-surface">Overdue Alerts</h3>
            <span className="bg-error-container text-error font-label-xs text-label-xs px-2 py-1 rounded-full">{report?.overdueBorrows || 0} Critical</span>
          </div>
          <div className="space-y-md flex-1 overflow-y-auto pr-sm custom-scrollbar">
            {/* Keeping dummy alerts as we don't have an endpoint for specific overdue alerts yet, but updated to look active */}
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
              </div>
            </div>
          </div>
          <button className="w-full mt-md py-sm border border-border-default rounded-lg text-primary font-body-sm text-body-sm hover:bg-surface-container-low transition-colors">
              Notify All Overdue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
