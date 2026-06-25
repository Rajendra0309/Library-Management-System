import React, { useState, useEffect } from 'react';
import { getActiveBorrows, returnBook } from '../../services/borrowService';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
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
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  CornerDownLeft,
  Lock,
  SearchX,
  History,
  CalendarCheck2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReturnBook = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedBorrow, setSelectedBorrow] = useState(null);

    const fetchBorrows = async () => {
        try {
            setFetching(true);
            const response = await getActiveBorrows();
            setBorrows(response.data);
        } catch (err) {
            setError('Failed to fetch active borrows');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (user?.role !== 'member') {
            fetchBorrows();
        }
    }, [user]);

    if (user?.role === 'member') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <Lock className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-3">403 — Access Denied</h1>
                <p className="text-muted-foreground max-w-md text-lg">
                    You don't have permission to return books. This feature is restricted to Librarians and Administrators.
                </p>
                <Button onClick={() => navigate('/dashboard')} className="mt-8" size="lg">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const handleReturn = async () => {
        if (!selectedBorrow) return;
        try {
            setLoading(true);
            setError('');
            const response = await returnBook(selectedBorrow.id);
            if (response.success) {
                setSuccess(response.message || 'Book returned successfully!');
                setShowConfirmModal(false);
                setSelectedBorrow(null);
                fetchBorrows();
                setTimeout(() => setSuccess(''), 4000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to return book');
        } finally {
            setLoading(false);
        }
    };

    const filteredBorrows = borrows.filter(b =>
        b.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.member.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
                <PageHeader 
                    title="Book Returns" 
                    description="Scan or search for active borrows to process returns."
                    className="mb-0"
                />
                
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9 bg-muted/50 border-transparent focus-visible:bg-transparent h-11"
                        placeholder="Member name, ID or Book title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                    <th className="px-6 py-4 font-medium text-muted-foreground">Member Info</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground">Book Details</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground">Status / Due Date</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {fetching ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-4 w-32 mb-2" />
                                                <Skeleton className="h-3 w-20" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-4 w-48 mb-2" />
                                                <Skeleton className="h-3 w-32" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-4 w-32" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Skeleton className="h-9 w-32 ml-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredBorrows.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-24">
                                            <div className="flex flex-col items-center justify-center">
                                                <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                                <h3 className="text-lg font-medium text-foreground">No matching records</h3>
                                                <p className="text-sm text-muted-foreground mt-1">We couldn't find any active borrows matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredBorrows.map(b => {
                                    const isOverdue = new Date(b.dueDate) < new Date();
                                    return (
                                        <tr key={b.id} className="hover:bg-muted/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{b.member.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono mt-0.5">{b.member.membershipId}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground group-hover:text-primary transition-colors">{b.book.title}</div>
                                                <div className="text-xs text-muted-foreground font-mono mt-0.5">ISBN: {b.book.isbn}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-2 font-medium ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                    {isOverdue ? <History className="h-4 w-4" /> : <CalendarCheck2 className="h-4 w-4" />}
                                                    {new Date(b.dueDate).toLocaleDateString()}
                                                    {isOverdue && (
                                                        <Badge variant="destructive" className="text-[10px] uppercase ml-1 px-1.5 py-0">Overdue</Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedBorrow(b);
                                                        setShowConfirmModal(true);
                                                    }}
                                                    className="shadow-sm"
                                                >
                                                    <CornerDownLeft className="h-4 w-4 mr-2" />
                                                    Process Return
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

            <Dialog open={showConfirmModal} onOpenChange={(open) => {
                if (!open && !loading) {
                    setShowConfirmModal(false);
                    setTimeout(() => setSelectedBorrow(null), 200);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Confirm Return</DialogTitle>
                        <DialogDescription>
                            Processing this return will update the book's availability and complete this borrow record.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBorrow && (
                        <div className="my-4">
                            <div className="bg-muted p-4 rounded-xl border mb-4 space-y-1">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Book Information</div>
                                <div className="font-semibold text-foreground text-base">{selectedBorrow.book.title}</div>
                                <div className="text-sm text-muted-foreground">
                                    Borrowed by <span className="font-medium text-foreground">{selectedBorrow.member.name}</span>
                                </div>
                            </div>
                            
                            {new Date(selectedBorrow.dueDate) < new Date() && (
                                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="font-medium">
                                        This book is overdue! A fine will be generated automatically.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            onClick={() => {
                                setShowConfirmModal(false);
                                setTimeout(() => setSelectedBorrow(null), 200);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={loading}
                            onClick={handleReturn}
                            className="min-w-[140px]"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                'Confirm Return'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReturnBook;
