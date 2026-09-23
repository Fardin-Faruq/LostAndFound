import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import BrowseItems from './pages/BrowseItems';
import ItemDetails from './pages/ItemDetails';
import OfficeDashboard from './pages/OfficeDashboard';
import MyDashboard from './pages/MyDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/report-lost" element={<ReportLost />} />
            <Route path="/report-found" element={<ReportFound />} />
            <Route path="/browse" element={<BrowseItems />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/office" element={<OfficeDashboard />} />
            <Route path="/dashboard" element={<MyDashboard />} />
          </Routes>
        </main>

        {/* Modern Footer */}
        <footer className="border-t mt-12 py-10" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-base)' }}>
          <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                🔍
              </div>
              <div>
                <span className="font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Lost2Found</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Campus Belongings Management &amp; Recovery</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <Link to="/browse" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Browse Directory</Link>
              <Link to="/report-lost" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Report Lost</Link>
              <Link to="/report-found" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Report Found</Link>
              <Link to="/office" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Office Desk</Link>
            </div>

            <p className="text-xs text-center sm:text-right" style={{ color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} Lost2Found Portal. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
