import React, { useEffect, useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { getDashboardData } from '../../services/reportService';

const COLORS = ['#5B4FE8', '#20B2AA', '#fea619', '#EF4444', '#8B5CF6'];

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportRes = await getDashboardData();
        setReport(reportRes.data);
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
          <div className="flex-1 w-full flex items-center justify-center min-h-[60vh]">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  const genreData = report?.genreStats ? Object.entries(report.genreStats).map(([name, value]) => ({ name, value })) : [];

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
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Total Books</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
            </div>
          </div>
          <div className="font-display-3xl text-display-3xl text-on-surface">{report?.totalBooks || 0}</div>
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
          <div className="font-display-3xl text-display-3xl text-on-surface">{report?.totalMembers || 0}</div>
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
          <div className="font-display-3xl text-display-3xl text-on-surface">{report?.overdueBorrows || 0}</div>
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
          <div className="font-display-3xl text-display-3xl text-on-surface">Rs {report?.totalFines || 0}</div>
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
          <div className="flex-grow min-h-[240px] relative rounded-lg border border-border-subtle p-2">
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

        {/* 3. Genre Distribution */}
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle col-span-1 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Genre Distribution</h3>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
          <div className="flex-grow flex items-center justify-center relative min-h-[240px]">
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
                </>
             ) : (
                 <div className="text-text-tertiary text-sm">No genre data available</div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
