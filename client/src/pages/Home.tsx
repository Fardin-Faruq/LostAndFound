import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Electronics', icon: '💻', count: 'Laptops, Phones, AirPods' },
  { name: 'Accessories', icon: '🎒', count: 'Bags, Watches, Glasses' },
  { name: 'Documents', icon: '🪪', count: 'Student IDs, Cards, Passports' },
  { name: 'Clothing', icon: '🧥', count: 'Jackets, Hoodies, Caps' },
  { name: 'Other', icon: '🔑', count: 'Keys, Water Bottles, Books' },
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="py-6 sm:py-12 space-y-16 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center relative">
        {/* Decorative background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Campus Smart Lost &amp; Found Portal Active
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
          Lost Something? Found Something?{' '}
          <span className="gradient-text-indigo block sm:inline">We Reconnect You.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          The official campus Lost &amp; Found hub connecting students and staff with intelligent matching, verified ownership claims, and secure physical office handoffs.
        </p>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-10 px-2">
          <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/90 p-1.5 focus-within:ring-4 focus-within:ring-indigo-500/15 focus-within:border-indigo-500 transition-all">
            <div className="pl-4 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, item name, or location (e.g., AirPods, Library, Blue Bottle)..."
              className="w-full px-3 py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all shadow-sm hover:shadow-indigo-500/25 flex-shrink-0 flex items-center gap-1.5"
            >
              Search
            </button>
          </div>
        </form>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/report-lost"
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all duration-200 card-hover"
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">🔍</span>
            I Lost Something
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            to="/report-found"
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-200 card-hover"
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">📦</span>
            I Found Something
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200 font-bold text-base shadow-sm hover:shadow transition-all"
          >
            Browse All Items
          </Link>
        </div>
      </section>

      {/* Category Quick Filters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-sm text-slate-500 mt-0.5">Quickly discover recently reported items on campus</p>
          </div>
          <Link to="/browse" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View all <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/browse?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">{cat.icon}</div>
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Workflow Cards */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            How Lost2Found Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Seamlessly bridging digital reports with physical campus office recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm mb-4">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">1. Report Online</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Create a digital report with category, location, approximate time, and optional photo.
            </p>
          </div>

          <div className="relative p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm mb-4">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">2. Secure Drop-off</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Found items are brought to the campus Lost &amp; Found desk where staff logs the storage shelf.
            </p>
          </div>

          <div className="relative p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm mb-4">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">3. Smart Matching</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our automated engine cross-references attributes and dispatches instant match notifications.
            </p>
          </div>

          <div className="relative p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm mb-4">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">4. Safe Handover</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Verify proof of ownership online or in-person with student ID to reclaim your item.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Trust Banner */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-950/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Official Campus Service
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Physical Lost &amp; Found Office
          </h2>
          <p className="text-indigo-200/80 text-sm max-w-xl mt-1.5">
            Student Union Building · Room 104 · Monday to Friday, 8:30 AM – 5:00 PM. Have your campus ID ready for item handovers.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link
            to="/browse"
            className="px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Check Found Items
          </Link>
          <Link
            to="/report-lost"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-colors"
          >
            File a Report
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

