import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueBook } from '../../services/borrowService';
import api from '../../api/axios'; // For searching members/books

const IssueBook = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user?.role === 'member') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <span className="material-symbols-outlined text-6xl text-error mb-4">lock</span>
                <h1 className="text-display-3xl font-bold text-on-surface mb-2">403 — Access Denied</h1>
                <p className="text-text-secondary max-w-md">
                    You don't have permission to issue books. This feature is restricted to Librarians and Administrators.
                </p>
                <button onClick={() => navigate('/dashboard')} className="mt-8 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold">
                    Back to Dashboard
                </button>
            </div>
        );
    }

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

        // Validation: Check if book is available
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
        <div className="max-w-content-max-width mx-auto px-page-padding py-6 w-full">
            <div className="mb-8">
                <h1 className="font-display-3xl text-display-3xl text-on-surface mb-2">Issue a Book</h1>
                <p className="text-text-secondary">Select a member and a book to create a new borrow record.</p>
            </div>

            {error && <div className="p-4 bg-error-container text-on-error-container rounded-xl mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="material-symbols-outlined">error</span>
                <span className="text-sm font-medium">{error}</span>
            </div>}

            {success && <div className="p-4 bg-tertiary-fixed text-tertiary-container rounded-xl mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="text-sm font-medium">{success}</span>
            </div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Member Selection */}
                <div className="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm flex flex-col h-[500px]">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                        <h2 className="font-headline-lg">Select Member</h2>
                    </div>

                    <form onSubmit={searchMembers} className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">person_search</span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-border-default rounded-xl text-sm focus:border-primary outline-none bg-bg-page"
                                placeholder="Name or Membership ID..."
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={searchingMembers} className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-sm hover:shadow-brand-glow transition-all disabled:opacity-50">
                            {searchingMembers ? '...' : 'Search'}
                        </button>
                    </form>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {members.map(m => (
                            <div
                                key={m.id}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedMember?.id === m.id ? 'border-primary bg-primary-container/10' : 'border-border-subtle hover:border-primary/30 hover:bg-bg-hover'}`}
                                onClick={() => setSelectedMember(m)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-on-surface">{m.name}</div>
                                        <div className="text-[11px] text-text-tertiary font-code-mono mt-0.5">{m.membershipId}</div>
                                    </div>
                                    {selectedMember?.id === m.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                                </div>
                            </div>
                        ))}
                        {members.length === 0 && !searchingMembers && (
                            <div className="h-full flex flex-col items-center justify-center text-text-tertiary text-sm italic py-10 opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-2">person_add</span>
                                <p>Search for a member above</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Book Selection */}
                <div className="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm flex flex-col h-[500px]">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
                        <h2 className="font-headline-lg">Select Book</h2>
                    </div>

                    <form onSubmit={searchBooks} className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">menu_book</span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-border-default rounded-xl text-sm focus:border-primary outline-none bg-bg-page"
                                placeholder="Title, Author or ISBN..."
                                value={bookSearch}
                                onChange={(e) => setBookSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={searchingBooks} className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-sm hover:shadow-brand-glow transition-all disabled:opacity-50">
                            {searchingBooks ? '...' : 'Search'}
                        </button>
                    </form>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {books.map(b => (
                            <div
                                key={b.id}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedBook?.id === b.id ? 'border-primary bg-primary-container/10' : 'border-border-subtle hover:border-primary/30 hover:bg-bg-hover'} ${b.availableCopies <= 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                                onClick={() => setSelectedBook(b)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-on-surface">{b.title}</div>
                                        <div className="text-[11px] text-text-tertiary mt-0.5">Available: <span className={b.availableCopies > 0 ? 'text-primary font-bold' : 'text-error'}>{b.availableCopies}</span></div>
                                    </div>
                                    {selectedBook?.id === b.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                                </div>
                            </div>
                        ))}
                        {books.length === 0 && !searchingBooks && (
                            <div className="h-full flex flex-col items-center justify-center text-text-tertiary text-sm italic py-10 opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-2">library_books</span>
                                <p>Search for a book above</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Summary & Action */}
            {(selectedMember || selectedBook) && (
                <div className="mt-8 bg-surface-container-low p-6 rounded-2xl border border-primary/20 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-8">
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Target Member</div>
                                <div className="font-bold text-on-surface">{selectedMember?.name || '—'}</div>
                            </div>
                            <div className="w-px h-10 bg-border-default md:block hidden"></div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Selected Book</div>
                                <div className="font-bold text-on-surface">{selectedBook?.title || '—'}</div>
                            </div>
                        </div>
                        <button
                            disabled={!selectedMember || !selectedBook || loading}
                            onClick={handleIssue}
                            className="w-full md:w-auto px-10 py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:shadow-brand-glow hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                    Issuing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">assignment_returned</span>
                                    Issue Book
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueBook;
