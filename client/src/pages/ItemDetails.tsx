import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

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
  const [imageError, setImageError] = useState(false);
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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-sm"
        >
          <span>←</span> Back to all items
        </Link>
      </div>

      {/* Main Item Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Image Area */}
          <div className="lg:col-span-5 bg-slate-50/80 p-6 sm:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200/80">
            <div className="w-full max-w-sm aspect-square bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center relative">
              {item.imageUrl && !imageError ? (
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-center p-6">
                  <div className="text-6xl mb-3">{item.type === 'LOST' ? '🔍' : '📦'}</div>
                  <p className="text-sm font-bold text-slate-700">
                    {item.type === 'LOST' ? 'Lost Item Report' : 'Found Item'}
                  </p>
                  <span className="inline-block mt-2 text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                    {item.category}
                  </span>
                </div>
              )}

              {/* Type Badge on Top of Image */}
              <div className="absolute top-3 left-3">
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-sm ${
                    item.type === 'LOST'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {item.type}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
              Item ID: <span className="font-mono">{item._id}</span>
            </p>
          </div>

          {/* Right Column: Details & Claim Area */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    item.status === 'REPORTED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : item.status === 'MATCH_FOUND'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : item.status === 'CLAIMED'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : item.status === 'RETURNED'
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {item.title}
              </h1>

              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {item.description || 'No detailed description was provided for this item.'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Location</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">{item.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Date Reported</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {new Date(item.dateLostOrFound).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Brand</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{item.brand || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Color</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{item.color || '—'}</span>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <span className="text-slate-400 block font-semibold">Reported By</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {item.reporter?.name ? item.reporter.name : 'Campus Community Member'}
                </span>
              </div>
            </div>

            {/* Claim Section (only if item is not returned or closed) */}
            {item.status !== 'RETURNED' && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>📋</span> Claim This Item
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Describe any unique marks, serial numbers, wallpapers, or identifying features so staff can verify ownership.
                  </p>
                </div>

                <textarea
                  value={proofDetails}
                  onChange={(e) => setProofDetails(e.target.value)}
                  placeholder="e.g., The phone has a cracked screen protector and a photo of a golden retriever as the lock screen..."
                  className="w-full text-sm border border-slate-200 rounded-xl p-3.5 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
                />

                <div className="flex items-center gap-3">
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

                        setClaimMessage(`Claim submitted successfully! Status: ${data.status}. The office will review your request.`);
                        setProofDetails('');
                      } catch (err: any) {
                        setClaimMessage(err.response?.data?.message || 'Unable to submit claim. Please try again.');
                      } finally {
                        setClaimSubmitting(false);
                      }
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all shadow-sm hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {claimSubmitting ? 'Submitting Claim...' : 'Submit Ownership Claim'}
                  </button>
                </div>

                {claimMessage && (
                  <div className={`p-3.5 rounded-xl text-xs font-semibold ${
                    claimMessage.includes('successfully')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {claimMessage}
                  </div>
                )}
              </div>
            )}

            {/* Office Physical Pickup Directions */}
            <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
              <span className="text-xl">🏢</span>
              <div>
                <p className="font-bold text-indigo-900">Student Welfare Office</p>
                <p className="text-indigo-800/80 mt-0.5">
                  PRP Anx, 2nd Floor · Mon–Fri 8:30 AM – 5:00 PM. Please bring your campus ID card for physical retrieval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;

