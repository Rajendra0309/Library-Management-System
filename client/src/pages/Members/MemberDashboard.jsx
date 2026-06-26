import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemberHistory, getMemberById, getMemberRecommendations } from '../../services/memberService';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Clock, CalendarDays, Wallet, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '@/components/ui/badge';

const MemberDashboard = () => {
  const { user: currentUser } = useAuth();
  const [member, setMember] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || currentUser.role !== 'member') {
        setError('Unauthorized or not a member.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let m = null;
        try {
           const profileRes = await getMemberById(currentUser.id);
           if (profileRes.success) m = profileRes.data;
        } catch (err) {
           console.error("Profile load error", err);
        }
        setMember(m);

        let h = [];
        try {
           const historyRes = await getMemberHistory(currentUser.id);
           if (historyRes.success) h = historyRes.data;
        } catch (err) {
           console.error("History load error", err);
           setError('Failed to load full borrowing history.');
        }
        setBorrowHistory(h);

        try {
           const recRes = await getMemberRecommendations(currentUser.id);
           if (recRes.success) setRecommendations(recRes.data);
        } catch (err) {
           console.error("Recommendations load error", err);
        }

      } catch (err) {
        setError('Failed to load dashboard. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.id, currentUser?.role]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        <PageHeader title="Member Dashboard" description="Here's a quick overview of your current loans and borrowing activity." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const activeBorrows = borrowHistory.filter(item => item.status === 'active' || item.status === 'overdue' || !item.returnDate);
  const overdueBorrows = activeBorrows.filter(item => item.status === 'overdue' || new Date(item.dueDate) < new Date());

  const totalFines = borrowHistory.reduce((acc, borrow) => {
    return acc + (borrow.fines ? borrow.fines.reduce((sum, f) => sum + (f.status === 'pending' ? f.amount : 0), 0) : 0);
  }, 0);

  const calculateDaysLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const memberName = member?.name || currentUser?.name || 'Member';
  const firstName = memberName.split(' ')[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PageHeader 
        title={<>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {firstName} <span className="animate-bounce inline-block origin-bottom-right">👋</span></>} 
        description="Here's a quick overview of your current loans and borrowing activity."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stat 1 */}
        <Card className="relative overflow-hidden group border-border/40 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Borrows</CardTitle>
            <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{activeBorrows.length}</span>
              <span className="text-sm text-muted-foreground">/ 5 Limit</span>
            </div>
            {overdueBorrows.length > 0 ? (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-transparent rounded-sm px-1 font-mono">
                    <AlertCircle className="w-3 h-3 mr-1" /> {overdueBorrows.length} Overdue
                  </Badge>
                </div>
            ) : (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-transparent rounded-sm px-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> All in good standing
                  </Badge>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Stat 2 */}
        <Card className="relative overflow-hidden group border-border/40 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Due Date</CardTitle>
            <div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            {activeBorrows.length > 0 ? (
               <>
                 <span className="text-3xl font-bold tracking-tight text-foreground">
                    {new Date(Math.min(...activeBorrows.map(b => new Date(b.dueDate).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                 </span>
                 <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-transparent rounded-sm px-1 font-mono">
                    <Clock className="w-3 h-3 mr-1" /> Action needed soon
                  </Badge>
                 </div>
               </>
            ) : (
               <>
                 <span className="text-3xl font-bold tracking-tight text-muted-foreground">-</span>
                 <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-transparent rounded-sm px-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> No upcoming dues
                  </Badge>
                 </div>
               </>
            )}
          </CardContent>
        </Card>

        {/* Stat 3 */}
        <Card className="relative overflow-hidden group border-border/40 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Fines</CardTitle>
            <div className="w-8 h-8 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tight text-foreground">₹ {totalFines.toFixed(2)}</span>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-transparent rounded-sm px-1 font-mono">
                <AlertCircle className="w-3 h-3 mr-1" /> Please pay at counter
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Borrows & AI Recommendations) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Currently Borrowed */}
          <Card className="flex flex-col border-border/40 shadow-sm bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle>Currently Borrowed</CardTitle>
                <CardDescription>Books you are currently reading</CardDescription>
              </div>
              <Button variant="link" asChild className="text-primary pr-0">
                <Link to="/books">Browse Catalog</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {activeBorrows.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground flex flex-col items-center gap-2 border border-dashed rounded-lg bg-muted/20">
                        <BookOpen className="h-8 w-8 opacity-20" />
                        <p>You don't have any active borrows right now.</p>
                        <Button variant="outline" className="mt-2" asChild><Link to="/books">Browse Catalog</Link></Button>
                    </div>
                 ) : (
                    activeBorrows.map(borrow => (
                       <div key={borrow.id} className="flex gap-4 p-3 rounded-lg border border-border/50 bg-card hover:border-border transition-colors group">
                         <div className="w-16 h-24 rounded-md bg-secondary/50 flex-shrink-0 flex items-center justify-center text-primary/40 relative overflow-hidden">
                           {borrow.book?.coverImage ? (
                             <img src={borrow.book.coverImage} className="w-full h-full object-cover" alt="Cover" />
                           ) : (
                             <BookOpen className="h-6 w-6" />
                           )}
                         </div>
                         <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                           <div>
                             <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">{borrow.book?.title || 'Unknown Title'}</h4>
                             <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{borrow.book?.author || 'Unknown Author'}</p>
                           </div>
                           <div className="mt-2 flex items-center justify-between">
                             <div className="flex items-center gap-1.5">
                               <span className={`w-2 h-2 rounded-full ${borrow.status === 'overdue' || calculateDaysLeft(borrow.dueDate) < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                               <span className={`text-xs font-medium ${borrow.status === 'overdue' || calculateDaysLeft(borrow.dueDate) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-500'}`}>
                                 {calculateDaysLeft(borrow.dueDate) < 0 ? `${Math.abs(calculateDaysLeft(borrow.dueDate))} days overdue` : `${calculateDaysLeft(borrow.dueDate)} days left`}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                    ))
                 )}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="flex flex-col border-emerald-200 dark:border-emerald-900/50 shadow-sm bg-emerald-50/30 dark:bg-emerald-950/10">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-400">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  Recommended For You
                </CardTitle>
                <CardDescription className="text-emerald-700/70 dark:text-emerald-400/70">
                  Based on your borrowing history
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {recommendations.slice(0, 3).map(book => (
                    <Link key={book.id} to={`/books/${book.id}`} className="flex flex-col gap-3 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors">
                      <div className="w-full h-32 rounded-md bg-emerald-100/50 dark:bg-emerald-900/20 flex items-center justify-center overflow-hidden">
                        {book.coverImage ? (
                          <img src={book.coverImage} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                          <BookOpen className="h-8 w-8 text-emerald-600/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground line-clamp-1">{book.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                        {book.genre && book.genre[0] && (
                          <Badge variant="outline" className="mt-2 text-[10px] px-1.5 py-0 bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                            {book.genre[0]}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground text-sm flex flex-col items-center">
                  <BookOpen className="w-8 h-8 mb-2 opacity-20" />
                  <p>Read more books to get personalized recommendations!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Activity Timeline) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col border-border/40 shadow-sm bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest library transactions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {borrowHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity found.
                </div>
              ) : (
                <div className="relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent space-y-6 pl-10">
                  {borrowHistory.slice(0, 10).map((history) => (
                    <div key={history.id} className="relative flex items-center justify-between group">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-secondary text-secondary-foreground shrink-0 shadow-sm absolute -left-10">
                        {history.returnDate ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                        )}
                      </div>
                      
                      <div className="w-full bg-card border border-border/50 rounded-lg p-3 shadow-sm group-hover:border-border transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${history.returnDate ? 'text-emerald-600 dark:text-emerald-500' : 'text-blue-600 dark:text-blue-500'}`}>
                            {history.returnDate ? 'Returned' : 'Borrowed'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(history.returnDate || history.issueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">{history.book?.title || 'Unknown Book'}</p>
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
