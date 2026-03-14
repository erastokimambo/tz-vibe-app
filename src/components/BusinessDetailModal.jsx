import { X, MapPin, MessageCircle, Navigation } from 'lucide-react';
import { useEffect } from 'react';

export default function BusinessDetailModal({ business, onClose }) {
  // Prevent scrolling on root when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!business) return null;

  const { name, image, location, events = [], description = "Experience the best vibes in town." } = business;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-[#38000A] animate-in slide-in-from-bottom-full duration-300">
      {/* Header Image */}
      <div className="relative w-full h-[40vh] bg-gray-200">
        <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
        <button 
          onClick={onClose}
          className="absolute top-safe-12 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 -mt-6 bg-white dark:bg-[#38000A] rounded-t-3xl relative z-10 p-6">
        <h1 className="text-3xl font-bold mb-2">{name}</h1>
        <div className="flex items-center gap-2 text-gray-500 mb-6">
          <MapPin size={18} />
          <span>{location}</span>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Events Scroll horizontally */}
        {events.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {events.map((ev, idx) => (
                <div key={idx} className="flex-none w-64 snap-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
                  <h3 className="font-bold mb-1">{ev.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{ev.date}</p>
                  <button className="w-full py-2 bg-[#CD1C18] text-white rounded-xl font-semibold text-sm">
                    RSVP
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section Mock */}
        <div>
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
              <div className="font-bold">John Doe</div>
              <div className="text-yellow-500 text-sm mb-2">★★★★★</div>
              <p className="text-sm dark:text-gray-300">Amazing place, music was top notch.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#4a0d13]/90 backdrop-blur-lg border-t dark:border-gray-800 pb-safe">
        <div className="flex gap-2 max-w-md mx-auto">
          <button className="flex-none p-3.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold">
            <MessageCircle size={22} />
          </button>
          <button className="flex-1 py-3.5 bg-black dark:bg-gray-700 text-white rounded-xl font-bold">
            Book Table
          </button>
          <button className="flex-1 py-3.5 bg-[#CD1C18] text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <Navigation size={18} /> Ride
          </button>
        </div>
      </div>
    </div>
  );
}
