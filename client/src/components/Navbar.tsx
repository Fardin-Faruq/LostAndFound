import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-[0_2px_15px_-3px_rgba(0,0,0,0.06)]">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
              <path d="M11 8v6"></path>
              <path d="M8 11h6"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            {/* Use CSS-var classes so text is always visible in both modes */}
            <span className="nav-brand-text text-xl flex items-center gap-0.5">
              Lost<span className="nav-brand-accent">2</span>Found
            </span>
            <span className="nav-brand-sub -mt-0.5">Campus Portal</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/browse"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              isActive('/browse')
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
            }`}
          >
            Browse
          </Link>

          {user ? (
            <>
              <Link
                to="/report-lost"
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive('/report-lost')
                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-900/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Report Lost
              </Link>

              <Link
                to="/report-found"
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive('/report-found')
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Report Found
              </Link>

              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive('/dashboard')
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
                }`}
              >
                Dashboard
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  to="/office"
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                    isActive('/office')
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                      : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-700/40 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                  }`}
                >
                  Office Staff
                </Link>
              )}

              {/* Notification Bell */}
              <div className="ml-1">
                <NotificationPanel />
              </div>

              {/* Dark Mode Toggle */}
              <button
                id="dark-mode-toggle"
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark mode"
                style={{ color: 'var(--text-secondary)' }}
                className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {isDark ? (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" strokeWidth="2" strokeLinecap="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 ml-1" style={{ borderLeft: '1px solid var(--border-base)' }}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm select-none">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  id="logout-btn"
                  onClick={logout}
                  title="Sign out"
                  style={{ color: 'var(--text-muted)' }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              {/* Dark Mode Toggle (guest) */}
              <button
                id="dark-mode-toggle-guest"
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark mode"
                style={{ color: 'var(--text-secondary)' }}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {isDark ? (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" strokeWidth="2" strokeLinecap="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>

              <Link
                to="/login"
                style={{ color: 'var(--text-primary)' }}
                className="px-4 py-2 text-sm font-semibold hover:text-indigo-600 hover:bg-slate-100/80 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
