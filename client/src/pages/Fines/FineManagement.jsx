import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFines, getFineSummary, getMemberFines, payFine, waiveFine } from '../../services/fineService';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { 
  AlertCircle, 
  Download,
  IndianRupee,
  Clock,
  HandHeart,
  ChevronDown,
  Info,
  Check,
  X
} from 'lucide-react';

const FineManagement = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All Statuses');
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [waiveReason, setWaiveReason] = useState('');
  const [selectedFineId, setSelectedFineId] = useState(null);

  const isMember = user?.role === 'member';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (isMember) {
        const res = await getMemberFines(user.id);
        setFines(res.data);
        setSummary([]);
      } else {
        const statusParam = filter === 'All Statuses' ? '' : filter.toLowerCase();
        const [finesRes, summaryRes] = await Promise.all([
          getFines(statusParam).catch(err => {
            console.error('Fines list error:', err);
            return { data: [] };
          }),
          getFineSummary().catch(err => {
            console.error('Summary error:', err);
            return { data: [] };
          })
        ]);
        setFines(finesRes.data || []);
        setSummary(summaryRes.data || []);
      }
    } catch (err) {
      setError('Failed to fetch fine data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handlePay = async (id) => {
    try {
      const res = await payFine(id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
    }
  };

  const handleWaive = async () => {
    if (!waiveReason) return;
    try {
      const res = await waiveFine(selectedFineId, waiveReason);
      if (res.success) {
        setShowWaiveModal(false);
        setWaiveReason('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to waive fine');
    }
  };

  const pendingAmount = summary.find(s => s.status === 'pending')?._sum.amount || 0;
  const paidAmount = summary.find(s => s.status === 'paid')?._sum.amount || 0;
  const waivedAmount = summary.find(s => s.status === 'waived')?._sum.amount || 0;
  const waivedCount = summary.find(s => s.status === 'waived')?._count.id || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
        <PageHeader 
            title="Fine Management" 
            description={isMember ? "Track and manage your financial obligations." : "Track, collect, and manage member financial obligations."}
            className="mb-0"
        />
        {!isMember && (
          <Button variant="outline" className="shadow-sm" onClick={() => {
            if (!fines || fines.length === 0) return;
            const csvRows = ["ID,Member ID,Member Name,Book Title,Amount,Status,Created At"];
            fines.forEach(f => {
              csvRows.push(`${f.id},${f.member?.membershipId},"${f.member?.name}","${f.borrow?.book?.title}",${f.amount},${f.status},${new Date(f.createdAt).toLocaleDateString()}`);
            });
            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Fines_Export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Bento Grid - Only for Admin/Librarian */}
      {!isMember && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Collected */}
          <Card className="relative overflow-hidden group border-muted-foreground/20">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <IndianRupee className="h-32 w-32" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Total Collected</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-foreground">₹{paidAmount}</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Lifetime</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-full"></div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Fines */}
          <Card className="relative overflow-hidden group border-muted-foreground/20">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-destructive">
              <Clock className="h-32 w-32" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Pending Fines</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-foreground">₹{pendingAmount}</span>
                <span className="text-sm font-medium text-destructive">Action Required</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div className="bg-destructive h-full rounded-full w-[45%]"></div>
              </div>
            </CardContent>
          </Card>

          {/* Waived */}
          <Card className="relative overflow-hidden group border-muted-foreground/20">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <HandHeart className="h-32 w-32" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Waived (YTD)</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-foreground">₹{waivedAmount}</span>
                <span className="text-sm font-medium text-muted-foreground">{waivedCount} items</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div className="bg-muted-foreground/30 h-full rounded-full w-[15%]"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Table Section */}
      <Card>
        <div className="px-6 py-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Fine Activity</h3>
          {!isMember && (
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none flex h-9 w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Waived">Waived</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  {!isMember && <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Member ID & Name</th>}
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Book & Details</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Amount</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {!isMember && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-32 mb-2" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-8 w-24 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : fines.length === 0 ? (
                  <tr>
                    <td colSpan={isMember ? 4 : 5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Check className="h-10 w-10 text-emerald-500 mb-4 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full" />
                        <h3 className="text-lg font-medium text-foreground">No fines found</h3>
                        <p className="text-sm text-muted-foreground mt-1">There are no fine records matching the current criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : fines.map(fine => {
                    
                  let statusVariant = "secondary";
                  let statusClass = "";
                  
                  if (fine.status === 'paid') {
                      statusClass = "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
                  } else if (fine.status === 'pending') {
                      statusVariant = "destructive";
                  }

                  return (
                    <tr key={fine.id} className="hover:bg-muted/50 transition-colors group">
                      {!isMember && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
                              fine.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              fine.status === 'waived' ? 'bg-muted text-muted-foreground' :
                              'bg-destructive/10 text-destructive'
                            }`}>
                              {fine.member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{fine.member.name}</div>
                              <div className="font-mono text-xs text-muted-foreground mt-0.5">{fine.member.membershipId}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-foreground font-medium truncate max-w-[250px] group-hover:text-primary transition-colors">{fine.borrow.book.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Overdue {fine.daysOverdue} days</div>
                      </td>
                      <td className={`px-6 py-4 font-bold text-base ${fine.status === 'waived' ? 'line-through text-muted-foreground font-normal' : 'text-foreground'}`}>
                        ₹{fine.amount}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                            variant={statusVariant} 
                            className={statusClass}
                        >
                          {fine.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {fine.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            {isMember ? (
                              <span className="text-amber-600 dark:text-amber-500 italic font-medium flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-full">
                                <Info className="h-3.5 w-3.5" />
                                Visit Desk to Pay
                              </span>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handlePay(fine.id)}
                                >
                                  Mark Paid
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hidden md:flex"
                                  onClick={() => {
                                    setSelectedFineId(fine.id);
                                    setShowWaiveModal(true);
                                  }}
                                >
                                  Waive
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs flex justify-end items-center gap-1">
                            {fine.status === 'waived' ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showWaiveModal} onOpenChange={setShowWaiveModal}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Waive Fine</DialogTitle>
                <DialogDescription>
                    Please provide a reason for waiving this fine. This action will be logged.
                </DialogDescription>
            </DialogHeader>
            <div className="my-2">
                <Textarea
                    placeholder="Enter reason..."
                    value={waiveReason}
                    onChange={(e) => setWaiveReason(e.target.value)}
                    className="min-h-[100px]"
                />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button
                    variant="outline"
                    onClick={() => setShowWaiveModal(false)}
                >
                    Cancel
                </Button>
                <Button
                    disabled={!waiveReason}
                    onClick={handleWaive}
                >
                    Confirm Waive
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FineManagement;
