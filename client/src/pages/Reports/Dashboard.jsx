import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, AlertTriangle, IndianRupee, Repeat, Loader2, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/reports/dashboard');
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

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading live dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[60vh] gap-4 text-destructive">
        <AlertTriangle className="h-12 w-12" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

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

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Analytics Dashboard (Live)</h2>
        </div>
        <p className="text-muted-foreground">Real-time data stream from ETL Pipeline</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard title="Total Books" value={data.totalBooks} icon={BookOpen} color="primary" />
        <MetricCard title="Total Members" value={data.totalMembers} icon={Users} color="blue-500" />
        <MetricCard title="Active Borrows" value={data.activeBorrows} icon={Repeat} color="teal-500" />
        <MetricCard title="Overdue Items" value={data.overdueBorrows} icon={AlertTriangle} color="destructive" />
        <MetricCard title="Total Fines" value={`Rs ${data.totalFines?.toFixed(2) || '0.00'}`} icon={IndianRupee} color="amber-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Borrowing Trends Chart */}
        <Card className="flex flex-col h-[450px]">
          <CardHeader>
            <CardTitle>Borrowing Trends</CardTitle>
            <CardDescription>Daily borrowing activity</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickMargin={10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="borrows" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 0}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Genre Stats Chart */}
        <Card className="flex flex-col h-[450px]">
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
            <CardDescription>Breakdown by genre</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-4">
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <BarChart3 className="h-8 w-8 opacity-20" />
                <p>No genre data available</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }) => {
  // Map color names to tailwind classes if needed, or use specific ones
  const colorMap = {
    'primary': 'bg-primary/10 text-primary',
    'blue-500': 'bg-blue-500/10 text-blue-500',
    'teal-500': 'bg-teal-500/10 text-teal-500',
    'destructive': 'bg-destructive/10 text-destructive',
    'amber-500': 'bg-amber-500/10 text-amber-500'
  };
  
  const colorClass = colorMap[color] || 'bg-primary/10 text-primary';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</span>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground break-words">{value}</div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
