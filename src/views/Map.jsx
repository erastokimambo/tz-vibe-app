import { useState } from 'react';
import { mockBusinesses } from '../data/mockData';
import BusinessDetailModal from '../components/BusinessDetailModal';

export default function MapView() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Simple mock grid coordinates based on index for demo purposes
  const getPinStyle = (business, index) => {
    const isDj = business.category === 'DJs';
    const colorClass = isDj ? 'bg-[#FFA896]' : 'bg-[#CD1C18]';
    const shadowClass = isDj ? 'shadow-[#FFA896]/50' : 'shadow-[#CD1C18]/50';
    
    // Fixed positions just for mocking the map
    const positions = [
      { top: '30%', left: '40%' },
      { top: '60%', left: '70%' },
      { top: '45%', left: '20%' },
    ];
    const pos = positions[index % positions.length];

    return { colorClass, shadowClass, pos };
  };

  return (
    <div className="relative w-full h-screen bg-gray-200 dark:bg-gray-900 overflow-hidden">
      {/* Mock Map Background Vector/Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-12 bg-gradient-to-b from-white/90 to-transparent dark:from-[#38000A]/90">
        <h1 className="text-2xl font-bold">Discover Map</h1>
        <p className="text-sm text-gray-500">Live vibes around you</p>
      </div>

      {/* Map Pins */}
      {mockBusinesses.map((business, index) => {
        const { colorClass, shadowClass, pos } = getPinStyle(business, index);
        return (
          <div 
            key={business.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
            style={pos}
            onClick={() => setSelectedBusiness(business)}
          >
            {/* Tooltip on hover */}
            <div className="hidden group-hover:block mb-2 px-3 py-1 bg-black/80 text-white rounded-lg text-xs font-bold whitespace-nowrap z-20">
              {business.name}
            </div>
            
            {/* Glowing Beacon */}
            <div className="relative">
              <div className={`absolute -inset-4 ${colorClass} opacity-30 rounded-full blur-md animate-ping`} />
              <div className={`relative w-6 h-6 rounded-full border-2 border-white shadow-lg ${colorClass} ${shadowClass}`} />
            </div>
          </div>
        );
      })}

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
