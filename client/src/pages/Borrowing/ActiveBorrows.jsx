import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActiveBorrows, getBorrowHistory, renewBook, returnBook } from '../../services/borrowService';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Search, 
  FolderOpen, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  CornerDownLeft,
  BookMarked
} from 'lucide-react';

const ActiveBorrows = () => {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('All Statuses');
  const [search, setSearch] = useState('');

  const isMember = user?.role === 'member';

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      setError('');
      if (isMember) {
        const data = await getBorrowHistory(user.id);
        const activeOnly = data.data.filter(b => b.status === 'issued');
        setBorrows(activeOnly);
      } else {
        const data = await getActiveBorrows();
        setBorrows(data.data);
      }
    } catch (err) {
      setError(isMember ? 'Failed to fetch your borrows.' : 'Failed to fetch active borrows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const handleRenew = async (id) => {
    try {
      setError('');
      const response = await renewBook(id);
      if (response.success) {
        setSuccess('Book renewed successfully!');
        fetchBorrows();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to renew book');
    }
  };

  const handleReturn = async (id) => {
    try {
      setError('');
      const response = await returnBook(id);
      if (response.success) {
        setSuccess(response.message || 'Book returned successfully!');
        fetchBorrows();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book');
    }
  };

  const filteredBorrows = borrows.filter(b => {
    const matchesSearch = b.book.title.toLowerCase().includes(search.toLowerCase()) ||
      b.member.name.toLowerCase().includes(search.toLowerCase()) ||
      b.member.membershipId.toLowerCase().includes(search.toLowerCase());

    if (filter === 'All Statuses') return matchesSearch;
    if (filter === 'Overdue') return matchesSearch && new Date(b.dueDate) < new Date();
    if (filter === 'Active') return matchesSearch && new Date(b.dueDate) >= new Date();
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-2">
        <PageHeader 
          title={isMember ? 'My Active Borrows' : 'Active Borrows'}
          description={isMember ? `You have ${borrows.length} books with you.` : `Managing ${borrows.length} items currently in circulation.`}
          className="mb-0"
        />
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex h-10 w-[140px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Overdue">Overdue</option>
          </select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 w-[260px] bg-muted/50 border-transparent focus-visible:bg-transparent"
              placeholder={isMember ? "Search your books..." : "Search member or book..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  {!isMember && <th className="px-6 py-4 font-medium text-muted-foreground">Member</th>}
                  <th className="px-6 py-4 font-medium text-muted-foreground">Book Title</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Issue Date</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Due Date</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-center">Status</th>
                  {!isMember && <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {!isMember && (
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                      {!isMember && (
                        <td className="px-6 py-4 text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </td>
                      )}
                    </tr>
                  ))
                ) : filteredBorrows.length === 0 ? (
                  <tr>
                    <td colSpan={isMember ? 4 : 6} className="text-center py-24">
                      <div className="flex flex-col items-center justify-center">
                        <BookMarked className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No active borrows</h3>
                        <p className="text-sm text-muted-foreground mt-1">There are no books currently borrowed that match your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBorrows.map(b => {
                    const overdueDate = new Date(b.dueDate);
                    const isOverdue = overdueDate < new Date();
                    
                    return (
                      <tr key={b.id} className="hover:bg-muted/50 transition-colors group">
                        {!isMember && (
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground group-hover:text-primary transition-colors">{b.member.name}</div>
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">{b.member.membershipId}</div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">{b.book.title}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">ISBN: {b.book.isbn}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(b.issueDate).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 font-medium ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                          {overdueDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge 
                            variant={isOverdue ? "destructive" : "secondary"}
                            className={!isOverdue ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                          >
                            {isOverdue ? 'Overdue' : 'Active'}
                          </Badge>
                        </td>
                        {!isMember && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRenew(b.id)}
                                title="Renew (Extends 7 days)"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" /> Renew
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleReturn(b.id)}
                                title="Return Book"
                              >
                                <CornerDownLeft className="h-4 w-4 mr-2" /> Return
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveBorrows;
