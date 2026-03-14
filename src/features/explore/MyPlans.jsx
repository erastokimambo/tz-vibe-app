import { ArrowLeft, Calendar, Clock, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/config";
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function MyPlans() {
  const { userProfile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) {
      setTimeout(() => {
        setLoading(false);
      }, 0);
      return;
    }
    const q = query(
      collection(db, 'bookings'), 
      where('userId', '==', userProfile.uid),
      orderBy('timestamp', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [userProfile]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': 
        return { text: 'Confirmed - See you there!', className: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'checked-in': 
        return { text: 'Checked In', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'declined': 
        return { text: 'Declined - Venue is full', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
      default: 
        return { text: 'Pending - Waiting for Venue', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    }
  };

  const handleRide = (businessName) => {
    window.location.href = `bolt://request`;
    setTimeout(() => {
      window.open(`https://bolt.eu/`, '_blank');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A]">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center gap-3">
        <Link to="/menu" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-[#CD1C18] dark:text-[#FFA896]">My Plans</h1>
      </div>

      <div className="p-4 flex flex-col gap-4 pb-20">
        {loading ? (
             <div className="text-center py-20 text-gray-500">Loading your plans...</div>
        ) : plans.length > 0 ? (
          plans.map(plan => {
            const badge = getStatusBadge(plan.status);
            const timeDisplay = plan.bookingDate && plan.bookingTime 
              ? `${plan.bookingDate} at ${plan.bookingTime}` 
              : plan.timestamp?.toDate().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={plan.id} className="mb-4 p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 dark:backdrop-blur-md shadow-sm relative animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-black text-gray-900 dark:text-[#FFA896] leading-tight">{plan.businessName}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}>
                    {badge.text}
                  </span>
                </div>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 font-medium flex items-center gap-2">
                  <Calendar size={14} className="inline" /> {timeDisplay} <span className="mx-1">•</span> 👥 {plan.pax} Guests
                </p>

                {plan.status === 'declined' && plan.declineReason && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 text-sm font-medium text-red-700 dark:text-red-400">
                    <span className="font-bold uppercase text-[10px] tracking-widest block mb-1">Vendor Note</span>
                    {plan.declineReason}
                  </div>
                )}

                {/* Contextual Action: Only show Ride if Confirmed */}
                {plan.status === 'confirmed' && (
                  <button 
                    onClick={() => handleRide(plan.businessName)}
                    className="w-full bg-[#CD1C18] hover:bg-[#9B1313] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-[#CD1C18]/20 mt-2"
                  >
                    <Navigation size={18} /> Get a Ride to {plan.businessName}
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <Calendar size={32} className="text-[#CD1C18] dark:text-[#FFA896]" />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">No Plans Yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              RSVP to an event or book a table to see your upcoming plans here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
