import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function SavedListings() {
  const { userProfile } = useAuth();
  const [savedBusinesses, setSavedBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      if (!userProfile?.savedListings || userProfile.savedListings.length === 0) {
        setLoading(false);
        return;
      }
      
      const businesses = [];
      for (const id of userProfile.savedListings) {
        try {
          const d = await getDoc(doc(db, 'businesses', id));
          if (d.exists()) {
            businesses.push({ id: d.id, ...d.data() });
          }
        } catch (e) {
          console.error("Error fetching saved listing:", e);
        }
      }
      setSavedBusinesses(businesses);
      setLoading(false);
    }
    fetchSaved();
  }, [userProfile]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A]">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center gap-3">
        <Link to="/app/menu" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-[#CD1C18] dark:text-[#FFA896]">Saved Listings</h1>
      </div>

      <div className="p-4 flex flex-col gap-4 pb-20">
        {loading ? (
           <div className="text-center py-20 text-gray-500 flex flex-col items-center">
             <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#CD1C18] animate-spin mb-4" />
             Loading your favorites...
           </div>
        ) : savedBusinesses.length > 0 ? (
          savedBusinesses.map(bus => (
            <div key={bus.id} className="flex bg-white dark:bg-[#4a0d13] p-3 rounded-2xl shadow-sm border dark:border-gray-800 relative">
              <img src={bus.image || 'https://via.placeholder.com/150'} alt={bus.name} className="w-24 h-24 rounded-xl object-cover bg-gray-200 flex-none" />
              <div className="ml-4 flex flex-col justify-center overflow-hidden">
                <span className="text-xs font-bold text-[#CD1C18] dark:text-[#FFA896] uppercase mb-1">{bus.category}</span>
                <h3 className="font-bold text-lg dark:text-white truncate">{bus.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin size={14} /> <span className="truncate">{bus.location}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-yellow-500 mt-2">
                  <Star size={14} className="fill-yellow-500" /> {bus.rating}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            You haven't saved any listings yet.
          </div>
        )}
      </div>
    </div>
  );
}
