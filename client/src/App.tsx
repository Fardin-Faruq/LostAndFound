import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
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
        <footer className="bg-gray-800 text-white py-6 text-center">
          <p>&copy; {new Date().getFullYear()} Lost2Found - Campus Smart Portal</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
