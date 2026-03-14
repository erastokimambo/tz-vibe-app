import { ArrowLeft, Phone, Video, MoreVertical, Send, Smile, Paperclip } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

export default function ChatInterface({ chat, onClose }) {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chat?.id) return;

    // Listen to messages sub-collection
    const messagesRef = collection(db, `chats/${chat.id}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(liveMessages);
      
      // Mark as read if user is opening it and it has unread
      if (chat.unreadCount > 0) {
         updateDoc(doc(db, 'chats', chat.id), { unreadCount: 0 }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [chat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !userProfile || !chat?.id) return;
    
    const messageText = inputText.trim();
    setInputText(''); // optimistic clear
    
    try {
      const messagesRef = collection(db, `chats/${chat.id}/messages`);
      await addDoc(messagesRef, {
        senderId: userProfile.uid,
        senderName: userProfile.displayName,
        text: messageText,
        createdAt: serverTimestamp()
      });
      
      // Update parent chat doc
      await updateDoc(doc(db, 'chats', chat.id), {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
      });
    } catch (error) {
       console.error("Error sending message", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#E5DDD5] dark:bg-[#0B141A] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 py-3 bg-[#075E54] dark:bg-[#1F2C34] text-white shadow-md">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <img src={chat.businessImage || 'https://via.placeholder.com/150'} alt={chat.businessName} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="font-bold text-base truncate leading-tight">{chat.businessName || 'Business'}</h2>
          <p className="text-white/70 text-xs truncate">online</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded-full"><Video size={20} /></button>
          <button className="p-2 hover:bg-white/10 rounded-full"><Phone size={20} /></button>
          <button className="p-2 hover:bg-white/10 rounded-full"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] dark:bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] dark:opacity-80 bg-repeat bg-center mix-blend-multiply dark:mix-blend-plus-lighter">
        {messages.map((msg) => {
          const isMine = msg.senderId === userProfile?.uid;
          const timeString = msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...';

          return (
            <div 
              key={msg.id} 
              className={`max-w-[80%] flex flex-col relative rounded-xl px-3 py-2 text-[15px] shadow-sm ${
                isMine
                  ? 'self-end bg-[#D9FDD3] dark:bg-[#005C4B] text-black dark:text-white rounded-tr-none' 
                  : 'self-start bg-white dark:bg-[#202C33] text-black dark:text-white rounded-tl-none'
              }`}
            >
              <span className="break-words">{msg.text}</span>
              <span className={`text-[11px] self-end mt-1 ${isMine ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}`}>
                {timeString}
              </span>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="m-auto bg-white/50 dark:bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-center text-sm font-medium">
            Send a message to start the vibe!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-2 p-2 bg-[#f0f2f5] dark:bg-[#1F2C34] pb-safe-4">
        <div className="flex-1 flex items-center min-h-[44px] bg-white dark:bg-[#2A3942] rounded-3xl px-2 shadow-sm">
          <button className="p-2 text-gray-500 dark:text-gray-400"><Smile size={24} /></button>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent py-2.5 px-2 outline-none text-[15px] text-gray-900 dark:text-white"
          />
          <button className="p-2 text-gray-500 dark:text-gray-400 -rotate-45"><Paperclip size={22} /></button>
        </div>
        <button 
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="w-11 h-11 flex-none flex items-center justify-center rounded-full bg-[#00A884] disabled:bg-gray-400 text-white shadow-sm hover:bg-[#008f6f] transition-colors"
        >
          <Send size={20} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
