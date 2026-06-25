import React, { useEffect, useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { getDashboardData } from '../../services/reportService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, AlertTriangle, IndianRupee, Download, TrendingUp, TrendingDown, Calendar, Loader2, MoreVertical } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last-30');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading analytics...</p>
      </div>
    );
  }

  const genreData = report?.genreStats ? Object.entries(report.genreStats).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex flex-col gap-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground mt-1">Overview of library performance and activity.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30">Last 30 Days</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Books</span>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{report?.totalBooks || 0}</div>
            <div className="flex items-center gap-1.5 mt-3 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-emerald-500">+14.2%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Members</span>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{report?.totalMembers || 0}</div>
            <div className="flex items-center gap-1.5 mt-3 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-emerald-500">+5.1%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overdue Items</span>
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{report?.overdueBorrows || 0}</div>
            <div className="flex items-center gap-1.5 mt-3 text-sm">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-emerald-500">-2.4%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Fines Collected</span>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">Rs {report?.totalFines || 0}</div>
            <div className="flex items-center gap-1.5 mt-3 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-emerald-500">+8.9%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Borrowing Trends Chart */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle>Borrowing Trends</CardTitle>
              <CardDescription>Daily checkout volume over time</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-grow min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report?.borrowingTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="borrows" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Genre Distribution Chart */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle>Genre Distribution</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center min-h-[300px]">
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontWeight: '500' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                <BookOpen className="h-8 w-8 opacity-20" />
                <p>No genre data available</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Reports;
