import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const ReportFound = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    location: '',
    dateLostOrFound: '',
  });

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/items', { ...formData, type: 'FOUND' });
      alert('Thank you for reporting! Please submit the physical item to the Lost and Found Office as soon as possible.');
      navigate('/browse');
    } catch (err) {
      console.error(err);
      alert('Error reporting item');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded shadow">
      <h2 className="text-3xl font-bold mb-2 text-green-600">Report Found Item</h2>
      <p className="text-gray-600 mb-6 font-semibold bg-green-50 p-3 rounded">
        IMPORTANT: Reporting here helps the owner find it online. You MUST drop the physical item at the Campus Lost & Found Office to complete the process.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-1">Item Title</label>
          <input name="title" required value={formData.title} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g., Blue Water Bottle" />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-1">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Documents">Documents/IDs</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-1">Location Found</label>
          <input name="location" required value={formData.location} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g., Cafeteria table 4" />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-1">Date Found</label>
          <input type="date" name="dateLostOrFound" required value={formData.dateLostOrFound} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-1">Description</label>
          <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-32" placeholder="e.g., Found a blue hydroflask left behind"></textarea>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700">Submit Found Report</button>
      </form>
    </div>
  );
};

export default ReportFound;
