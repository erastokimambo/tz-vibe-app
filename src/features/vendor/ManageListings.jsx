import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, CalendarCheck, Check, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/config";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';

export default function ManageListings() {
  const { userProfile } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) {
      setLoading(false);
      setLoadingBookings(false);
      return;
    }
    
    // Fetch Businesses
    const qBiz = query(collection(db, 'businesses'), where('ownerId', '==', userProfile.uid));
    const unsubBiz = onSnapshot(qBiz, (snap) => {
      setBusinesses(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    });

    // Fetch Bookings
    const qBook = query(
      collection(db, 'bookings'), 
      where('ownerId', '==', userProfile.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubBook = onSnapshot(qBook, (snap) => {
      setBookings(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoadingBookings(false);
    });

    return () => {
      unsubBiz();
      unsubBook();
    };
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

  const updateBookingStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: newStatus });
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A]">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/manage" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </Link>
          <h1 className="text-xl font-bold text-[#CD1C18] dark:text-[#FFA896]">Manage Listings</h1>
        </div>
        <Link to="/list-business" className="bg-[#CD1C18] text-white px-4 py-2 rounded-xl text-sm font-bold">
          Add New
        </Link>
      </div>

      <div className="p-4 flex flex-col gap-6 pb-20">
        
        {/* Booking Ledger Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Booking Ledger</h2>
          {loadingBookings ? (
             <div className="text-center py-4 text-sm text-gray-500">Loading incoming bookings...</div>
          ) : bookings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {bookings.map(book => (
                <div key={book.id} className="bg-white dark:bg-[#4a0d13] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/60 relative animate-in fade-in">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{book.userName} <span className="text-xs font-normal text-gray-400">({book.userPhone || 'No phone'})</span></h3>
                      <p className="text-xs font-bold text-[#CD1C18] uppercase tracking-widest mt-0.5">{book.businessName}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                      book.status === 'confirmed' ? 'text-green-500 bg-green-50 border-green-200' :
                      book.status === 'checked-in' ? 'text-purple-500 bg-purple-50 border-purple-200' :
                      'text-orange-500 bg-orange-50 border-orange-200'
                    }`}>
                      {book.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Party of {book.pax}</span>
                    <div className="flex gap-2">
                      {book.status === 'pending' && (
                        <button 
                          onClick={() => updateBookingStatus(book.id, 'confirmed')}
                          className="px-3 py-1.5 bg-black dark:bg-gray-700 text-white text-xs font-bold flex items-center gap-1 rounded-lg"
                        >
                          <Check size={14} /> Confirm
                        </button>
                      )}
                      {(book.status === 'pending' || book.status === 'confirmed') && (
                        <button 
                          onClick={() => updateBookingStatus(book.id, 'checked-in')}
                          className="px-3 py-1.5 bg-[#CD1C18] text-white text-xs font-bold flex items-center gap-1 rounded-lg"
                        >
                          <CalendarCheck size={14} /> Check-In
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              No pending reservations.
            </div>
          )}
        </div>

        {/* Listings Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">My Live Listings</h2>
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
          <div className="text-center py-10 text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            You don't have any active listings yet.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
