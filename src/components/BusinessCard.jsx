import { MapPin, Phone, Coffee, Star, BadgeCheck, CalendarDays, ExternalLink } from 'lucide-react';

export default function BusinessCard({ business, onClick }) {
  const { 
    name, 
    category, 
    location, 
    image, 
    rating, 
    isVerified, 
    hasEvents,
    phone,
    menuUrl
  } = business;

  const handleAction = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  const callBusiness = () => window.open(`tel:${phone}`);
  const openRide = () => {
    // Basic deep link fallback for Bolt/InDrive - using web maps as fallback
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
  };
  const openMenu = () => window.open(menuUrl, '_blank');

  return (
    <div 
      onClick={onClick}
      className="relative w-full h-[400px] mb-6 rounded-3xl overflow-hidden shadow-lg cursor-pointer bg-gray-100 dark:bg-gray-800 transition-transform active:scale-[0.98]"
    >
      {/* Background Image */}
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <span className="bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 uppercase tracking-wide">
            {category}
          </span>
          {business.isLiveTonight && (
            <span className="flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse">
              Live Tonight
            </span>
          )}
          {hasEvents && (
            <span className="flex items-center gap-1 bg-[#CD1C18] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              <CalendarDays size={14} />
              Upcoming Event
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white/90 text-black px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
          <Star size={14} className="fill-[#CD1C18] text-[#CD1C18]" />
          {rating.toFixed(1)}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold font-sans drop-shadow-md">{name}</h2>
          {isVerified && <BadgeCheck size={24} className="text-blue-400 fill-white" />}
        </div>
        
        <div className="flex items-center gap-1 text-gray-200 text-sm mb-4">
          <MapPin size={14} />
          <span>{location}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {phone && (
            <button 
              onClick={(e) => handleAction(e, callBusiness)}
              className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 py-2.5 rounded-xl font-semibold transition"
            >
              <Phone size={18} /> Call
            </button>
          )}
          <button 
            onClick={(e) => handleAction(e, openRide)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#CD1C18] hover:bg-[#9B1313] py-2.5 rounded-xl font-semibold transition"
          >
            <MapPin size={18} /> Ride
          </button>
          {menuUrl && (
            <button 
              onClick={(e) => handleAction(e, openMenu)}
              className="flex-none flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 w-11 h-11 rounded-xl transition"
            >
              <Coffee size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
