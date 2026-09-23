import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

interface Item {
  _id: string;
  type: string;
  title: string;
  category: string;
  location: string;
  dateLostOrFound: string;
  status: string;
  imageUrl?: string;
}

interface Match {
  foundItem: Item;
  lostItem: Item;
  score: number;
  reasons: string[];
}

interface Claim {
  _id: string;
  status: string;
  proofDetails: string;
  item?: Item;
  createdAt?: string;
}

const MyDashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [itemsResponse, matchesResponse, claimsResponse] = await Promise.all([
          api.get('/items/mine'),
          api.get('/items/matches'),
          api.get('/claims?itemId=mine'),
        ]);
        setItems(itemsResponse.data);
        setMatches(matchesResponse.data);
        setClaims(claimsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <p className="text-center text-gray-500 py-10">Loading your dashboard...</p>;

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your lost &amp; found reports, intelligent match alerts, and verified claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/report-lost"
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Report Lost
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Report Found
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            📝
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{items.length}</p>
            <p className="text-xs font-semibold text-slate-500">My Filed Reports</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            🔍
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{matches.length}</p>
            <p className="text-xs font-semibold text-slate-500">Potential Matches</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
            📋
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{claims.length}</p>
            <p className="text-xs font-semibold text-slate-500">Ownership Claims</p>
          </div>
        </div>
      </div>

      {/* Section 1: Matches */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Possible Matches</h2>
            {matches.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {matches.length} found
              </span>
            )}
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            <span className="text-3xl mb-2 block">🎯</span>
            <p className="text-sm font-semibold text-slate-700">No active match alerts right now.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              When a found item resembles one of your reported lost belongings, our deterministic matching engine will automatically highlight it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match) => (
              <div
                key={`${match.lostItem._id}-${match.foundItem._id}`}
                className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all card-hover space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {match.score}% Match Confidence
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{match.foundItem.title}</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-lg">
                    FOUND
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>📍 Found near: <span className="font-semibold text-slate-800">{match.foundItem.location}</span></p>
                  <p>📅 Reported on: <span className="font-semibold text-slate-800">{new Date(match.foundItem.dateLostOrFound).toLocaleDateString()}</span></p>
                  <p>💡 Matching criteria: <span className="font-semibold text-indigo-700">{match.reasons.join(', ')}</span></p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Matches your lost report: <strong className="text-slate-600">{match.lostItem.title}</strong>
                  </span>
                  <Link
                    to={`/items/${match.foundItem._id}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    View &amp; Claim →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: My Reports */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Filed Reports</h2>
        {items.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            <span className="text-3xl mb-2 block">📭</span>
            <p className="text-sm font-semibold text-slate-700">You haven't filed any reports yet.</p>
            <p className="text-xs text-slate-400 mt-1">Lost something or found someone's belonging? File a quick report to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item._id}
                to={`/items/${item._id}`}
                className="group bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex gap-4 items-start card-hover"
              >
                {item.imageUrl ? (
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0 bg-slate-100 border border-slate-100"
                    crossOrigin="anonymous"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.type === 'LOST' ? '🔍' : '📦'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        item.type === 'LOST' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {item.category} · {item.location}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.dateLostOrFound).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: My Claims */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Ownership Claims</h2>
        {claims.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            <span className="text-3xl mb-2 block">🏷️</span>
            <p className="text-sm font-semibold text-slate-700">No active claims submitted.</p>
            <p className="text-xs text-slate-400 mt-1">When you claim an item from the browse page, its verification status will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {claim.item?.title || 'Claimed Belonging'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Proof submitted: <span className="italic text-slate-600">"{claim.proofDetails}"</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Submitted: {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>

                <div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      claim.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : claim.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {claim.status === 'APPROVED' ? '✅ Approved — Ready for Pickup' : claim.status === 'REJECTED' ? '❌ Not Approved' : '⏳ Pending Office Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyDashboard;

