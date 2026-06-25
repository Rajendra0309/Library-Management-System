import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFines, getFineSummary } from '../../services/fineService';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  IndianRupee,
  Clock,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

const FineList = () => {
    const navigate = useNavigate();
    const [fines, setFines] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All Statuses');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [finesRes, summaryRes] = await Promise.all([
                getFines(filter === 'All Statuses' ? '' : filter.toLowerCase()),
                getFineSummary()
            ]);
            setFines(finesRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            setError('Failed to fetch fine data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    const totalPending = summary.find(s => s.status === 'pending')?._sum.amount || 0;
    const totalPaid = summary.find(s => s.status === 'paid')?._sum.amount || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
            <PageHeader 
                title="Fine Management" 
                description="Monitor and manage all library fines and collections."
            />

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="relative overflow-hidden group border-muted-foreground/20">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <IndianRupee className="h-32 w-32" />
                    </div>
                    <CardContent className="p-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Total Collected</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-foreground">₹{totalPaid}</span>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden group border-muted-foreground/20">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-destructive">
                        <Clock className="h-32 w-32" />
                    </div>
                    <CardContent className="p-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Pending Fines</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-destructive">₹{totalPending}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and List */}
            <Card>
                <div className="px-6 py-5 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Fine History</h3>
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
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Member</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Book</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Amount</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Status</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                            <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                                        </tr>
                                    ))
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
                                            <td className="px-6 py-4">
                                                <div className="font-semibold group-hover:text-primary transition-colors">{fine.member.name}</div>
                                                <div className="text-xs font-mono text-muted-foreground mt-0.5">{fine.member.membershipId}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium truncate max-w-xs group-hover:text-primary transition-colors">{fine.borrow.book.title}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">Overdue {fine.daysOverdue} days</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-base">₹{fine.amount}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={statusVariant} className={statusClass}>
                                                    {fine.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/fines/${fine.memberId}`)}
                                                    className="font-semibold text-primary hover:text-primary hover:bg-primary/10"
                                                >
                                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FineList;
