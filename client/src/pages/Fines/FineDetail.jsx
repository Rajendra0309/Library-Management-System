import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberFines, payFine, waiveFine } from '../../services/fineService';

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
        <div className="max-w-content-max-width mx-auto px-page-padding py-4xl w-full">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/fines')} className="p-2 rounded-full hover:bg-bg-hover transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="font-display-3xl text-display-3xl text-on-surface">Member Fine Details</h1>
            </div>

            {error && <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-4">{error}</div>}

            <div className="bg-bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-surface-container-low border-b border-border-subtle">
                        <tr>
                            <th className="px-6 py-3 font-label-xs uppercase tracking-widest text-text-secondary font-semibold">Book Title</th>
                            <th className="px-6 py-3 font-label-xs uppercase tracking-widest text-text-secondary font-semibold">Amount</th>
                            <th className="px-6 py-3 font-label-xs uppercase tracking-widest text-text-secondary font-semibold">Status</th>
                            <th className="px-6 py-3 font-label-xs uppercase tracking-widest text-text-secondary font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-8 text-text-secondary">Loading details...</td></tr>
                        ) : fines.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-8 text-text-secondary">No fines found for this member.</td></tr>
                        ) : fines.map(fine => (
                            <tr key={fine.id} className="hover:bg-bg-hover transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold">{fine.borrow.book.title}</div>
                                    <div className="text-xs text-text-tertiary">Due: {new Date(fine.borrow.dueDate).toLocaleDateString()} · Overdue {fine.daysOverdue} days</div>
                                </td>
                                <td className="px-6 py-4 font-bold">Rs {fine.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${fine.status === 'paid' ? 'bg-tertiary-fixed text-tertiary-container' :
                                            fine.status === 'waived' ? 'bg-surface-variant text-on-surface-variant' :
                                                'bg-secondary-fixed text-on-secondary-fixed'
                                        }`}>
                                        {fine.status.toUpperCase()}
                                    </span>
                                    {fine.status === 'waived' && <div className="text-[10px] text-text-tertiary mt-1 italic">Reason: {fine.reason}</div>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {fine.status === 'pending' && (
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => handlePay(fine.id)}
                                                className="px-3 py-1 bg-tertiary-container text-on-tertiary rounded shadow hover:shadow-brand-glow transition-all font-semibold text-xs"
                                            >
                                                Pay
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedFineId(fine.id);
                                                        setShowWaiveModal(true);
                                                    }}
                                                    className="px-3 py-1 border border-border-default rounded text-text-secondary hover:bg-surface-dim hover:text-error transition-all font-semibold text-xs"
                                                >
                                                    Waive
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showWaiveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-surface rounded-xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="font-headline-xl mb-4">Waive Fine</h2>
                        <p className="text-text-secondary mb-6 text-sm">Please provide a reason for waiving this fine. This action will be logged.</p>
                        <textarea
                            className="w-full border border-border-default rounded-lg p-3 text-sm focus:border-primary outline-none min-h-[100px]"
                            placeholder="Enter reason..."
                            value={waiveReason}
                            onChange={(e) => setWaiveReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowWaiveModal(false)}
                                className="px-4 py-2 text-text-secondary hover:bg-bg-hover rounded"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!waiveReason}
                                onClick={handleWaive}
                                className="px-4 py-2 bg-primary text-on-primary rounded font-bold hover:shadow-brand-glow disabled:opacity-50"
                            >
                                Confirm Waive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FineDetail;
