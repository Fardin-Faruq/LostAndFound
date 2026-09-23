import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your reports, possible matches, and claims.</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded">{error}</p>}

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Possible matches</h2>
        {matches.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-gray-600">No possible matches yet. We will show found items that resemble your lost reports here.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match) => (
              <div key={`${match.lostItem._id}-${match.foundItem._id}`} className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-green-700">{match.score}% possible match</p>
                    <h3 className="text-lg font-bold text-gray-900">{match.foundItem.title}</h3>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded h-fit">FOUND</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Near {match.foundItem.location} on {new Date(match.foundItem.dateLostOrFound).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600 mt-1">Matches: {match.reasons.join(', ')}</p>
                <Link to={`/items/${match.foundItem._id}`} className="inline-block mt-4 text-indigo-600 font-semibold hover:text-indigo-800">View and claim item</Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">My reports</h2>
        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-gray-600">You have not reported an item yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <Link key={item._id} to={`/items/${item._id}`} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-400">
                <div className="flex justify-between gap-3">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${item.type === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.type}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{item.category} · {item.location}</p>
                <p className="text-sm text-gray-500 mt-1">Status: {item.status.replace('_', ' ')}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">My claims</h2>
        {claims.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-gray-600">You have not submitted any claims.</div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim._id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">{claim.item?.title || 'Claimed item'}</h3>
                  <p className="text-sm text-gray-600">Submitted {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : ''}</p>
                </div>
                <span className={`h-fit text-xs font-bold px-3 py-1 rounded-full ${claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' : claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{claim.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyDashboard;
