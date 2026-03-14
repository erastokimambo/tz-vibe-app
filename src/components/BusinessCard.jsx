import { MapPin, Phone, Coffee, Star, BadgeCheck, CalendarDays, ExternalLink, Calendar, MessageCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/config';

export default function BusinessCard({ business, onClick }) {
  const { userProfile, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    const region = location?.toLowerCase() || '';
    let appUrl = '';
    let webFallback = '';
    
    if (region.includes('arusha')) {
       const addr = encodeURIComponent(business.logistics?.addressString || location || name);
       appUrl = `indrive://search?addr=${addr}`;
       webFallback = 'https://indrive.com';
    } else if (region.includes('dar es salaam') || region.includes('dar')) {
       if (business.logistics?.coordinates) {
         appUrl = `bolt://request?dest_lat=${business.logistics.coordinates.lat}&dest_lng=${business.logistics.coordinates.lng}`;
       } else {
         appUrl = `bolt://request?dest_lat=&dest_lng=&destination_name=${encodeURIComponent(business.logistics?.addressString || location || name)}`;
       }
       webFallback = 'https://bolt.eu/'; 
    } else {
       // Generic Google Maps fallback
       if (business.logistics?.coordinates) {
         webFallback = `https://maps.google.com/?q=${business.logistics.coordinates.lat},${business.logistics.coordinates.lng}`;
       } else {
         webFallback = `https://maps.google.com/?q=${encodeURIComponent(business.logistics?.addressString || location || name)}`;
       }
    }

    if (appUrl) {
      const start = Date.now();
      window.location.assign(appUrl);
      
      // Fallback if app doesn't open (meaning we didn't background the browser)
      setTimeout(() => {
        if (Date.now() - start < 1500) {
          window.open(webFallback, '_blank');
        }
      }, 1000);
    } else {
      window.open(webFallback, '_blank');
    }
  };
  
  const openMenu = () => window.open(menuUrl, '_blank');

  const handleInitialAuthCheck = (e, callback) => {
    e.stopPropagation();
    if (isGuest || !userProfile) {
      setIsAuthModalOpen(true);
      return;
    }
    callback();
  };

  const handleMessage = async () => {
    const vendorId = business.ownerId || business.id;
    const chatId = `${userProfile.uid}_${vendorId}`;
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
           users: [userProfile.uid, vendorId],
           userId: userProfile.uid,
           vendorId: vendorId,
           businessName: name,
           businessImage: image || '',
           userName: userProfile.displayName || "Anonymous Guest",
           lastMessage: "Conversation started",
           lastMessageTime: serverTimestamp(),
           unreadCount: 0
        });
      }
      navigate('/messages');
    } catch (error) {
      console.error(error);
    }
  };

  const renderButtons = () => {
    const isDJ = category && (category.includes('DJ') || category.toLowerCase().includes('djs'));
    const hasRideLogic = location || business.logistics?.addressString || business.logistics?.coordinates;

    if (isDJ) {
      return (
        <>
          <button 
            onClick={(e) => handleInitialAuthCheck(e, handleMessage)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#CD1C18] hover:bg-[#9B1313] min-h-[44px] rounded-xl font-bold transition shadow-lg shadow-[#CD1C18]/30"
          >
            <MessageCircle size={18} /> Message
          </button>
          <button 
            onClick={(e) => handleAction(e, onClick)}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 min-h-[44px] rounded-xl font-semibold transition"
          >
            <Calendar size={18} /> Schedule
          </button>
        </>
      );
    }

    return (
      <>
        <button 
          onClick={(e) => handleInitialAuthCheck(e, onClick)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#CD1C18] hover:bg-[#9B1313] min-h-[44px] rounded-xl font-bold transition shadow-lg shadow-[#CD1C18]/30"
        >
          Book Table
        </button>
        {hasRideLogic && (
          <button 
            onClick={(e) => handleAction(e, openRide)}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 min-h-[44px] rounded-xl font-semibold transition"
          >
            <MapPin size={18} /> Get Ride
          </button>
        )}
      </>
    );
  };

  return (
    <div 
      onClick={onClick}
      className="group relative w-full h-[400px] mb-6 rounded-3xl overflow-hidden shadow-2xl cursor-pointer bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#CD1C18]/50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* Background Image */}
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#38000A] via-[#38000A]/40 to-black/30" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <span className="bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 uppercase tracking-wide w-fit">
            {category}
          </span>
          {category === 'Wedding Venues' && business.capacity ? (
            <span className="flex w-fit items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-lg shadow-black/20">
              <Users size={14} />
              {business.capacity}+ Pax
            </span>
          ) : business.liveStatus?.active && (!business.liveStatus.expiresAt || new Date() < new Date(business.liveStatus.expiresAt)) && (
            <span className="flex w-fit items-center gap-1 bg-[#CD1C18] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-[#CD1C18]/50 animate-pulse">
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
        <div className="flex gap-2 mt-4">
          {renderButtons()}
        </div>
      </div>

      {/* Auth Modal Overlay for Messaging/Bookings */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#38000A] w-full sm:max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-[#CD1C18]/30 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#CD1C18] to-[#9B1313] rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-[#CD1C18]/20 rotate-3">
              <MessageCircle size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Join the Vibe</h3>
            <p className="text-gray-300 mb-8 font-medium leading-relaxed">
              Log in to start a vibe. Keep your chats and bookings synced across all devices.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAuthModalOpen(false);
                  navigate('/login');
                }}
                className="w-full py-4 bg-[#CD1C18] hover:bg-[#9B1313] text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition"
              >
                Sign In / Create Account
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-4 bg-transparent text-gray-400 hover:text-white rounded-2xl font-bold transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
