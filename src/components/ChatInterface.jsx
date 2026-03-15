import { ArrowLeft, Send, Smile, Paperclip } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../services/config";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import EmojiPicker from 'emoji-picker-react';

export default function ChatInterface({ chat, onClose }) {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
    setShowEmojiPicker(false);
    
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
        unreadCount: increment(1)
      });
    } catch (error) {
       console.error("Error sending message", error);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setInputText(prev => prev + emojiObject.emoji);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile || !chat?.id) return;
    
    setIsUploading(true);
    try {
      const fileRef = ref(storage, `chats/${chat.id}/images/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);

      const messagesRef = collection(db, `chats/${chat.id}/messages`);
      await addDoc(messagesRef, {
        senderId: userProfile.uid,
        senderName: userProfile.displayName,
        text: '',
        imageUrl: downloadUrl,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'chats', chat.id), {
        lastMessage: '📷 Image',
        lastMessageTime: serverTimestamp(),
        unreadCount: increment(1)
      });
    } catch (error) {
       console.error("Error uploading image", error);
    } finally {
       setIsUploading(false);
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Determine "the other party" for display
  const isMeUser = chat?.userId === userProfile?.uid;
  const displayName = isMeUser ? chat?.businessName : chat?.userName;
  const displayImage = isMeUser ? chat?.businessImage : null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col md:items-center md:justify-center bg-[#E5DDD5] dark:bg-[#0B141A] md:bg-black/60 md:backdrop-blur-sm animate-in slide-in-from-right md:zoom-in-95 duration-300 h-[100dvh]">
      <div className="flex flex-col w-full h-[100dvh] md:h-[85vh] md:max-w-2xl bg-[#E5DDD5] dark:bg-[#0B141A] md:rounded-3xl md:shadow-2xl md:overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 py-3 bg-[#075E54] dark:bg-[#1F2C34] text-white shadow-md">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>

        {displayImage ? (
          <img src={displayImage} alt={displayName} className="w-10 h-10 rounded-full object-cover bg-gray-200 flex-none" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-600 flex flex-none items-center justify-center font-bold text-lg text-white">
             {displayName?.charAt(0) || '?'}
          </div>
        )}

        <div className="flex-1 min-w-0 px-2 lg:pr-2">
          <h2 className="font-bold text-base truncate leading-tight">{displayName || 'Anonymous User'}</h2>
          <p className="text-white/70 text-xs truncate">online</p>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Top right actions hidden for MVP */}
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
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="attachment" className="max-w-[200px] md:max-w-xs rounded-lg mb-1 shadow-sm object-cover" />
              )}
              {msg.text && <span className="break-words">{msg.text}</span>}
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
      <div className="flex items-end gap-2 p-2 px-3 bg-[#f0f2f5] dark:bg-[#1F2C34] pb-safe w-full box-border pb-4 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-[70px] left-2 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
             <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" />
          </div>
        )}
        <div className="flex-1 flex items-center min-h-[44px] bg-white dark:bg-[#2A3942] rounded-3xl px-2 shadow-sm">
          <button 
             onClick={() => setShowEmojiPicker(!showEmojiPicker)}
             className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 transition"
          >
            <Smile size={24} />
          </button>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setShowEmojiPicker(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                 handleSend();
                 setShowEmojiPicker(false);
              }
            }}
            className="flex-1 bg-transparent py-2.5 px-2 outline-none text-base text-gray-900 dark:text-white"
          />
          <input 
             type="file" 
             accept="image/*" 
             ref={fileInputRef}
             className="hidden"
             onChange={handleImageUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 transition -rotate-45"
          >
            {isUploading ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Paperclip size={22} />}
          </button>
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
    </div>
  );
}
