'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, MapPin, Check, CheckCheck, Map as MapIcon, MoreVertical, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Message = {
  id: string;
  sender: 'agent' | 'pharmacy';
  text?: string;
  location?: { lat: number, lng: number };
  photoUrl?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
};

const INITIAL_MESSAGES: Message[] = [
  { id: '1', sender: 'pharmacy', text: 'Hello, please make sure to call the patient before you arrive.', timestamp: '10:00 AM', status: 'read' },
  { id: '2', sender: 'agent', text: 'Will do. I am picking up the package now.', timestamp: '10:05 AM', status: 'read' },
  { id: '3', sender: 'pharmacy', text: 'Great. Let us know if you need help finding the address.', timestamp: '10:06 AM', status: 'read' },
];

export default function DeliveryMessages() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'agent',
        text: `Sent a file: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    
    // Simulate pharmacy reading and typing
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m));
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), sender: 'pharmacy', text: 'Okay, noted.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'read' }
          ]);
        }, 2000);
      }, 500);
    }, 1000);
  };

  const handleSendLocation = () => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      location: { lat: 9.03, lng: 38.74 },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const [pharmacyInfo, setPharmacyInfo] = useState({
    name: 'Kenema Pharmacy #4',
    avatarUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=150&q=80',
    online: true
  });

  useEffect(() => {
    const updatePharmacyInfo = () => {
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('medcare_user_name');
        const savedAvatar = localStorage.getItem('medcare_pharmacy_avatar');
        
        setPharmacyInfo(prev => ({
          ...prev,
          name: savedName || 'Kenema Pharmacy #4',
          avatarUrl: savedAvatar !== null ? savedAvatar : 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=150&q=80',
        }));
      }
    };

    updatePharmacyInfo();

    window.addEventListener('avatar-changed', updatePharmacyInfo);
    window.addEventListener('auth-changed', updatePharmacyInfo);

    return () => {
      window.removeEventListener('avatar-changed', updatePharmacyInfo);
      window.removeEventListener('auth-changed', updatePharmacyInfo);
    };
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 w-full relative">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            {pharmacyInfo.avatarUrl ? (
              <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative">
                 <Image src={pharmacyInfo.avatarUrl} alt={pharmacyInfo.name} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100">
                <span className="font-bold text-brand-700">{getInitials(pharmacyInfo.name)}</span>
              </div>
            )}
            {pharmacyInfo.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-10"></div>}
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 leading-tight">{pharmacyInfo.name}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {pharmacyInfo.online ? <span className="text-green-500">Online</span> : <span>Offline</span>} • 🔒 End-to-end encrypted
            </p>
          </div>
        </div>
      </header>

      {/* Order Context Banner */}
      <div className="bg-brand-50 py-2 px-4 shadow-sm shrink-0 cursor-pointer hover:bg-brand-100 transition-colors">
        <p className="text-xs font-bold text-brand-800 text-center flex items-center justify-center gap-1">
          Re: ORD-001 <span className="opacity-50">—</span> 2 Medications
        </p>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        <div className="flex justify-center mb-4">
          <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Today</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender === 'agent' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm'}`}>
              {msg.text && (
                <p className="text-sm">
                  {msg.text.startsWith('Sent a file:') ? (
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {msg.text.replace('Sent a file: ', '')}</span>
                  ) : msg.text}
                </p>
              )}
              {msg.location && (
                <div className="bg-white/20 p-2 rounded-xl mb-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-brand-50" />
                    <span className="text-xs font-bold text-brand-50">Current Location Shared</span>
                  </div>
                  <div className="h-24 bg-gray-200 rounded-lg overflow-hidden relative">
                    <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" fill className="object-cover" unoptimized/>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                  </div>
                </div>
              )}
              <div className={`flex items-center gap-1 mt-1 text-[10px] justify-end ${msg.sender === 'agent' ? 'text-brand-200' : 'text-gray-400'}`}>
                {msg.timestamp}
                {msg.sender === 'agent' && (
                  msg.status === 'read' ? <CheckCheck className="w-3.5 h-3.5 text-blue-300" /> :
                  msg.status === 'delivered' ? <CheckCheck className="w-3 h-3" /> :
                  <Check className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-3 flex gap-2 shrink-0 safe-area-pb">
        <input 
          type="file" 
          onChange={handleFileUpload} 
          className="hidden" 
          ref={fileInputRef}
        />
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-full transition-colors">
          <Paperclip className="w-6 h-6" />
        </button>
        <button onClick={handleSendLocation} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-full transition-colors">
          <MapPin className="w-6 h-6" />
        </button>
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Message Kenema Pharmacy..."
            className="w-full bg-gray-100 text-gray-900 text-sm rounded-full pl-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-brand-500/50"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="absolute right-2 p-1.5 bg-brand-600 text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
