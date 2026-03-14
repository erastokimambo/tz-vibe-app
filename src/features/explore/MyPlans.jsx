import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react';
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200';
      case 'checked-in': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-200';
      default: return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200';
    }
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
          plans.map(plan => (
            <div key={plan.id} className="bg-white dark:bg-[#4a0d13] p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 relative animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start mb-3 border-b dark:border-gray-800/50 pb-3">
                <div>
                  <h3 className="font-black text-lg dark:text-white leading-tight">{plan.businessName}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                     {plan.timestamp?.toDate().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-1.5 border min-w-16 justify-center dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-1.5 px-3 rounded-xl">
                  Party of {plan.pax}
                </div>
              </div>
            </div>
          ))
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
