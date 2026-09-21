import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">Lost2Found</Link>
        <div className="space-x-4 flex items-center">
          <Link to="/browse" className="hover:text-indigo-200">Browse Items</Link>
          {user ? (
            <>
              <Link to="/report-lost" className="hover:text-indigo-200">Report Lost</Link>
              <Link to="/report-found" className="hover:text-indigo-200">Report Found</Link>
              <span className="font-semibold ml-4">Hello, {user.name}</span>
              <button onClick={logout} className="bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-200">Login</Link>
              <Link to="/register" className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-50 font-semibold">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
