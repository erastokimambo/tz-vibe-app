import { useState } from 'react';
import { Flame } from 'lucide-react';
import BusinessDetailModal from '../components/BusinessDetailModal';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';

export default function Trending() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'businesses'), (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBusinesses(liveData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trending data: ", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Sort businesses by trendingScore descending
  const sortedBusinesses = [...businesses].sort((a, b) => b.trendingScore - a.trendingScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A] p-4 pt-12 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-[#CD1C18] animate-pulse" size={28} />
        <h1 className="text-3xl font-bold">Trending Now</h1>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#CD1C18] animate-spin mb-4" />
            Loading trending spots...
          </div>
        ) : sortedBusinesses.length > 0 ? (
          sortedBusinesses.map((business, index) => (
            <div 
              key={business.id}
              onClick={() => setSelectedBusiness(business)}
              className="flex gap-4 p-3 bg-white dark:bg-[#4a0d13] rounded-2xl shadow-sm border dark:border-gray-800 cursor-pointer active:scale-95 transition-transform"
            >
              {/* Rank Number */}
              <div className="flex items-center justify-center w-8 text-xl font-bold text-gray-400">
                #{index + 1}
              </div>
              
              {/* Thumbnail */}
              <img 
                src={business.image || 'https://via.placeholder.com/150'} 
                alt={business.name} 
                className="w-20 h-20 object-cover rounded-xl bg-gray-200"
                onError={(e) => e.target.style.display='none'}
              />
              
              {/* Info */}
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="font-bold text-lg mb-1 leading-tight">{business.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{business.category} • {business.location}</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#CD1C18]">
                  <Flame size={12} fill="currentColor" />
                  Score: {business.trendingScore || 0}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            No trending businesses right now.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBusiness && (
        <BusinessDetailModal 
          business={selectedBusiness} 
          onClose={() => setSelectedBusiness(null)} 
        />
      )}
    </div>
  );
}
