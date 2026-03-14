import { useState, useEffect } from 'react';
import BusinessDetailModal from '../components/BusinessDetailModal';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

export default function MapView() {
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
    });

    return () => unsubscribe();
  }, []);

  // Simple pseudo-random coordinate generator based on string ID 
  // to ensure consistent pin placement for the same business on our mock grid
  const getSimulatedCoordinates = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate pseudo-random percentage between 10% and 90%
    const top = Math.abs((Math.sin(hash) * 100) % 80) + 10;
    const left = Math.abs((Math.cos(hash) * 100) % 80) + 10;
    return { top: `${top}%`, left: `${left}%` };
  };

  const getPinStyle = (business) => {
    const isDj = business.category === 'DJs';
    const isWedding = business.category === 'Wedding Venues';
    
    let colorClass = 'bg-[#CD1C18]'; // Default Red for Clubs
    let shadowClass = 'shadow-[#CD1C18]/50';
    
    if (isDj) {
      colorClass = 'bg-[#FFA896]'; // Peach for DJs
      shadowClass = 'shadow-[#FFA896]/50';
    } else if (isWedding) {
      colorClass = 'bg-purple-500'; // Purple for Weddings
      shadowClass = 'shadow-purple-500/50';
    }
    
    const pos = getSimulatedCoordinates(business.id);
    return { colorClass, shadowClass, pos };
  };

  return (
    <div className="relative w-full h-screen bg-gray-200 dark:bg-[#38000A] overflow-hidden">
      
      {/* Radar / Grid Background Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20"
           style={{
             backgroundImage: `
               linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }}
      />
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-12 pb-8 bg-gradient-to-b from-white/90 to-transparent dark:from-[#38000A]/90 dark:to-transparent backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-[#CD1C18] dark:text-[#FFA896]">Radar Map</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {loading ? 'Scanning for vibes...' : `Found ${businesses.length} live locations`}
        </p>
      </div>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-[#CD1C18] animate-spin" />
        </div>
      ) : (
        <>
          {/* Scatter Map Pins */}
          {businesses.map((business) => {
            const { colorClass, shadowClass, pos } = getPinStyle(business);
            
            return (
              <div 
                key={business.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-transform hover:scale-125 z-20"
                style={pos}
                onClick={() => setSelectedBusiness(business)}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900/90 backdrop-blur text-white rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-700 shadow-xl">
                  <div className="text-gray-400 text-[10px] uppercase mb-0.5">{business.category}</div>
                  {business.name}
                </div>
                
                {/* Glowing Beacon */}
                <div className="relative">
                  <div className={`absolute -inset-4 ${colorClass} opacity-40 rounded-full blur-md animate-ping`} />
                  <div className={`relative w-5 h-5 rounded-full border-2 border-white shadow-lg ${colorClass} ${shadowClass}`} />
                </div>
              </div>
            );
          })}
        </>
      )}

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
