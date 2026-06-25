import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueBook } from '../../services/borrowService';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  UserSearch, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  UserPlus,
  Library,
  BookDown,
  Loader2,
  Check
} from 'lucide-react';

const IssueBook = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [memberSearch, setMemberSearch] = useState('');
    const [bookSearch, setBookSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchingMembers, setSearchingMembers] = useState(false);
    const [searchingBooks, setSearchingBooks] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (user?.role === 'member') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <Lock className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-3">403 — Access Denied</h1>
                <p className="text-muted-foreground max-w-md text-lg">
                    You don't have permission to issue books. This feature is restricted to Librarians and Administrators.
                </p>
                <Button onClick={() => navigate('/dashboard')} className="mt-8" size="lg">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const searchMembers = async (e) => {
        if (e) e.preventDefault();
        if (!memberSearch.trim()) return;
        try {
            setSearchingMembers(true);
            const response = await api.get(`/members?q=${memberSearch}`);
            setMembers(response.data.data);
            if (response.data.data.length === 0) setError('No members found matching your search.');
            else setError('');
        } catch (err) {
            setError('Failed to search members.');
        } finally {
            setSearchingMembers(false);
        }
    };

    const searchBooks = async (e) => {
        if (e) e.preventDefault();
        if (!bookSearch.trim()) return;
        try {
            setSearchingBooks(true);
            const response = await api.get(`/books/search?q=${bookSearch}`);
            setBooks(response.data.data);
            if (response.data.data.length === 0) setError('No books found matching your search.');
            else setError('');
        } catch (err) {
            setError('Failed to search books.');
        } finally {
            setSearchingBooks(false);
        }
    };

    const handleIssue = async () => {
        if (!selectedMember || !selectedBook) return;

        if (selectedBook.availableCopies <= 0) {
            setError('This book is currently out of stock.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await issueBook(selectedMember.id, selectedBook.id);
            if (response.success) {
                setSuccess('Book issued successfully! Redirecting...');
                setTimeout(() => navigate('/active-borrows'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to issue book. Check if member has reached limit or has unpaid fines.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
            <PageHeader 
                title="Issue a Book" 
                description="Select a member and a book to create a new borrow record."
            />

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Member Selection */}
                <Card className="h-[520px] flex flex-col border-muted-foreground/20">
                    <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</div>
                            <h2 className="text-xl font-semibold">Select Member</h2>
                        </div>

                        <form onSubmit={searchMembers} className="flex gap-2 mb-6">
                            <div className="relative flex-1">
                                <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 bg-muted/50 focus-visible:bg-transparent"
                                    placeholder="Name or Membership ID..."
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={searchingMembers}>
                                {searchingMembers ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                            </Button>
                        </form>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {members.map(m => (
                                <div
                                    key={m.id}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${selectedMember?.id === m.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted hover:border-primary/30'}`}
                                    onClick={() => setSelectedMember(m)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-foreground">{m.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono mt-1">{m.membershipId}</div>
                                        </div>
                                        {selectedMember?.id === m.id && <Check className="h-5 w-5 text-primary" />}
                                    </div>
                                </div>
                            ))}
                            {members.length === 0 && !searchingMembers && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-60 pb-10">
                                    <UserPlus className="h-10 w-10 mb-3" />
                                    <p>Search for a member above</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Book Selection */}
                <Card className="h-[520px] flex flex-col border-muted-foreground/20">
                    <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
                            <h2 className="text-xl font-semibold">Select Book</h2>
                        </div>

                        <form onSubmit={searchBooks} className="flex gap-2 mb-6">
                            <div className="relative flex-1">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 bg-muted/50 focus-visible:bg-transparent"
                                    placeholder="Title, Author or ISBN..."
                                    value={bookSearch}
                                    onChange={(e) => setBookSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={searchingBooks}>
                                {searchingBooks ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                            </Button>
                        </form>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {books.map(b => (
                                <div
                                    key={b.id}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedBook?.id === b.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted hover:border-primary/30'} ${b.availableCopies <= 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                                    onClick={() => setSelectedBook(b)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-foreground">{b.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Available: <span className={b.availableCopies > 0 ? 'text-primary font-bold' : 'text-destructive font-bold'}>{b.availableCopies}</span>
                                            </div>
                                        </div>
                                        {selectedBook?.id === b.id && <Check className="h-5 w-5 text-primary" />}
                                    </div>
                                </div>
                            ))}
                            {books.length === 0 && !searchingBooks && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-60 pb-10">
                                    <Library className="h-10 w-10 mb-3" />
                                    <p>Search for a book above</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer Summary & Action */}
            {(selectedMember || selectedBook) && (
                <div className="mt-8 bg-muted/50 p-6 rounded-xl border animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-8">
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Target Member</div>
                                <div className="font-semibold text-foreground text-lg">{selectedMember?.name || '—'}</div>
                            </div>
                            <div className="w-px h-12 bg-border hidden md:block"></div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Selected Book</div>
                                <div className="font-semibold text-foreground text-lg">{selectedBook?.title || '—'}</div>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            disabled={!selectedMember || !selectedBook || loading}
                            onClick={handleIssue}
                            className="w-full md:w-auto px-8"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Issuing...</>
                            ) : (
                                <><BookDown className="h-4 w-4 mr-2" /> Issue Book</>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueBook;
