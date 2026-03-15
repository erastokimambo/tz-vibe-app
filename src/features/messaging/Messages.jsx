import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ChatInterface from "../../components/ChatInterface";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/config";
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function Messages() {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Query chats where user is a participant
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('users', 'array-contains', userProfile.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(liveChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const filteredChats = chats.filter(chat => 
    chat.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#38000A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800">
        <h1 className="text-3xl font-bold mb-4 text-[#CD1C18] dark:text-[#FFA896]">Messages</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#CD1C18] text-base"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex flex-col">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#CD1C18] animate-spin mb-4" />
            Loading messages...
          </div>
        ) : filteredChats.map((chat) => {
          // Determine "the other party" for display
          const isMeUser = chat.userId === userProfile.uid;
          const displayName = isMeUser ? chat.businessName : chat.userName;
          const displayImage = isMeUser ? chat.businessImage : null; // Fallback to icon for users

          return (
          <div 
            key={chat.id}
            onClick={() => setActiveChat(chat)}
            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-800/50"
          >
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={displayName} 
                className="w-14 h-14 rounded-full object-cover bg-gray-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xl text-gray-500">
                 {displayName?.charAt(0) || '?'}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h2 className="font-bold text-base truncate pr-2 dark:text-gray-100">{displayName || 'Anonymous User'}</h2>
                <span className={`text-xs whitespace-nowrap ${chat.unreadCount ? 'text-[#CD1C18] dark:text-[#FFA896] font-bold' : 'text-gray-400'}`}>
                  {chat.lastMessageTime?.toDate ? new Date(chat.lastMessageTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate pr-2 ${chat.unreadCount ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-500'}`}>
                  {chat.lastMessage || 'Start a conversation...'}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-[#CD1C18] text-white text-[10px] font-bold rounded-full flex-none">
                     {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        )})}
        {!loading && filteredChats.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">Inbox Empty</h3>
            <p className="text-sm text-gray-500 max-w-[200px]">
              You don't have any active vibes in your inbox. Check out the explore tab!
            </p>
          </div>
        )}
      </div>

      {/* Render Chat Interface Modal if active */}
      {activeChat && (
        <ChatInterface 
          chat={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}
