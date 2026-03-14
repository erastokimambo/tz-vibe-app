import { useState } from 'react';
import { Search } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';

const mockChats = [
  {
    id: '1',
    businessName: 'Elements Club',
    businessImage: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=2000&auto=format&fit=crop',
    lastMessage: 'Your table for 4 is confirmed for Friday.',
    timestamp: '10:42 AM',
    unread: 1,
  },
  {
    id: '2',
    businessName: 'DJ Spinny',
    businessImage: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2000&auto=format&fit=crop',
    lastMessage: 'Awesome, see you at the event!',
    timestamp: 'Yesterday',
    unread: 0,
  }
];

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);

  const filteredChats = mockChats.filter(chat => 
    chat.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
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
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex flex-col">
        {filteredChats.map((chat) => (
          <div 
            key={chat.id}
            onClick={() => setActiveChat(chat)}
            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-800/50"
          >
            <img 
              src={chat.businessImage} 
              alt={chat.businessName} 
              className="w-14 h-14 rounded-full object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h2 className="font-bold text-base truncate pr-2">{chat.businessName}</h2>
                <span className={`text-xs whitespace-nowrap ${chat.unread ? 'text-[#CD1C18] dark:text-[#FFA896] font-bold' : 'text-gray-400'}`}>
                  {chat.timestamp}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate pr-2 ${chat.unread ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-500'}`}>
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-[#CD1C18] text-white text-[10px] font-bold rounded-full flex-none">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredChats.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No chats found.
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
