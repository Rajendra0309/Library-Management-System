import React, { useEffect, useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboardData } from '../services/reportService';
import { getActiveBorrows } from '../services/borrowService';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { 
  BookOpen, 
  Users, 
  ArrowRightLeft, 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1M');

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
      <div className="space-y-6">
        <PageHeader 
          title="Dashboard Overview" 
          description="Real-time metrics and recent activity for the LibraVault ecosystem."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 h-[400px]">
             <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
             <CardContent><Skeleton className="h-full w-full" /></CardContent>
          </Card>
          <Card className="lg:col-span-4 h-[400px]">
             <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
             <CardContent><Skeleton className="h-full w-full rounded-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Format genre stats for pie chart
  const genreData = report?.genreStats ? Object.entries(report.genreStats).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <PageHeader 
        title="Dashboard Overview" 
        description="Real-time metrics and recent activity for the LibraVault ecosystem."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group border-border/40 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Books</CardTitle>
            <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{report?.totalBooks || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-transparent rounded-sm px-1 font-mono">
                <TrendingUp className="w-3 h-3 mr-1" /> +5.2%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-border/40 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Members</CardTitle>
            <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{report?.totalMembers || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-transparent rounded-sm px-1 font-mono">
                <TrendingUp className="w-3 h-3 mr-1" /> +1.8%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-border/40 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Borrows</CardTitle>
            <div className="w-8 h-8 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{report?.activeBorrows || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-transparent rounded-sm px-1 font-mono">
                <TrendingDown className="w-3 h-3 mr-1" /> -2.4%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-border/40 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue (Fines)</CardTitle>
            <div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">₹ {report?.totalFines || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-transparent rounded-sm px-1 font-mono">
                <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 flex flex-col border-border/40 shadow-sm bg-background/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-1">
              <CardTitle>Borrowing Activity</CardTitle>
              <CardDescription>Monthly borrowing trends across all categories</CardDescription>
            </div>
            <div className="flex items-center bg-muted rounded-md p-1">
              <Button variant={timeRange === '1W' ? 'secondary' : 'ghost'} onClick={() => setTimeRange('1W')} size="sm" className={`h-7 text-xs px-2 ${timeRange === '1W' ? 'shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>1W</Button>
              <Button variant={timeRange === '1M' ? 'secondary' : 'ghost'} onClick={() => setTimeRange('1M')} size="sm" className={`h-7 text-xs px-2 ${timeRange === '1M' ? 'shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>1M</Button>
              <Button variant={timeRange === '1Y' ? 'secondary' : 'ghost'} onClick={() => setTimeRange('1Y')} size="sm" className={`h-7 text-xs px-2 ${timeRange === '1Y' ? 'shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>1Y</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report?.borrowingTrends || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--background))', 
                      color: 'hsl(var(--foreground))',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Area type="monotone" dataKey="borrows" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 flex flex-col border-border/40 shadow-sm bg-background/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-1">
              <CardTitle>Genre Distribution</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pb-6">
             {genreData.length > 0 ? (
                 <>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genreData}
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          >
                            {genreData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: '1px solid hsl(var(--border))', 
                              backgroundColor: 'hsl(var(--background))',
                              color: 'hsl(var(--foreground))',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                            }} 
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {genreData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                 </>
             ) : (
                 <div className="text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
                    <PieChart className="w-12 h-12 mb-2 text-muted-foreground/30" />
                    No genre data available
                 </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Borrows</CardTitle>
              <CardDescription>Latest borrowing activity</CardDescription>
            </div>
            <Button variant="link" asChild className="text-primary pr-0">
              <Link to="/active-borrows">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6">Book Title</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead className="text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBorrows.length > 0 ? recentBorrows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell className="pl-6 py-3">
                      <div className="font-medium text-foreground truncate max-w-[250px]">{row.book?.title}</div>
                      <div className="text-xs text-muted-foreground">{row.book?.author}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground py-3">
                      {row.member?.membershipId}
                    </TableCell>
                    <TableCell className="text-right pr-6 py-3">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-transparent font-normal">
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No recent borrows
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1 flex flex-col border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-rose-900 dark:text-rose-400">Overdue Alerts</CardTitle>
              <CardDescription className="text-rose-600/70 dark:text-rose-400/70">Requires immediate attention</CardDescription>
            </div>
            <Badge variant="destructive" className="bg-rose-500">
              {report?.overdueBorrows || 0} Critical
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {/* Dummy alert to show styling */}
              <div className="flex items-start gap-3 p-3 rounded-lg border border-rose-200 dark:border-rose-800/50 bg-white dark:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-700/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">1984</p>
                  <p className="text-xs text-muted-foreground">MBR-2210 · George Orwell</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">14 Days Late</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border-rose-200 text-rose-700 hover:bg-rose-100 dark:border-rose-800/50 dark:text-rose-400 dark:hover:bg-rose-900/30">
              Notify All Overdue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
