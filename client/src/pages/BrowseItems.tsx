import { useState, useEffect } from 'react';
import api from '../services/api';

interface Item {
  _id: string;
  type: string;
  title: string;
  category: string;
  location: string;
  dateLostOrFound: string;
  status: string;
  reporter?: { name: string };
}

const BrowseItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const query = filter === 'ALL' ? '' : `?type=${filter}`;
        const { data } = await api.get(`/items${query}`);
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch items', err);
      }
    };
    fetchItems();
  }, [filter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Browse Items</h2>
        <div className="space-x-2">
          <button 
            onClick={() => setFilter('ALL')} 
            className={`px-4 py-2 rounded font-bold ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            All
          </button>
          <button 
            onClick={() => setFilter('LOST')} 
            className={`px-4 py-2 rounded font-bold ${filter === 'LOST' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Lost
          </button>
          <button 
            onClick={() => setFilter('FOUND')} 
            className={`px-4 py-2 rounded font-bold ${filter === 'FOUND' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Found
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 border-t-4 border-t-indigo-500 relative"
                 style={{ borderTopColor: item.type === 'LOST' ? '#ef4444' : '#22c55e' }}>
              <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded text-white ${item.type === 'LOST' ? 'bg-red-500' : 'bg-green-500'}`}>
                {item.type}
              </span>
              <h3 className="text-xl font-bold text-gray-800 pr-16 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-1"><strong>Category:</strong> {item.category}</p>
              <p className="text-sm text-gray-500 mb-1"><strong>Location:</strong> {item.location}</p>
              <p className="text-sm text-gray-500 mb-3"><strong>Date:</strong> {new Date(item.dateLostOrFound).toLocaleDateString()}</p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {item.status.replace('_', ' ')}
                </span>
                {item.reporter && (
                  <span className="text-xs text-gray-400">Reported by {item.reporter.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
