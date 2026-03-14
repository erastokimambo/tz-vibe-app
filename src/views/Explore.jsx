import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import BusinessDetailModal from '../components/BusinessDetailModal';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';

const categories = ['All', 'DJs', 'Bars & Clubs', 'Wedding Venues'];

export default function Explore() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
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
      console.error("Error fetching live data: ", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || !!(b.category && b.category.includes(selectedCategory));
    const safeName = b.name || '';
    const safeLoc = b.location || '';
    const matchesSearch = safeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          safeLoc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-2 border-b dark:border-gray-800">
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search places or DJs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#CD1C18] transition"
            />
          </div>
          <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-700 dark:text-gray-300">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-none px-5 py-2 rounded-full font-semibold transition-colors ${
                selectedCategory === cat 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#CD1C18] animate-spin mb-4" />
            Loading live discovery feed...
          </div>
        ) : filteredBusinesses.length > 0 ? (
          filteredBusinesses.map((business) => (
            <BusinessCard 
              key={business.id} 
              business={business} 
              onClick={() => setSelectedBusiness(business)}
            />
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            No results found for "{searchQuery}"
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
