import { useContext, useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

interface Item {
  _id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  physicalItemReceived: boolean;
  storageReference?: string;
  storageLocation?: string;
  imageUrl?: string;
  reporter?: { name: string; email: string };
  createdAt: string;
}

interface Claim {
  _id: string;
  status: string;
  proofDetails: string;
  explanation?: string;
  whereLost?: string;
  identifyingCharacteristics?: string;
  claimant?: { name: string; email: string };
  item?: { _id: string; title: string; category: string; location: string; status: string; physicalItemReceived: boolean };
  reviewedAt?: string;
  createdAt: string;
}

interface Stats {
  totalLost: number;
  totalFound: number;
  physicallyReceived: number;
  pendingClaims: number;
  matchedItems: number;
  returnedItems: number;
  unclaimedItems: number;
}

const BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  REPORTED: 'bg-gray-100 text-gray-700',
  CLAIMED: 'bg-purple-100 text-purple-800',
  RETURNED: 'bg-green-100 text-green-800',
};

// --- Receive Item Modal ---
interface ReceiveModalProps {
  item: Item;
  onClose: () => void;
  onConfirm: (storageRef: string, storageLocation: string) => void;
}
const ReceiveModal = ({ item, onClose, onConfirm }: ReceiveModalProps) => {
  const [storageRef, setStorageRef] = useState('');
  const [storageLoc, setStorageLoc] = useState('Lost & Found Main Office');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Confirm Physical Receipt</h3>
        <p className="text-sm text-gray-500 mb-4">Recording receipt of: <span className="font-semibold text-gray-800">{item.title}</span></p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Storage Reference (e.g. SHELF-A3)</label>
            <input
              id="storage-ref-input"
              value={storageRef}
              onChange={(e) => setStorageRef(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              placeholder="SHELF-A3"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Storage Location</label>
            <input
              id="storage-loc-input"
              value={storageLoc}
              onChange={(e) => setStorageLoc(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            id="confirm-receive-btn"
            onClick={() => onConfirm(storageRef, storageLoc)}
            className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Confirm Receipt
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Reject Modal ---
interface RejectModalProps {
  claim: Claim;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}
const RejectModal = ({ claim, onClose, onConfirm }: RejectModalProps) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Reject Claim</h3>
        <p className="text-sm text-gray-500 mb-4">Claim for: <span className="font-semibold text-gray-800">{claim.item?.title}</span></p>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Rejection Reason (optional)</label>
          <textarea
            id="rejection-reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-24 focus:ring-2 focus:ring-red-400 focus:outline-none"
            placeholder="e.g., Insufficient proof of ownership provided"
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button
            id="confirm-reject-btn"
            onClick={() => onConfirm(reason)}
            className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-colors"
          >
            Reject Claim
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Stat Card ---
const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) => (
  <div className={`rounded-2xl p-5 border ${color} flex items-center gap-4`}>
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-sm font-medium opacity-80">{label}</p>
    </div>
  </div>
);

// ============================================================
// Main Component
// ============================================================
const OfficeDashboard = () => {
  const { user } = useContext(AuthContext);

  const [tab, setTab] = useState<'claims' | 'inventory'>('claims');
  const [stats, setStats] = useState<Stats | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [receiveModal, setReceiveModal] = useState<Item | null>(null);
  const [rejectModal, setRejectModal] = useState<Claim | null>(null);

  // Filters
  const [claimFilter, setClaimFilter] = useState('ALL');
  const [invFilter, setInvFilter] = useState('ALL');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, claimsRes, invRes] = await Promise.all([
        api.get('/office/stats'),
        api.get('/office/claims'),
        api.get('/office/items'),
      ]);
      setStats(statsRes.data);
      setClaims(claimsRes.data);
      setInventory(invRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load office data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') loadData();
  }, [user, loadData]);

  // --- Claim Actions ---
  const handleReviewClaim = async (claimId: string) => {
    try {
      await api.put(`/office/claims/${claimId}/review`);
      setClaims((prev) => prev.map((c) => c._id === claimId ? { ...c, status: 'UNDER_REVIEW' } : c));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update claim.');
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    try {
      const { data } = await api.put(`/office/claims/${claimId}/approve`);
      setClaims((prev) => prev.map((c) => c._id === claimId ? { ...c, ...data } : c));
      loadData(); // refresh stats
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve claim.');
    }
  };

  const handleRejectClaim = async (claimId: string, reason: string) => {
    try {
      const { data } = await api.put(`/office/claims/${claimId}/reject`, { rejectionReason: reason });
      setClaims((prev) => prev.map((c) => c._id === claimId ? { ...c, ...data } : c));
      setRejectModal(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject claim.');
    }
  };

  // --- Inventory Actions ---
  const handleReceiveItem = async (itemId: string, storageRef: string, storageLoc: string) => {
    try {
      await api.put(`/office/items/${itemId}/receive`, {
        storageReference: storageRef || 'SHELF-DEFAULT',
        storageLocation: storageLoc || 'Lost & Found Main Office',
      });
      setInventory((prev) => prev.map((i) =>
        i._id === itemId ? { ...i, physicalItemReceived: true, storageReference: storageRef, storageLocation: storageLoc } : i
      ));
      setReceiveModal(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record receipt.');
    }
  };

  const handleReturnItem = async (itemId: string) => {
    if (!window.confirm('Confirm item handover to owner? This will mark the item as RETURNED.')) return;
    try {
      await api.put(`/office/items/${itemId}/return`);
      setInventory((prev) => prev.map((i) => i._id === itemId ? { ...i, status: 'RETURNED' } : i));
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark returned.');
    }
  };

  // --- Guards ---
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/browse" replace />;

  // --- Filtered Lists ---
  const filteredClaims = claimFilter === 'ALL' ? claims : claims.filter((c) => c.status === claimFilter);
  const filteredInv = invFilter === 'ALL' ? inventory : inventory.filter((i) => i.status === invFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Office Dashboard</h1>
          <p className="text-gray-500 mt-0.5">Manage physical items, review claims, and track office inventory.</p>
        </div>
        <button
          id="refresh-office-btn"
          onClick={loadData}
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Lost Reports" value={stats.totalLost} color="bg-red-50 border-red-200 text-red-800" icon="📭" />
          <StatCard label="Total Found Reports" value={stats.totalFound} color="bg-green-50 border-green-200 text-green-800" icon="📬" />
          <StatCard label="Pending Claims" value={stats.pendingClaims} color="bg-yellow-50 border-yellow-200 text-yellow-800" icon="⏳" />
          <StatCard label="Items Returned" value={stats.returnedItems} color="bg-indigo-50 border-indigo-200 text-indigo-800" icon="✅" />
          <StatCard label="Physically Received" value={stats.physicallyReceived} color="bg-blue-50 border-blue-200 text-blue-800" icon="📦" />
          <StatCard label="Match Found" value={stats.matchedItems} color="bg-purple-50 border-purple-200 text-purple-800" icon="🔍" />
          <StatCard label="Unclaimed in Office" value={stats.unclaimedItems} color="bg-orange-50 border-orange-200 text-orange-800" icon="🗃️" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          id="tab-claims"
          onClick={() => setTab('claims')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${tab === 'claims' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Claims Queue {claims.filter((c) => c.status === 'PENDING').length > 0 && (
            <span className="ml-1.5 bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full">
              {claims.filter((c) => c.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          id="tab-inventory"
          onClick={() => setTab('inventory')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${tab === 'inventory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Physical Inventory
        </button>
      </div>

      {/* ===================== CLAIMS TAB ===================== */}
      {tab === 'claims' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((s) => (
              <button
                key={s}
                id={`claim-filter-${s}`}
                onClick={() => setClaimFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${claimFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-10">Loading claims...</p>
          ) : filteredClaims.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
              No claims match the selected filter.
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div key={claim._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                {/* Claim Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{claim.item?.title || 'Unknown Item'}</h2>
                    <p className="text-sm text-gray-500">{claim.item?.category} · {claim.item?.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${BADGE[claim.status] || 'bg-gray-100 text-gray-600'}`}>
                    {claim.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Claimant Info */}
                <div className="grid sm:grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
                  <div><span className="font-semibold text-gray-700">Claimant:</span> {claim.claimant?.name || '—'}</div>
                  <div><span className="font-semibold text-gray-700">Email:</span> {claim.claimant?.email || '—'}</div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-gray-700">Submitted:</span>{' '}
                    {new Date(claim.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Claim Details */}
                <div className="space-y-1 text-sm text-gray-700">
                  <p><span className="font-semibold">Proof details:</span> {claim.proofDetails}</p>
                  {claim.explanation && <p><span className="font-semibold">Explanation:</span> {claim.explanation}</p>}
                  {claim.whereLost && <p><span className="font-semibold">Where lost:</span> {claim.whereLost}</p>}
                  {claim.identifyingCharacteristics && (
                    <p><span className="font-semibold">Identifying features:</span> {claim.identifyingCharacteristics}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap pt-1">
                  {claim.status === 'PENDING' && (
                    <>
                      <button
                        id={`review-claim-${claim._id}`}
                        onClick={() => handleReviewClaim(claim._id)}
                        className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Mark Under Review
                      </button>
                      <button
                        id={`approve-claim-${claim._id}`}
                        onClick={() => handleApproveClaim(claim._id)}
                        className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        id={`reject-claim-${claim._id}`}
                        onClick={() => setRejectModal(claim)}
                        className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {claim.status === 'UNDER_REVIEW' && (
                    <>
                      <button
                        id={`approve-claim-${claim._id}`}
                        onClick={() => handleApproveClaim(claim._id)}
                        className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        id={`reject-claim-${claim._id}`}
                        onClick={() => setRejectModal(claim)}
                        className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===================== INVENTORY TAB ===================== */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'REPORTED', 'MATCH_FOUND', 'CLAIMED', 'RETURNED'].map((s) => (
              <button
                key={s}
                id={`inv-filter-${s}`}
                onClick={() => setInvFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${invFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-10">Loading inventory...</p>
          ) : filteredInv.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
              No found items in office.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredInv.map((item) => (
                <div key={item._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-900">{item.title}</h2>
                      <p className="text-sm text-gray-500">{item.category} · {item.location}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${BADGE[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <span className="font-semibold">Physical receipt:</span>{' '}
                      {item.physicalItemReceived
                        ? <span className="text-green-600 font-bold">✓ Received</span>
                        : <span className="text-yellow-600 font-bold">⏳ Pending</span>}
                    </p>
                    {item.storageReference && <p><span className="font-semibold">Ref:</span> {item.storageReference}</p>}
                    {item.storageLocation && <p><span className="font-semibold">Location:</span> {item.storageLocation}</p>}
                    {item.reporter && <p><span className="font-semibold">Reported by:</span> {item.reporter.name}</p>}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {!item.physicalItemReceived && (
                      <button
                        id={`receive-item-${item._id}`}
                        onClick={() => setReceiveModal(item)}
                        className="bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        📦 Record Receipt
                      </button>
                    )}
                    {item.physicalItemReceived && item.status !== 'RETURNED' && (
                      <button
                        id={`return-item-${item._id}`}
                        onClick={() => handleReturnItem(item._id)}
                        className="bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-700 transition-colors"
                      >
                        ✅ Mark Returned
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {receiveModal && (
        <ReceiveModal
          item={receiveModal}
          onClose={() => setReceiveModal(null)}
          onConfirm={(ref, loc) => handleReceiveItem(receiveModal._id, ref, loc)}
        />
      )}
      {rejectModal && (
        <RejectModal
          claim={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={(reason) => handleRejectClaim(rejectModal._id, reason)}
        />
      )}
    </div>
  );
};

export default OfficeDashboard;
