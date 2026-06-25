import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberFines, payFine, waiveFine } from '../../services/fineService';
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
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const FineDetail = () => {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [waiveReason, setWaiveReason] = useState('');
    const [showWaiveModal, setShowWaiveModal] = useState(false);
    const [selectedFineId, setSelectedFineId] = useState(null);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const response = await getMemberFines(memberId);
            setFines(response.data);
        } catch (err) {
            setError('Failed to fetch fines for this member');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
    }, [memberId]);

    const handlePay = async (id) => {
        try {
            const response = await payFine(id);
            if (response.success) {
                fetchFines();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to pay fine');
        }
    };

    const handleWaive = async () => {
        if (!waiveReason) return;
        try {
            const response = await waiveFine(selectedFineId, waiveReason);
            if (response.success) {
                setShowWaiveModal(false);
                setWaiveReason('');
                fetchFines();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to waive fine');
        }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                    onClick={() => navigate('/fines')}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <PageHeader 
                    title="Member Fine Details" 
                    description="View and manage fines for this specific member."
                    className="mb-0 border-0"
                />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Book Title</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Amount</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Status</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[11px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                            <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-32 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : fines.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-16 text-muted-foreground">
                                            No fines found for this member.
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
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{fine.borrow.book.title}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Due: {new Date(fine.borrow.dueDate).toLocaleDateString()} · Overdue {fine.daysOverdue} days
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 font-bold text-base ${fine.status === 'waived' ? 'line-through text-muted-foreground font-normal' : 'text-foreground'}`}>
                                                ₹{fine.amount}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={statusVariant} className={statusClass}>
                                                    {fine.status.toUpperCase()}
                                                </Badge>
                                                {fine.status === 'waived' && (
                                                    <div className="text-[10px] text-muted-foreground mt-1.5 italic">Reason: {fine.reason}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {fine.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handlePay(fine.id)}
                                                        >
                                                            Pay
                                                        </Button>
                                                        {isAdmin && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedFineId(fine.id);
                                                                    setShowWaiveModal(true);
                                                                }}
                                                                className="hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                                                            >
                                                                Waive
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
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

export default FineDetail;
