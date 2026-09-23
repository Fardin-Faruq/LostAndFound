import { useState, useEffect } from 'react';
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
  reporter?: { name: string };
}

const categories = ['ALL', 'Electronics', 'Clothing', 'Accessories', 'Documents', 'Other'];
const statuses = ['ALL', 'REPORTED', 'MATCH_FOUND', 'CLAIMED', 'RETURNED', 'CLOSED'];

const BrowseItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [location, setLocation] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');

      try {
        const params: Record<string, string> = {};

        if (search.trim()) params.search = search.trim();
        if (type !== 'ALL') params.type = type;
        if (category !== 'ALL') params.category = category;
        if (status !== 'ALL') params.status = status;
        if (location.trim()) params.location = location.trim();
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        if (sort) params.sort = sort;

        const { data } = await api.get('/items', { params });
        setItems(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load items.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [search, type, category, status, location, fromDate, toDate, sort]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Browse Items</h2>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, brand, description, category, location"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="ALL">All</option>
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              {categories.map((option) => (
                <option key={option} value={option}>{option === 'ALL' ? 'All categories' : option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              {statuses.map((option) => (
                <option key={option} value={option}>{option === 'ALL' ? 'All statuses' : option.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Library" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        </div>
      </div>

      {loading && <p className="text-gray-500 text-center py-8">Loading items...</p>}
      {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No items match your search.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 border-t-4 border-t-indigo-500 relative"
              style={{ borderTopColor: item.type === 'LOST' ? '#ef4444' : '#22c55e' }}
            >
              <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded text-white ${item.type === 'LOST' ? 'bg-red-500' : 'bg-green-500'}`}>
                {item.type}
              </span>

              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="h-36 w-full object-cover rounded-md mb-3" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}

              <h3 className="text-xl font-bold text-gray-800 pr-16 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-1"><strong>Category:</strong> {item.category}</p>
              <p className="text-sm text-gray-500 mb-1"><strong>Location:</strong> {item.location}</p>
              <p className="text-sm text-gray-500 mb-3"><strong>Date:</strong> {new Date(item.dateLostOrFound).toLocaleDateString()}</p>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {item.status.replace('_', ' ')}
                </span>
                {item.reporter && (
                  <span className="text-xs text-gray-400">By {item.reporter.name}</span>
                )}
              </div>

              <div className="mt-4">
                <Link to={`/items/${item._id}`} className="text-indigo-600 font-semibold hover:text-indigo-800">
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
