import { useAuth } from '../../context/AuthContext';
import { getFines, getFineSummary, getMemberFines, payFine, waiveFine } from '../../services/fineService';

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
        setSummary([]); // Members don't see total library summary
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
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-lg mb-4xl">
        <div>
          <h2 className="font-display-3xl text-display-3xl text-on-surface mb-sm">Fine Management</h2>
          <p className="font-body-base text-body-base text-text-secondary">Track, collect, and manage member financial obligations.</p>
        </div>
        <div className="flex gap-md">
          <button className="flex items-center gap-xs px-md py-sm rounded-lg border border-border-default text-primary bg-bg-surface hover:-translate-y-[2px] hover:shadow-md transition-all duration-200 font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </button>
        </div>
      </div>

      {/* KPI Bento Grid - Only for Admin/Librarian */}
      {!isMember && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mb-4xl">
          {/* Total Collected */}
          <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover:-translate-y-[3px] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-lg opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-tertiary-container">account_balance</span>
            </div>
            <h3 className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest mb-sm">Total Collected</h3>
            <div className="flex items-baseline gap-sm mb-lg">
              <span className="font-display-4xl text-display-4xl text-on-surface">Rs {paidAmount}</span>
              <span className="font-body-sm text-body-sm text-tertiary-container flex items-center"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> Lifetime</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-tertiary-container h-full rounded-full w-[100%]"></div>
            </div>
          </div>

          {/* Pending Fines */}
          <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover:-translate-y-[3px] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-lg opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-secondary-container">pending_actions</span>
            </div>
            <h3 className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest mb-sm">Pending Fines</h3>
            <div className="flex items-baseline gap-sm mb-lg">
              <span className="font-display-4xl text-display-4xl text-on-surface">Rs {pendingAmount}</span>
              <span className="font-body-sm text-body-sm text-error flex items-center">Action Required</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary-container h-full rounded-full w-[45%]"></div>
            </div>
          </div>

          {/* Waived */}
          <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle hover:-translate-y-[3px] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-lg opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-text-tertiary">waving_hand</span>
            </div>
            <h3 className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest mb-sm">Waived (YTD)</h3>
            <div className="flex items-baseline gap-sm mb-lg">
              <span className="font-display-4xl text-display-4xl text-on-surface">Rs {waivedAmount}</span>
              <span className="font-body-sm text-body-sm text-text-tertiary flex items-center">{waivedCount} items</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-outline-variant h-full rounded-full w-[15%]"></div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">error</span>
        {error}
      </div>}

      {/* Detailed Table Section */}
      <div className="bg-bg-surface rounded-xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="px-card-padding py-lg border-b border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Recent Fine Activity</h3>
          <div className="flex items-center gap-sm">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-bg-page border border-border-default rounded-md pl-md pr-xl py-xs font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Waived">Waived</option>
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">expand_more</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-bright">
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Member ID & Name</th>
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Book & Reason</th>
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Amount</th>
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Status</th>
                <th className="px-card-padding py-md font-label-xs text-label-xs text-text-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-20">Loading fines...</td></tr>
              ) : fines.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 text-text-tertiary">No fine records found.</td></tr>
              ) : fines.map(fine => (
                <tr key={fine.id} className="border-b border-border-subtle hover:bg-bg-hover transition-colors">
                  <td className="px-card-padding py-md">
                    <div className="flex items-center gap-md">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-headline-sm text-headline-sm shrink-0 ${fine.status === 'paid' ? 'bg-tertiary-container text-on-tertiary-container' :
                        fine.status === 'waived' ? 'bg-surface-variant text-on-surface-variant' :
                          'bg-primary-container text-on-primary-container'
                        }`}>
                        {fine.member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{fine.member.name}</div>
                        <div className="font-code-mono text-[10px] text-text-tertiary uppercase">{fine.member.membershipId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-card-padding py-md">
                    <div className="text-on-surface font-medium truncate max-w-[200px]">{fine.borrow.book.title}</div>
                    <div className="text-[11px] text-text-secondary">Overdue {fine.daysOverdue} days</div>
                  </td>
                  <td className={`px-card-padding py-md font-bold ${fine.status === 'waived' ? 'line-through text-text-tertiary' : 'text-on-surface'}`}>
                    Rs {fine.amount}
                  </td>
                  <td className="px-card-padding py-md">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-xs text-[10px] font-bold uppercase tracking-wider ${fine.status === 'paid' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                      fine.status === 'waived' ? 'bg-surface-variant text-on-surface-variant' :
                        'bg-secondary-fixed text-on-secondary-fixed'
                      }`}>
                      {fine.status}
                    </span>
                  </td>
                  <td className="px-card-padding py-md text-right">
                    {fine.status === 'pending' ? (
                      <div className="flex justify-end gap-2 text-xs">
                        {isMember ? (
                          <span className="text-warning italic font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            Visit Desk to Pay
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handlePay(fine.id)}
                              className="px-3 py-1 rounded-md text-primary hover:bg-primary-container/20 transition-colors font-bold border border-primary/20"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFineId(fine.id);
                                setShowWaiveModal(true);
                              }}
                              className="px-3 py-1 rounded-md text-text-secondary hover:bg-bg-hover transition-colors border border-border-default md:block hidden"
                            >
                              Waive
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-tertiary italic text-xs">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-card-padding py-md border-t border-border-subtle bg-bg-surface flex justify-between items-center text-body-sm text-text-secondary">
          <span>{fines.length} entries found</span>
          <div className="flex gap-xs">
            <button className="p-1 rounded hover:bg-primary-container/20 text-text-tertiary disabled:opacity-30" disabled><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            <button className="w-8 h-8 rounded bg-primary text-on-primary font-bold text-xs transition-all shadow-sm">1</button>
            <button className="p-1 rounded hover:bg-primary-container/20 text-text-tertiary disabled:opacity-30" disabled><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Waive Modal */}
      {showWaiveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl border border-border-default transform transition-all scale-100">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h2 className="font-display-xl text-headline-xl">Waive Fine</h2>
            </div>
            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
              Are you sure you want to waive this fine? This action is permanent and requires a valid reason for auditing purposes.
            </p>
            <textarea
              className="w-full border border-border-default rounded-xl p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[120px] transition-all bg-bg-page"
              placeholder="Enter mandatory reason..."
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowWaiveModal(false);
                  setWaiveReason('');
                }}
                className="px-6 py-2.5 text-text-secondary hover:bg-bg-hover rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                disabled={!waiveReason}
                onClick={handleWaive}
                className="px-8 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:shadow-brand-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

export default FineManagement;
