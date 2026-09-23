import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

interface Claim {
  _id: string;
  status: string;
  proofDetails: string;
  claimant?: { name: string; email: string };
  item?: { _id: string; title: string; location: string; status: string };
}

const OfficeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const { data } = await api.get('/claims?itemId=all');
        setClaims(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load office queue.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchClaims();
    }
  }, [user]);

  const updateClaimStatus = async (claimId: string, nextStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const { data } = await api.put(`/claims/${claimId}/status`, { status: nextStatus });
      setClaims((current) =>
        current.map((claim) => (claim._id === claimId ? { ...claim, status: data.status } : claim))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update claim status.');
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/browse" replace />;
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Loading office queue...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Office Dashboard</h1>
        <p className="text-gray-600">Review claims and confirm physical handoff approval.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
      )}

      <div className="space-y-4">
        {claims.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">No claims in the queue.</div>
        ) : (
          claims.map((claim) => (
            <div key={claim._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{claim.item?.title || 'Item'}</h2>
                  <p className="text-sm text-gray-600">Location: {claim.item?.location || 'Unknown'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${claim.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {claim.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                <div><span className="font-semibold">Claimant:</span> {claim.claimant?.name || 'Unknown'}</div>
                <div><span className="font-semibold">Email:</span> {claim.claimant?.email || 'Unknown'}</div>
              </div>

              <p className="text-gray-700 mb-4"><span className="font-semibold">Proof details:</span> {claim.proofDetails}</p>

              {claim.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button onClick={() => updateClaimStatus(claim._id, 'APPROVED')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => updateClaimStatus(claim._id, 'REJECTED')} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OfficeDashboard;
