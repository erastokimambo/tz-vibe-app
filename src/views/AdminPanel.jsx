import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore';

export default function AdminPanel() {
  const { userProfile, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.isAdmin) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, 'businesses'), (snap) => {
      setBusinesses(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    });
    return () => unsub();
  }, [userProfile]);

  if (authLoading) return <div className="p-8 text-center text-gray-500">Loading auth...</div>;
  if (!userProfile?.isAdmin) return <Navigate to="/app/menu" />;

  const toggleVerify = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'businesses', id), { isVerified: !currentStatus });
    } catch (err) {
      console.error("Error updating verification:", err);
    }
  };

  const handleDelete = async (id) => {
    if(confirm("Are you sure you want to permanently delete this listing? (Admin action)")) {
      try {
        await deleteDoc(doc(db, 'businesses', id));
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A]">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center gap-3">
        <Link to="/app/menu" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
          Admin Panel <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full uppercase tracking-widest font-bold">Root</span>
        </h1>
      </div>

      <div className="p-4 flex flex-col gap-4 pb-20">
        {loading ? (
             <div className="text-center py-20 text-gray-500">Loading all listings...</div>
        ) : businesses.length > 0 ? (
          businesses.map(bus => (
            <div key={bus.id} className="flex bg-white dark:bg-[#4a0d13] p-3 rounded-2xl shadow-sm border dark:border-gray-800 relative">
              <img src={bus.image || 'https://via.placeholder.com/150'} alt={bus.name} className="w-20 h-20 rounded-xl object-cover bg-gray-200 flex-none" />
              <div className="ml-4 flex flex-col justify-center flex-1 overflow-hidden">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{bus.category}</span>
                <h3 className="font-bold text-base dark:text-white truncate">{bus.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => toggleVerify(bus.id, bus.isVerified)}
                    className={`flex flex-1 items-center justify-center gap-1 text-sm px-3 py-1.5 rounded-lg font-bold ${bus.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {bus.isVerified ? <><CheckCircle size={14}/> Verified</> : <><XCircle size={14}/> Verify</>}
                  </button>
                  <button 
                    onClick={() => handleDelete(bus.id)} 
                    className="flex flex-1 items-center justify-center gap-1 text-sm bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg font-bold text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            No listings found in database.
          </div>
        )}
      </div>
    </div>
  );
}
