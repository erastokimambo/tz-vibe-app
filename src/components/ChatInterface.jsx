import { ArrowLeft, Phone, Video, MoreVertical, Send, Smile, Paperclip } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const mockMessages = [
  { id: 1, sender: 'business', text: 'Hello! How can we help you?', time: '10:30 AM' },
  { id: 2, sender: 'user', text: 'Hi, I would like to book a table for Friday.', time: '10:32 AM' },
  { id: 3, sender: 'business', text: 'Your table for 4 is confirmed for Friday.', time: '10:42 AM' },
];

export default function ChatInterface({ chat, onClose }) {
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#E5DDD5] dark:bg-[#0B141A] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 py-3 bg-[#075E54] dark:bg-[#1F2C34] text-white shadow-md">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <img src={chat.businessImage} alt={chat.businessName} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="font-bold text-base truncate leading-tight">{chat.businessName}</h2>
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
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`max-w-[80%] flex flex-col relative rounded-xl px-3 py-2 text-[15px] shadow-sm ${
              msg.sender === 'user' 
                ? 'self-end bg-[#D9FDD3] dark:bg-[#005C4B] text-black dark:text-white rounded-tr-none' 
                : 'self-start bg-white dark:bg-[#202C33] text-black dark:text-white rounded-tl-none'
            }`}
          >
            <span>{msg.text}</span>
            <span className={`text-[11px] self-end mt-1 ${msg.sender === 'user' ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}`}>
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-2 p-2 bg-[#f0f2f5] dark:bg-[#1F2C34] pb-safe-4">
        <div className="flex-1 flex items-center min-h-[44px] bg-white dark:bg-[#2A3942] rounded-3xl px-2 shadow-sm">
          <button className="p-2 text-gray-500 dark:text-gray-400"><Smile size={24} /></button>
          <input 
            type="text" 
            placeholder="Type a message" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent py-2.5 px-2 outline-none text-[15px] text-gray-900 dark:text-white"
          />
          <button className="p-2 text-gray-500 dark:text-gray-400 -rotate-45"><Paperclip size={22} /></button>
        </div>
        <button 
          onClick={handleSend}
          className="w-11 h-11 flex-none flex items-center justify-center rounded-full bg-[#00A884] text-white shadow-sm hover:bg-[#008f6f] transition-colors"
        >
          <Send size={20} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
