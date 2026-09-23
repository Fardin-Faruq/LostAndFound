import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

interface ItemDetail {
  _id: string;
  type: string;
  title: string;
  category: string;
  description: string;
  brand?: string;
  color?: string;
  location: string;
  dateLostOrFound: string;
  imageUrl?: string;
  status: string;
  reporter?: { name: string; email: string };
  createdAt: string;
}

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(`/items/${id}`);
        setItem(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load item details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Loading item details...</p>;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Item not found</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <Link to="/browse" className="text-indigo-600 font-semibold">← Back to browse</Link>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <Link to="/browse" className="text-indigo-600 font-semibold">← Back to browse</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded-lg p-6 min-h-[220px] flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="max-h-80 w-full object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">{item.type === 'LOST' ? '📦' : '✅'}</div>
              <p className="text-gray-600 font-semibold">
                {item.type === 'LOST' ? 'Lost Item' : 'Found Item'}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${item.type === 'LOST' ? 'bg-red-500' : 'bg-green-500'}`}>
              {item.type}
            </span>
          </div>

          <p className="text-sm font-semibold text-indigo-600 mb-3">{item.category}</p>
          <p className="text-gray-700 mb-6">{item.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div><span className="font-semibold">Brand:</span> {item.brand || 'Not provided'}</div>
            <div><span className="font-semibold">Color:</span> {item.color || 'Not provided'}</div>
            <div><span className="font-semibold">Location:</span> {item.location}</div>
            <div><span className="font-semibold">Date:</span> {new Date(item.dateLostOrFound).toLocaleDateString()}</div>
            <div className="col-span-2"><span className="font-semibold">Status:</span> {item.status.replace('_', ' ')}</div>
            <div className="col-span-2"><span className="font-semibold">Reported by:</span> {item.reporter?.name || 'Unknown'}</div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Claim this item</h2>
            <p className="text-sm text-gray-600 mb-3">
              Provide a short proof summary so the office can verify ownership before approval.
            </p>

            <textarea
              value={proofDetails}
              onChange={(e) => setProofDetails(e.target.value)}
              placeholder="Example: I lost a blue water bottle with a silver cap and my student ID sticker."
              className="w-full border border-gray-300 rounded-lg p-3 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              disabled={claimSubmitting || !proofDetails.trim()}
              onClick={async () => {
                if (!id || !proofDetails.trim()) return;

                setClaimSubmitting(true);
                setClaimMessage('');

                try {
                  const { data } = await api.post(`/items/${id}/claims`, {
                    proofDetails: proofDetails.trim(),
                  });

                  setClaimMessage(`Claim submitted successfully. Status: ${data.status}`);
                  setProofDetails('');
                } catch (err: any) {
                  setClaimMessage(err.response?.data?.message || 'Unable to submit claim.');
                } finally {
                  setClaimSubmitting(false);
                }
              }}
              className="mt-3 w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>

            {claimMessage && (
              <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                {claimMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
