import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">From Lost to Found.</h1>
      <p className="text-xl text-gray-600 mb-8">A smarter way to reconnect campus belongings with their owners.</p>
      
      <div className="flex justify-center space-x-6 mb-16">
        <Link to="/report-lost" className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg">
          I Lost Something
        </Link>
        <Link to="/report-found" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg">
          I Found Something
        </Link>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md text-left">
        <h2 className="text-2xl font-bold mb-4">How it works</h2>
        <ol className="list-decimal pl-5 space-y-3 text-gray-700">
          <li><strong>Report:</strong> Create a digital report for your lost or found item.</li>
          <li><strong>Drop-off:</strong> If you found an item, take it to the physical Lost and Found office.</li>
          <li><strong>Match & Verify:</strong> The system identifies possible matches. Owners verify their identity.</li>
          <li><strong>Recover:</strong> Reclaim your item from the physical office!</li>
        </ol>
      </div>
    </div>
  );
};

export default Home;
