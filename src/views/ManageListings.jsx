import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function ManageListings() {
  const { userProfile } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'businesses'), where('ownerId', '==', userProfile.uid));
    const unsub = onSnapshot(q, (snap) => {
      setBusinesses(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    });
    return () => unsub();
  }, [userProfile]);

  const handleDelete = async (id) => {
    if(confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteDoc(doc(db, 'businesses', id));
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A]">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/menu" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </Link>
          <h1 className="text-xl font-bold text-[#CD1C18] dark:text-[#FFA896]">Manage Listings</h1>
        </div>
        <Link to="/app/list-business" className="bg-[#CD1C18] text-white px-4 py-2 rounded-xl text-sm font-bold">
          Add New
        </Link>
      </div>

      <div className="p-4 flex flex-col gap-4 pb-20">
        {loading ? (
             <div className="text-center py-20 text-gray-500">Loading your listings...</div>
        ) : businesses.length > 0 ? (
          businesses.map(bus => (
            <div key={bus.id} className="flex bg-white dark:bg-[#4a0d13] p-3 rounded-2xl shadow-sm border dark:border-gray-800 relative">
              <img src={bus.image || 'https://via.placeholder.com/150'} alt={bus.name} className="w-20 h-20 rounded-xl object-cover bg-gray-200 flex-none" />
              <div className="ml-4 flex flex-col justify-center flex-1 overflow-hidden">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{bus.category}</span>
                <h3 className="font-bold text-base dark:text-white truncate">{bus.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <button className="flex items-center gap-1 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg font-medium text-gray-700 dark:text-gray-300">
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(bus.id)} className="flex items-center gap-1 text-sm bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg font-medium text-red-600 dark:text-red-400">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            You don't have any listings yet.
          </div>
        )}
      </div>
    </div>
  );
}
