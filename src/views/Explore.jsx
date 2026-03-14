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
  
  // Advanced Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState('All');

  // Search Interaction States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('tzvibe_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSearchSubmit = (term) => {
    const query = typeof term === 'string' ? term : searchQuery;
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setIsSearchFocused(false);
    
    // Save to recents (keep last 5)
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(item => item !== query)].slice(0, 5);
      localStorage.setItem('tzvibe_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

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
    
    // Advanced Filters
    const matchesRating = (b.rating || 0) >= minRating;
    const matchesPrice = selectedPrice === 'All' || b.priceRange === selectedPrice;

    return matchesCategory && matchesSearch && matchesRating && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-2 border-b dark:border-gray-800">
        <div className="max-w-4xl mx-auto w-full">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-4 relative z-50">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}>
              <input 
                type="text" 
                placeholder="Search places or DJs..." 
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#CD1C18] transition"
              />
            </form>

            {/* Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#4a0d13] border dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50">
                
                {/* Auto-suggest Matches */}
                {searchQuery.trim() && filteredBusinesses.length > 0 && (
                  <div className="p-2 border-b dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-400 ml-2 mb-2 uppercase">Suggestions</p>
                    {filteredBusinesses.slice(0, 3).map(b => (
                      <div 
                        key={`sugg-${b.id}`}
                        onClick={() => {
                          handleSearchSubmit(b.name);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
                      >
                        <Search size={14} className="text-gray-400" />
                        <span className="font-medium text-sm dark:text-gray-200">{b.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{b.category}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {!searchQuery.trim() && recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between ml-2 mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase">Recent Searches</p>
                    </div>
                    {recentSearches.map((term, i) => (
                      <div 
                        key={i}
                        onClick={() => handleSearchSubmit(term)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
                      >
                        <Search size={14} className="text-[#CD1C18]" />
                        <span className="font-medium text-sm dark:text-gray-200">{term}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Empty State */}
                {!searchQuery.trim() && recentSearches.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Start typing to search Event Vibes...
                  </div>
                )}
              </div>
            )}
            
            {/* Invisible closer background overlay */}
            {isSearchFocused && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsSearchFocused(false)}
              />
            )}
          </div>
          <button 
            onClick={() => setShowFilters(true)}
            className={`p-3 rounded-2xl transition-colors ${showFilters || minRating > 0 || selectedPrice !== 'All' ? 'bg-[#CD1C18] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

          {/* Categories */}
          <div className="flex justify-center w-full">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-none px-6 py-2.5 rounded-full font-bold transition-all shadow-sm ${
                    selectedCategory === cat 
                      ? 'bg-[#CD1C18] text-white scale-105' 
                      : 'bg-white dark:bg-[#4a0d13] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#CD1C18] animate-spin mb-4" />
            Loading live discovery feed...
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                onClick={() => setSelectedBusiness(business)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">No Vibes Found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              We couldn't find anything matching "{searchQuery}". Try adjusting your filters or searching for something else!
            </p>
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

      {/* Advanced Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white dark:bg-[#4a0d13] w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold dark:text-white">Filters</h2>
              <button 
                onClick={() => setShowFilters(false)}
                className="text-gray-500 dark:text-gray-400 font-medium"
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Price Range</label>
                <div className="flex gap-2">
                  {['All', '$', '$$', '$$$', '$$$$'].map(price => (
                    <button
                      key={price}
                      onClick={() => setSelectedPrice(price)}
                      className={`flex-1 py-2 rounded-xl font-bold transition-colors ${selectedPrice === price ? 'bg-[#CD1C18] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Minimum Rating</label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 3, 4, 4.5, 4.8].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`px-4 py-2 rounded-xl font-bold transition-colors ${minRating === rating ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+ Stars`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-800 flex gap-3">
                 <button 
                  onClick={() => {
                    setMinRating(0);
                    setSelectedPrice('All');
                  }}
                  className="flex-1 py-4 font-bold text-gray-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="flex-[2] bg-[#CD1C18] hover:bg-[#9B1313] text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
