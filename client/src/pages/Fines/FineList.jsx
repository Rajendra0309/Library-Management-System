import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFines, getFineSummary } from '../../services/fineService';

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
        <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
            <div className="mb-4xl">
                <h1 className="font-display-3xl text-display-3xl text-on-surface mb-2">Fine Management</h1>
                <p className="text-text-secondary">Monitor and manage all library fines and collections.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl mb-4xl">
                <div className="bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-sm">
                    <h3 className="text-label-xs uppercase tracking-widest text-text-secondary mb-2">Total Collected (Rs)</h3>
                    <div className="text-display-2xl font-bold text-on-surface">Rs {totalPaid}</div>
                </div>
                <div className="bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-sm">
                    <h3 className="text-label-xs uppercase tracking-widest text-text-secondary mb-2">Pending Fines (Rs)</h3>
                    <div className="text-display-2xl font-bold text-error">Rs {totalPending}</div>
                </div>
            </div>

            {/* Filter and List */}
            <div className="bg-bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                    <h3 className="font-headline-lg">Fine History</h3>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-border-default rounded-md px-3 py-1 text-sm bg-bg-page"
                    >
                        <option value="All Statuses">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Waived">Waived</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-bright text-label-xs uppercase tracking-widest text-text-secondary">
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Book</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8">Loading fines...</td></tr>
                            ) : fines.map(fine => (
                                <tr key={fine.id} className="hover:bg-bg-hover transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{fine.member.name}</div>
                                        <div className="text-[11px] text-text-tertiary">{fine.member.membershipId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium truncate max-w-xs">{fine.borrow.book.title}</div>
                                        <div className="text-xs text-text-tertiary">Overdue {fine.daysOverdue} days</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold">Rs {fine.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${fine.status === 'paid' ? 'bg-tertiary-fixed text-tertiary-container' :
                                                fine.status === 'waived' ? 'bg-surface-variant text-on-surface-variant' :
                                                    'bg-secondary-fixed text-on-secondary-fixed'
                                            }`}>
                                            {fine.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/fines/${fine.memberId}`)}
                                            className="text-primary font-semibold text-sm hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FineList;
