import { X, MapPin, MessageCircle, Navigation, Heart, Share2, Star, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from "../services/config";

export default function BusinessDetailModal({ business, onClose }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Booking State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPax, setBookingPax] = useState(2);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Prevent scrolling on root when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (userProfile && business) {
      setIsSaved(userProfile.savedListings?.includes(business.id) || false);
    }
  }, [userProfile, business]);

  useEffect(() => {
    if (!business?.id) return;
    
    // Listen to live reviews for this specific business
    const reviewsRef = collection(db, `businesses/${business.id}/reviews`);
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(liveReviews);
    });

    return () => unsubscribe();
  }, [business?.id]);

  if (!business) return null;

  const { id, name, image, location, events = [], description = "Experience the best vibes in town." } = business;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out ${name} on TzVibe!`,
          text: description,
          url: `${window.location.origin}/?business=${id}`,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Deep Link Logic for Ridesharing
  const getRideLink = () => {
    // Check the raw legacy location first (which holds Region names like 'Arusha')
    const region = business.location?.toLowerCase() || '';
    
    if (region.includes('arusha')) {
       // InDrive expects address text
       return `indrive://search?addr=${encodeURIComponent(business.logistics?.addressString || business.location || business.name)}`;
    }
    if (region.includes('dar es salaam') || region.includes('dar')) {
       // Bolt prefers coordinates if available, fallback to search
       if (business.logistics?.coordinates) {
         return `bolt://request?dest_lat=${business.logistics.coordinates.lat}&dest_lng=${business.logistics.coordinates.lng}`;
       }
       return `bolt://request?dest_lat=&dest_lng=&destination_name=${encodeURIComponent(business.logistics?.addressString || business.location || business.name)}`;
    }
    
    // Fallback native Google Maps link
    if (business.logistics?.coordinates) {
      return `https://maps.google.com/?q=${business.logistics.coordinates.lat},${business.logistics.coordinates.lng}`;
    }
    return `https://maps.google.com/?q=${encodeURIComponent(business.logistics?.addressString || business.location || business.name)}`;
  };

  const toggleSave = async () => {
    if (!userProfile?.uid) return;
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      if (isSaved) {
        await updateDoc(userRef, { savedListings: arrayRemove(id) });
        setIsSaved(false);
      } else {
        await updateDoc(userRef, { savedListings: arrayUnion(id) });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving listing:", error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim() || !userProfile) return;
    
    setIsSubmitting(true);
    try {
      const reviewsRef = collection(db, `businesses/${id}/reviews`);
      await addDoc(reviewsRef, {
        userId: userProfile.uid,
        userName: userProfile.displayName,
        rating: newReviewRating,
        text: newReviewText.trim(),
        createdAt: serverTimestamp()
      });
      setNewReviewText('');
      setNewReviewRating(5);
    } catch (error) {
      console.error("Error submitting review: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBooking = async () => {
    if (!userProfile) {
      alert("Please log in to book a table.");
      return;
    }

    setIsBookingSubmitting(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        vendorId: business.id,
        ownerId: business.ownerId || 'anonymous',
        userId: userProfile.uid,
        userName: userProfile.displayName || "Anonymous VIP",
        userPhone: userProfile.phone || "",
        businessName: business.name,
        pax: bookingPax,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      alert(`Booking requested for ${bookingPax} guests! The venue will confirm shortly.`);
      setIsBookingOpen(false);
    } catch (error) {
      console.error("Error creating booking: ", error);
      alert("Something went wrong requesting your booking. Please try again.");
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const handleMessage = async () => {
    if (!userProfile) {
      alert("Please log in to send a message.");
      return;
    }
    
    // We enforce 1:1 consistent chats: ID = [USER_UID]_[VENDOR_UID]
    const vendorId = business.ownerId || business.id; // Fallback to business ID if owner not strictly bound
    const chatId = `${userProfile.uid}_${vendorId}`;
    
    try {
      // First, ensure the parent chat document exists so the Inbox can query it
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
           users: [userProfile.uid, vendorId],
           userId: userProfile.uid,
           vendorId: vendorId,
           businessName: business.name,
           businessImage: business.image || '',
           userName: userProfile.displayName || "Anonymous Guest",
           lastMessage: "Conversation started",
           lastMessageTime: serverTimestamp(),
           unreadCount: 0
        });
      }
      
      // Navigate to the inbox tab where the context will be open
      onClose();
      navigate('/messages');
      
    } catch (error) {
      console.error("Error initializing chat", error);
      alert("Unable to start chat. Check network connection.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center bg-white dark:bg-[#38000A] md:bg-black/60 md:backdrop-blur-sm animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300 p-0 md:p-6">
      <div className="flex flex-col md:flex-row w-full h-full md:h-full md:max-h-[85vh] md:max-w-5xl md:bg-white dark:md:bg-[#38000A] md:rounded-3xl md:shadow-2xl md:overflow-hidden relative">
        {/* Header Image */}
        <div className="relative w-full h-[40vh] md:w-1/2 md:h-full bg-gray-200 shrink-0">
        <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
        <button 
          onClick={onClose}
          className="absolute top-safe-12 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition"
        >
          <X size={24} />
        </button>
        <div className="absolute top-safe-12 right-4 flex gap-2">
          <button 
            onClick={handleShare}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition"
          >
            <Share2 size={24} />
          </button>
          <button 
            onClick={toggleSave}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition"
          >
            <Heart size={24} className={isSaved ? "fill-[#CD1C18] text-[#CD1C18]" : ""} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-24 -mt-6 md:mt-0 bg-white dark:bg-[#38000A] rounded-t-3xl md:rounded-none relative z-10 p-6 md:w-1/2">
        <h1 className="text-3xl font-bold mb-2">{name}</h1>
        <div className="flex items-center gap-2 text-gray-500 mb-6">
          <MapPin size={18} />
          <span>{business.logistics?.addressString || location}</span>
        </div>
        
        {business.liveStatus?.active && (!business.liveStatus.expiresAt || new Date() < new Date(business.liveStatus.expiresAt)) && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-[#38000A] dark:to-[#4a0d13] border border-red-100 dark:border-[#CD1C18]/30 flex items-center justify-between shadow-sm">
            <div>
              <span className="flex items-center gap-2 text-[#CD1C18] dark:text-[#FFA896] text-sm font-black uppercase tracking-widest mb-1">
                 <span className="w-2 h-2 rounded-full bg-[#CD1C18] animate-ping" /> Live Tonight
              </span>
              {business.liveStatus.locationName && (
                <p className="font-bold text-gray-900 dark:text-white text-lg">{business.liveStatus.locationName}</p>
              )}
            </div>
          </div>
        )}
        
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
                  <button 
                    onClick={() => alert(`RSVP successful for ${ev.name}!`)}
                    className="w-full py-2 bg-[#CD1C18] hover:bg-[#9B1313] transition-colors text-white rounded-xl font-semibold text-sm"
                  >
                    RSVP Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section Live */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Reviews & Vibes</h2>
          
          {/* Write Review Form */}
          <form onSubmit={submitReview} className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border dark:border-gray-800">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReviewRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star size={24} className={newReviewRating >= star ? "fill-yellow-500 text-yellow-500" : "text-gray-300 dark:text-gray-600"} />
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <textarea 
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your experience..."
                readOnly={isSubmitting}
                className="flex-1 bg-white dark:bg-gray-900 border dark:border-gray-700 text-sm rounded-xl py-3 px-3 outline-none focus:ring-1 focus:ring-[#CD1C18] resize-none h-12"
              />
              <button 
                type="submit"
                disabled={!newReviewText.trim() || isSubmitting}
                className="p-3.5 bg-[#CD1C18] disabled:opacity-50 text-white rounded-xl font-bold flex-none transition"
              >
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </form>

          {/* Review List */}
          <div className="flex flex-col gap-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed dark:border-gray-800">
                No reviews yet. Be the first to share the vibe!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-sm">{rev.userName}</div>
                    <div className="flex items-center text-yellow-500">
                      <Star size={12} className="fill-yellow-500 mr-1" />
                      <span className="text-xs font-bold">{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rev.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed md:absolute bottom-0 left-0 right-0 md:left-1/2 p-4 bg-white/80 dark:bg-[#4a0d13]/90 backdrop-blur-lg border-t dark:border-gray-800 pb-safe md:pb-4 z-20">
        <div className="flex gap-2 w-full px-2">
          <button 
           onClick={handleMessage}
           className="flex-none p-3.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <MessageCircle size={22} />
          </button>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="flex-1 py-3.5 bg-black dark:bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold transition"
          >
            Book Table
          </button>
          <a 
            href={getRideLink()}
            className="flex-1 py-3.5 bg-[#CD1C18] hover:bg-[#9B1313] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            <Navigation size={18} /> Ride
          </a>
        </div>
      </div>
      </div>

      {/* Booking Sub-Modal Overlay */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-[#4a0d13] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6 border-b dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-xl font-black dark:text-white">Reserve Table</h3>
                <p className="text-sm font-bold text-[#CD1C18]">{business.name}</p>
              </div>
              <button onClick={() => setIsBookingOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Party Size (Pax)</label>
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={() => setBookingPax(Math.max(1, bookingPax - 1))}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 hover:border-[#CD1C18] hover:text-[#CD1C18] transition"
                >-</button>
                <span className="text-4xl font-black dark:text-white w-12 text-center">{bookingPax}</span>
                <button 
                  onClick={() => setBookingPax(Math.min(20, bookingPax + 1))}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 hover:border-[#CD1C18] hover:text-[#CD1C18] transition"
                >+</button>
              </div>
            </div>

            <button 
              onClick={handleBooking}
              disabled={isBookingSubmitting}
              className="w-full py-4 bg-[#CD1C18] hover:bg-[#9B1313] disabled:bg-gray-400 text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition"
            >
              {isBookingSubmitting ? (
                <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Confirming...
                </>
              ) : (
                'Request VIP Table'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
