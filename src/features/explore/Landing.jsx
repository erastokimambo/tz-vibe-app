import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../services/config";
import { collection, onSnapshot } from 'firebase/firestore';

import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import BusinessCard from "../../components/BusinessCard";
import BusinessDetailModal from "../../components/BusinessDetailModal";

const categories = ['All', 'Clubs', 'DJs', 'Bars', 'Weddings'];

export default function Landing() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const navigate = useNavigate();

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

    return () => unsubscribe();
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || !!(b.category && b.category.includes(selectedCategory));
    const safeName = b.name || '';
    const safeLoc = b.location || '';
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = safeName.toLowerCase().includes(searchLower) || safeLoc.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen font-sans selection:bg-[#CD1C18] selection:text-white dark bg-[#38000A]">
      <Navbar />
      
      <main>
        {/* 1. HERO SECTION */}
        <section className="pt-32 pb-12 px-6 text-center relative overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#CD1C18]/10 to-transparent blur-3xl -z-10" />
          <div className="absolute top-20 -right-20 w-72 h-72 bg-[#CD1C18] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -z-10" />

          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-white leading-[1.1]">
            The Pulse of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CD1C18] to-[#FFA896]">Tanzania Nightlife</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Discover top clubs, follow your favorite DJs, and book your night out in Dar & Arusha.
          </p>
          
          {/* Centered Search Bar */}
          <div className="max-w-xl mx-auto relative mb-10 z-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a club or DJ..." 
              className="w-full bg-white/10 border border-white/20 rounded-full py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-[#CD1C18] backdrop-blur-md text-white placeholder-gray-400 text-lg font-medium shadow-2xl transition"
            />
          </div>

          {/* 2. CATEGORY FILTERS */}
          <div className="flex overflow-x-auto gap-3 justify-start sm:justify-center no-scrollbar mb-12 max-w-4xl mx-auto px-2">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-full border transition-all whitespace-nowrap font-bold shadow-lg ${
                  selectedCategory === cat 
                  ? 'bg-[#CD1C18] border-[#CD1C18] text-white scale-105 shadow-[#CD1C18]/30' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* 3. BUSINESS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          {loading ? (
             <div className="text-center py-20 text-gray-400 flex flex-col items-center">
               <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-[#CD1C18] animate-spin mb-4" />
               Locating the best vibes...
             </div>
          ) : filteredBusinesses.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {filteredBusinesses.map(business => (
                 <BusinessCard 
                   key={business.id} 
                   business={business} 
                   onClick={() => setSelectedBusiness(business)}
                 />
               ))}
             </div>
          ) : (
            /* Empty State */
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               <div className="relative w-full h-[400px] mb-6 rounded-3xl overflow-hidden shadow-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6">
                    <Search className="text-gray-500" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Vibes Found</h3>
                  <p className="text-gray-400 mb-8 font-medium">Be the first to put this spot on the map and claim your rewards.</p>
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-[#CD1C18] text-white py-4 rounded-xl font-bold hover:bg-[#9B1313] transition shadow-lg"
                  >
                    Suggest a Venue
                  </button>
               </div>
             </div>
          )}
        </section>
      </main>
      <Footer />

      {/* Detail Modal overlay for non-authenticated exploration */}
      {selectedBusiness && (
         <BusinessDetailModal 
            business={selectedBusiness} 
            onClose={() => setSelectedBusiness(null)} 
         />
      )}
    </div>
  );
}
