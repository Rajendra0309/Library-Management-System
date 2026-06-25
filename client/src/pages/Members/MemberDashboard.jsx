import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemberHistory, getMemberById } from '../../services/memberService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Clock, CalendarDays, Wallet, BookOpen, ArrowRight, MoreVertical } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MemberDashboard = () => {
  const [member, setMember] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || currentUser.role !== 'member') {
        setError('Unauthorized or not a member.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [profileRes, historyRes] = await Promise.all([
           getMemberById(currentUser.id),
           getMemberHistory(currentUser.id)
        ]);

        if (profileRes.success) setMember(profileRes.data);
        if (historyRes.success) setBorrowHistory(historyRes.data);
      } catch (err) {
         if (err.response?.status !== 404) {
             setError(err.response?.data?.message || 'Failed to load dashboard.');
         }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 pb-24">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const activeBorrows = borrowHistory.filter(item => item.status === 'active' || item.status === 'overdue' || !item.returnDate);
  const overdueBorrows = activeBorrows.filter(item => item.status === 'overdue' || new Date(item.dueDate) < new Date());

  const memberName = member?.name || currentUser?.name || 'Member';
  const firstName = memberName.split(' ')[0];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pb-24">
      {/* Header / Welcome Banner */}
      <header className="mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-1">Member Dashboard</p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {firstName} <span className="animate-bounce inline-block origin-bottom-right">👋</span>
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
          Here's a quick overview of your current loans and recommendations from the archive.
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stat 1 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Active Borrows</CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{activeBorrows.length}</span>
              <span className="text-sm text-muted-foreground">/ 5 Limit</span>
            </div>
            {overdueBorrows.length > 0 ? (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-4 w-4" /> {overdueBorrows.length} Overdue
                </p>
            ) : (
                <p className="text-sm text-green-600 dark:text-green-500 mt-2 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> All in good standing
                </p>
            )}
          </CardContent>
        </Card>

        {/* Stat 2 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Next Due Date</CardTitle>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {activeBorrows.length > 0 ? (
               <>
                 <span className="text-4xl font-bold text-foreground">
                    {new Date(Math.min(...activeBorrows.map(b => new Date(b.dueDate).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                 </span>
                 <p className="text-sm text-orange-600 dark:text-orange-500 mt-2 flex items-center gap-1.5 font-medium">
                   <Clock className="h-4 w-4" /> Action needed soon
                 </p>
               </>
            ) : (
               <>
                 <span className="text-4xl font-bold text-muted-foreground">-</span>
                 <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
                   <CheckCircle2 className="h-4 w-4" /> No upcoming dues
                 </p>
               </>
            )}
          </CardContent>
        </Card>

        {/* Stat 3 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Pending Fines</CardTitle>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-4xl font-bold text-foreground">Rs 0.00</span>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
              <AlertCircle className="h-4 w-4" /> Clear account
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Borrows & Recommendations) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Currently Borrowed */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-2xl font-semibold text-foreground tracking-tight">Currently Borrowed</h3>
              <Button variant="link" asChild className="px-0 h-auto font-medium text-primary hover:no-underline">
                <Link to="/profile" className="flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {activeBorrows.length === 0 ? (
                  <Card className="col-span-full border-dashed">
                    <CardContent className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <BookOpen className="h-8 w-8 opacity-20" />
                      <p>You don't have any active borrows right now.</p>
                      <Button variant="outline" className="mt-2">Browse Catalog</Button>
                    </CardContent>
                  </Card>
               ) : (
                  activeBorrows.slice(0, 4).map(borrow => (
                     <Card key={borrow._id} className="overflow-hidden hover:shadow-md transition-all group relative border-border/60">
                       <CardContent className="p-3 flex gap-4 h-full">
                         <div className="w-[80px] h-[110px] rounded-md bg-secondary/50 flex-shrink-0 flex items-center justify-center text-primary/40 relative overflow-hidden">
                           <BookOpen className="h-8 w-8" />
                         </div>
                         <div className="flex flex-col justify-between py-1 pr-1 flex-1">
                           <div>
                             <div className="flex justify-between items-start mb-1">
                               <h4 className="font-semibold text-foreground line-clamp-2 leading-tight">{borrow.bookId?.title || 'Unknown Title'}</h4>
                               <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground -mr-1">
                                 <MoreVertical className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                           <div>
                             <div className="flex items-center gap-1.5 mb-2">
                               <span className={`w-2 h-2 rounded-full ${borrow.status === 'overdue' ? 'bg-destructive' : 'bg-green-500'}`}></span>
                               <span className={`font-mono text-xs font-medium ${borrow.status === 'overdue' ? 'text-destructive' : 'text-green-600 dark:text-green-500'}`}>
                                 Due {new Date(borrow.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                               </span>
                             </div>
                             <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                               <div className={`h-full rounded-full w-[50%] ${borrow.status === 'overdue' ? 'bg-destructive' : 'bg-green-500'}`}></div>
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                  ))
               )}
            </div>
          </section>

          {/* Recommended For You */}
          <section>
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-foreground tracking-tight">Recommended For You</h3>
              <p className="text-sm text-muted-foreground">Based on recent catalog additions</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x">
                {/* Mock Recommendations */}
                <div className="w-[140px] flex-shrink-0 group cursor-pointer snap-start">
                  <div className="w-[140px] h-[190px] rounded-lg bg-secondary/30 overflow-hidden mb-3 border border-border/50 relative flex items-center justify-center text-primary/20 hover:shadow-md transition-all">
                    <BookOpen className="h-10 w-10" />
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary" className="shadow-lg font-semibold tracking-wide rounded-full px-4">Reserve</Button>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">Atomic Habits</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">James Clear</p>
                </div>
                
                <div className="w-[140px] flex-shrink-0 group cursor-pointer snap-start">
                  <div className="w-[140px] h-[190px] rounded-lg bg-secondary/30 overflow-hidden mb-3 border border-border/50 relative flex items-center justify-center text-primary/20 hover:shadow-md transition-all">
                    <BookOpen className="h-10 w-10" />
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary" className="shadow-lg font-semibold tracking-wide rounded-full px-4">Reserve</Button>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">The Lean Startup</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Eric Ries</p>
                </div>
                
                <div className="w-[140px] flex-shrink-0 group cursor-pointer snap-start">
                  <div className="w-[140px] h-[190px] rounded-lg bg-secondary/30 overflow-hidden mb-3 border border-border/50 relative flex items-center justify-center text-primary/20 hover:shadow-md transition-all">
                    <BookOpen className="h-10 w-10" />
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary" className="shadow-lg font-semibold tracking-wide rounded-full px-4">Reserve</Button>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">Clean Code</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Robert C. Martin</p>
                </div>
            </div>
          </section>
        </div>

        {/* Right Column (Activity Timeline) */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {borrowHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity found.
                </div>
              ) : (
                <div className="relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent space-y-6 pl-10 md:pl-0">
                  {borrowHistory.slice(0, 5).map((history, i) => (
                    <div key={history._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-secondary text-secondary-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm absolute left-[-40px] md:left-1/2">
                        {history.returnDate ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="w-full md:w-[calc(50%-2rem)] bg-card border border-border/50 rounded-lg p-3 shadow-sm group-hover:border-border transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-semibold uppercase tracking-wider ${history.returnDate ? 'text-green-600 dark:text-green-500' : 'text-primary'}`}>
                            {history.returnDate ? 'Returned' : 'Borrowed'}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(history.returnDate || history.issueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">{history.bookId?.title || 'Unknown Book'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
