import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-error">{error}</div>;
  if (!data) return null;

  // Process data for charts
  const genreStatsRaw = data.genreStats || {};
  const genreData = Object.keys(genreStatsRaw).map(key => ({
    name: key,
    value: genreStatsRaw[key]
  }));

  const borrowingTrendsRaw = data.borrowingTrends || [];
  const trendData = borrowingTrendsRaw.map(item => ({
    name: item.date,
    borrows: item.borrows
  }));

  const COLORS = ['#5B4FE8', '#fea619', '#00C49F', '#FF8042', '#FFBB28'];

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex flex-col gap-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-2xl text-headline-2xl text-on-surface">Analytics Dashboard (Live)</h2>
          <p className="font-body-sm text-body-sm text-text-secondary mt-xs">Real-time data from ETL Pipeline</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-xl">
        <MetricCard title="Total Books" value={data.totalBooks} icon="menu_book" color="primary" />
        <MetricCard title="Total Members" value={data.totalMembers} icon="group" color="primary" />
        <MetricCard title="Active Borrows" value={data.activeBorrows} icon="swap_horiz" color="tertiary-container" />
        <MetricCard title="Overdue Items" value={data.overdueBorrows} icon="warning" color="error" />
        <MetricCard title="Total Fines" value={`$${data.totalFines?.toFixed(2) || '0.00'}`} icon="payments" color="primary" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        
        {/* Borrowing Trends Chart */}
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle hover:-translate-y-1 transition-transform h-96">
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Borrowing Trends</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="borrows" stroke="#5B4FE8" strokeWidth={3} dot={{r: 4, fill: '#5B4FE8', strokeWidth: 0}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Stats Chart */}
        <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle hover:-translate-y-1 transition-transform h-96">
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Genre Distribution</h3>
          {genreData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary">No genre data available</div>
          )}
        </div>

      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-surface rounded-xl p-card-padding shadow-sm border border-border-subtle hover:-translate-y-1 transition-transform">
      <div className="flex justify-between items-start mb-lg">
        <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">{title}</span>
        <div className={`w-8 h-8 rounded-full bg-surface-container flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-${color} text-[18px]`}>{icon}</span>
        </div>
      </div>
      <div className="font-display-3xl text-display-3xl text-on-surface">{value}</div>
    </div>
  );
};

export default Dashboard;
