import React, { useState, useEffect } from 'react';
import { getActiveBorrows, returnBook } from '../../services/borrowService';

const ReturnBook = () => {
    const { user } = useAuth();

    if (user?.role === 'member') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <span className="material-symbols-outlined text-6xl text-error mb-4">lock</span>
                <h1 className="text-display-3xl font-bold text-on-surface mb-2">403 — Access Denied</h1>
                <p className="text-text-secondary max-w-md">
                    You don't have permission to return books. This feature is restricted to Librarians and Administrators.
                </p>
            </div>
        );
    }
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
        fetchBorrows();
    }, []);

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
        <div className="max-w-content-max-width mx-auto px-page-padding py-6 w-full">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="font-display-3xl text-display-3xl text-on-surface mb-2">Book Returns</h1>
                    <p className="text-text-secondary">Scan or search for active borrows to process returns.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">search</span>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-border-default rounded-xl focus:border-primary outline-none bg-bg-surface shadow-sm text-sm"
                        placeholder="Member name, ID or Book title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="p-4 bg-error-container text-on-error-container rounded-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                <span className="text-sm font-medium">{error}</span>
            </div>}

            {success && <div className="p-4 bg-tertiary-fixed text-tertiary-container rounded-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="text-sm font-medium">{success}</span>
            </div>}

            <div className="bg-bg-surface rounded-2xl border border-border-default shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-bright border-b border-border-subtle text-label-xs uppercase tracking-widest text-text-secondary font-semibold">
                        <tr>
                            <th className="px-6 py-4">Member Info</th>
                            <th className="px-6 py-4">Book Details</th>
                            <th className="px-6 py-4">Status / Due Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle font-body-sm">
                        {fetching ? (
                            <tr><td colSpan="4" className="text-center py-20">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span>Loading active records...</span>
                                </div>
                            </td></tr>
                        ) : filteredBorrows.map(b => {
                            const isOverdue = new Date(b.dueDate) < new Date();
                            return (
                                <tr key={b.id} className="hover:bg-bg-hover transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-on-surface">{b.member.name}</div>
                                        <div className="text-[11px] text-text-tertiary font-code-mono uppercase">{b.member.membershipId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-on-surface">{b.book.title}</div>
                                        <div className="text-[11px] text-text-tertiary">ISBN: {b.book.isbn}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 ${isOverdue ? 'text-error font-bold' : 'text-text-secondary'}`}>
                                            <span className="material-symbols-outlined text-[18px]">
                                                {isOverdue ? 'history_toggle_off' : 'event_available'}
                                            </span>
                                            {new Date(b.dueDate).toLocaleDateString()}
                                            {isOverdue && <span className="text-[10px] bg-error-container px-1.5 py-0.5 rounded ml-1">OVERDUE</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedBorrow(b);
                                                setShowConfirmModal(true);
                                            }}
                                            className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-sm hover:shadow-brand-glow transition-all"
                                        >
                                            Process Return
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredBorrows.length === 0 && !fetching && (
                            <tr>
                                <td colSpan="4" className="px-6 py-20 text-center text-text-tertiary italic">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl">search_off</span>
                                        <p>No matching active borrows found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl border border-border-default">
                        <h2 className="font-display-xl text-headline-xl mb-4">Confirm Return</h2>
                        <div className="bg-bg-page p-4 rounded-xl mb-6">
                            <div className="text-[10px] uppercase font-bold text-text-tertiary mb-2 tracking-widest">Book Information</div>
                            <div className="font-bold text-on-surface">{selectedBorrow?.book.title}</div>
                            <div className="text-xs text-text-secondary mt-1">Borrowed by <span className="font-semibold">{selectedBorrow?.member.name}</span></div>
                        </div>

                        <p className="text-text-secondary mb-8 text-sm leading-relaxed">
                            Processing this return will update the book's availability and complete this borrow record.
                            {new Date(selectedBorrow?.dueDate) < new Date() && (
                                <span className="text-error font-bold mt-2 block">
                                    ⚠️ This book is overdue! A fine will be generated automatically.
                                </span>
                            )}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setSelectedBorrow(null);
                                }}
                                className="px-6 py-2.5 text-text-secondary hover:bg-bg-hover rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                onClick={handleReturn}
                                className="px-8 py-2.5 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:shadow-brand-glow disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loading && <div className="w-3 h-3 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>}
                                {loading ? 'Processing...' : 'Confirm Return'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnBook;
