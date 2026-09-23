import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  reporter?: { name: string };
}

const categories = ['ALL', 'Electronics', 'Clothing', 'Accessories', 'Documents', 'Other'];
const statuses = ['ALL', 'REPORTED', 'MATCH_FOUND', 'CLAIMED', 'RETURNED', 'CLOSED'];

const categoryIcons: Record<string, string> = {
  Electronics: '💻',
  Clothing: '🧥',
  Accessories: '🎒',
  Documents: '🪪',
  Other: '🔑',
};

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [status, setStatus] = useState('ALL');
  const [location, setLocation] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync state if URL query params change
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    const urlType = searchParams.get('type');
    if (urlSearch !== null) setSearch(urlSearch);
    if (urlCategory !== null) setCategory(urlCategory);
    if (urlType !== null) setType(urlType);
  }, [searchParams]);

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

  const clearAllFilters = () => {
    setSearch('');
    setType('ALL');
    setCategory('ALL');
    setStatus('ALL');
    setLocation('');
    setFromDate('');
    setToDate('');
    setSort('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    type !== 'ALL' ||
    category !== 'ALL' ||
    status !== 'ALL' ||
    location.trim() !== '' ||
    fromDate !== '' ||
    toDate !== '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Items</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search and filter all items reported lost or found across campus
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/report-lost"
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Lost Item
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Found Item
          </Link>
        </div>
      </div>

      {/* Main Filter & Search Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 space-y-4">
        {/* Search Bar + Segmented Type Control */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, brand, item name, or location..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Segmented Pill */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start md:self-auto">
            {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  type === t
                    ? t === 'LOST'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : t === 'FOUND'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t === 'LOST' ? 'Lost' : 'Found'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                category === c
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
              }`}
            >
              {c !== 'ALL' && <span>{categoryIcons[c] || '🏷️'}</span>}
              <span>{c === 'ALL' ? 'All Categories' : c}</span>
            </button>
          ))}

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`ml-auto text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
              showAdvanced
                ? 'bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>⚙️</span>
            <span>{showAdvanced ? 'Hide Filters' : 'More Filters'}</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location Filter</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Library, Gym, Cafeteria"
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="newest">Newest reports first</option>
                <option value="oldest">Oldest reports first</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Clear Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtering active results</span>
            <button
              onClick={clearAllFilters}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Item Results Count / Loading */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>{loading ? 'Searching...' : `Showing ${items.length} ${items.length === 1 ? 'item' : 'items'}`}</span>
        {sort === 'newest' ? <span>Ordered by most recent</span> : <span>Ordered by oldest</span>}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-pulse space-y-4">
              <div className="h-40 bg-slate-200 rounded-xl"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-3xl mx-auto mb-4">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No matching items found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            We couldn't find any items matching your active search criteria. Try relaxing your filters or filing a new report.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
            >
              Clear Filters
            </button>
            <Link
              to="/report-lost"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Report Lost Item
            </Link>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <Link
              key={item._id}
              to={`/items/${item._id}`}
              className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image or Category Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100">
                      <span className="text-4xl mb-1">{categoryIcons[item.category] || '📦'}</span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
                        item.type === 'LOST'
                          ? 'bg-rose-500/95 text-white'
                          : 'bg-emerald-600/95 text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      {item.type}
                    </span>
                  </div>

                  {/* Category Pill Tag on Image */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-900/60 text-white backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📍</span>
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📅</span>
                      <span>{new Date(item.dateLostOrFound).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    item.status === 'REPORTED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      : item.status === 'MATCH_FOUND'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      : item.status === 'CLAIMED'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      : item.status === 'RETURNED'
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>

                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseItems;

