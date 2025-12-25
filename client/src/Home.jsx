import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const Home = () => {
  const [guides, setGuides] = useState([]); // storage for guide list
  //running this function when page loads
  useEffect(() => {
    //getting all guides from our backend
    const fetchGuides = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/guides');
        setGuides(res.data);
      } catch (error) {
        console.error('error fetching guides:', error);
      }
    };
    fetchGuides();
  }, []);

  //handler function for new guide btn
  const handleNewGuide = () => {
    alert("To record a new guide, please click on the Clueso Extension icon in your browser toolbar! 🧩");
  }
  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Library</h1>
        
        {/* updated btn with onClick */}
        <button 
          onClick={handleNewGuide}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + New Guide
        </button>
      </div>

      {/* grid layout for cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          // link wrapper to make card clickable
          <Link to={`/guide/${guide._id}`} key={guide._id} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* fake thumbnail area */}
              <div className="h-40 bg-gray-200 flex items-center justify-center relative bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-4xl opacity-50 group-hover:scale-110 transition-transform">▶️</span>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate">
                  {guide.title || "Untitled Recording"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(guide.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {/* empty state handling(if there's no guide present) */}
        {guides.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
                No guides yet. Open the extension to start recording!
            </div>
        )}
      </div>
    </div>
  );
};
export default Home;