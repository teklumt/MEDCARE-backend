'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Search, Lock, Send, Paperclip, Mic, Image as ImageIcon, Check, CheckCheck, Globe, ChevronDown, FileText, Truck, MapPin, Navigation } from 'lucide-react';
import Image from 'next/image';

const PATIENT_CONVERSATIONS = [
  { id: '1', name: 'Abebe Kebede', initial: 'A', lastMessage: 'Is this medication safe to take with...', time: '10:42 AM', unread: 2, online: true, orderId: 'ORD-20847' },
  { id: '2', name: 'Sara Mohammed', initial: 'S', lastMessage: 'Thank you, I received the delivery.', time: 'Yesterday', unread: 0, online: false, orderId: 'ORD-20840' },
  { id: '3', name: 'Dawit Tadesse', initial: 'D', lastMessage: '[Prescription Image]', time: 'Yesterday', unread: 0, online: false, orderId: null },
];

const TEAM_CONVERSATIONS = [
  { id: 't1', name: 'Abebe Tadesse', initial: 'A', lastMessage: 'Will do. I am picking up the package now.', time: '10:05 AM', unread: 0, online: true, orderId: 'ORD-20840', vehicle: 'Motorcycle' },
  { id: 't2', name: 'Dawit Kebede', initial: 'D', lastMessage: 'Arrived at the location.', time: '9:30 AM', unread: 1, online: true, orderId: null, vehicle: 'Bicycle' },
];

const TRANSLATIONS = {
  en: {
    messages: 'Messages',
    searchPatients: 'Search patients...',
    searchTeam: 'Search team...',
    online: 'Online',
    offline: 'Offline',
    encrypted: 'End-to-end encrypted',
    viewOrder: 'View Order',
    today: 'Today',
    encryptionNotice: 'Messages are end-to-end encrypted. No one outside of this chat can read them.',
    sendMedInfo: 'Send Medication Info',
    typeMessage: 'Type a secure message...',
    yesterday: 'Yesterday',
    patients: 'Patients',
    team: 'Team'
  },
  am: {
    messages: 'መልዕክቶች',
    searchPatients: 'ታካሚዎችን ይፈልጉ...',
    searchTeam: 'ቡድን ይፈልጉ...',
    online: 'መስመር ላይ',
    offline: 'ከመስመር ውጭ',
    encrypted: 'ከጫፍ እስከ ጫፍ የተመሰጠረ',
    viewOrder: 'ትዕዛዝ ይመልከቱ',
    today: 'ዛሬ',
    encryptionNotice: 'መልዕክቶች ከጫፍ እስከ ጫፍ የተመሰጠሩ ናቸው። ከዚህ ውይይት ውጭ ማንም ሊያነባቸው አይችልም።',
    sendMedInfo: 'የመድሃኒት መረጃ ላክ',
    typeMessage: 'ደህንነቱ የተጠበቀ መልዕክት ይተይቡ...',
    yesterday: 'ትላንትና',
    patients: 'ታካሚዎች',
    team: 'ቡድን'
  }
};

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'patients' | 'team'>('patients');
  const [patientConversations, setPatientConversations] = useState(PATIENT_CONVERSATIONS);
  const [teamConversations, setTeamConversations] = useState(TEAM_CONVERSATIONS);
  
  const [activeChat, setActiveChat] = useState<any>(PATIENT_CONVERSATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Array<{ id: number | string; sender: string; text: string; time: string; location: { lat: number; lng: number } | null }>>([
    {
      id: 1, sender: 'other', text: 'Hello, I just placed an order. Is it safe to take Amoxicillin if I am slightly allergic to penicillin?', time: '10:40 AM', location: null
    },
    {
      id: 2, sender: 'pharmacy', text: 'Hello. Amoxicillin is a type of penicillin. If you have a known allergy, you should NOT take it. I will suggest an alternative.', time: '10:45 AM', location: null
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const patientParam = params.get('patient');
      const agentParam = params.get('agent');
      const orderIdParam = params.get('orderId');
      const tabParam = params.get('tab');
      
      if (tabParam === 'team') setActiveTab('team');

      if (patientParam) {
        setActiveTab('patients');
        const existing = PATIENT_CONVERSATIONS.find(c => c.name === patientParam);
        if (existing) {
          setActiveChat(existing);
        } else {
          const newChat = {
            id: Math.random().toString(36).substring(7),
            name: patientParam,
            initial: patientParam.charAt(0).toUpperCase(),
            lastMessage: '',
            time: 'Just now',
            unread: 0,
            online: true,
            orderId: orderIdParam || null,
          };
          setPatientConversations(prev => [newChat, ...prev]);
          setActiveChat(newChat);
          setMessages([
            { id: Date.now(), sender: 'pharmacy', text: `Hello ${patientParam}, how can I help you with your order ${orderIdParam ? orderIdParam : ''}?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), location: null }
          ]);
        }
      } else if (agentParam) {
        setActiveTab('team');
        const existing = TEAM_CONVERSATIONS.find(c => c.name === agentParam);
        if (existing) {
          setActiveChat(existing);
          if (existing.orderId === 'ORD-20840') {
             setMessages([
               { id: 1, sender: 'pharmacy', text: 'Hello, please make sure to call the patient before you arrive.', time: '10:00 AM', location: null },
               { id: 2, sender: 'other', text: 'Will do. I am picking up the package now.', time: '10:05 AM', location: null },
               { id: 3, sender: 'other', text: '', time: '10:10 AM', location: { lat: 9.03, lng: 38.74 } } // mock location
             ]);
          }
        } else {
          const newChat = {
            id: Math.random().toString(36).substring(7),
            name: agentParam,
            initial: agentParam.charAt(0).toUpperCase(),
            lastMessage: '',
            time: 'Just now',
            unread: 0,
            online: true,
            orderId: orderIdParam || null,
            vehicle: 'Motorcycle'
          };
          setTeamConversations(prev => [newChat, ...prev]);
          setActiveChat(newChat);
          setMessages([
            { id: Date.now(), sender: 'pharmacy', text: `Hello ${agentParam}, about order ${orderIdParam ? orderIdParam : ''}...`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), location: null }
          ]);
        }
      }
    }
  }, []);

  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const t = TRANSLATIONS[language];

  const currentConversations = activeTab === 'patients' ? patientConversations : teamConversations;
  
  const filteredConversations = currentConversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages([...messages, {
        id: Date.now(),
        sender: 'pharmacy',
        text: `Sent a file: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: null
      }]);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'pharmacy',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: null
    }]);
    setNewMessage('');
  };

  const setChipMessage = (msg: string) => setNewMessage(msg);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-white">
      
      {/* Left Panel: Conversation List */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col shrink-0 bg-accent-50/30">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold text-brand-950">{t.messages}</h2>
            {/* Compact Language Selector */}
            <div className="relative z-50">
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-bold text-brand-950">{language === 'en' ? 'EN' : 'አማ'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <button onClick={() => toggleLanguage('en')} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors">English</button>
                  <button onClick={() => toggleLanguage('am')} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors">አማርኛ</button>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
            <button 
              onClick={() => { setActiveTab('patients'); setActiveChat(patientConversations[0]); }}
              className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'patients' ? 'bg-white text-brand-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.patients}
            </button>
            <button 
              onClick={() => { setActiveTab('team'); setActiveChat(teamConversations[0]); }}
              className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'team' ? 'bg-white text-brand-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.team}
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'patients' ? t.searchPatients : t.searchTeam}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => setActiveChat(conv)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex gap-3 ${activeChat?.id === conv.id ? 'bg-brand-50' : 'hover:bg-white'}`}
            >
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${activeTab === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'}`}>
                  {conv.initial}
                </div>
                {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-sm text-brand-950 truncate flex items-center gap-1">
                    {conv.name}
                  </h3>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">{conv.time.includes('Yesterday') ? t.yesterday : conv.time}</span>
                </div>
                {activeTab === 'team' && (
                  <div className="text-[10px] font-bold text-gray-500 mb-1">{(conv as any).vehicle}</div>
                )}
                <div className="flex justify-between items-center">
                  <p className={`text-xs truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                    {conv.lastMessage || 'Location shared'}
                  </p>
                  {conv.unread > 0 && (
                    <span className="w-4 h-4 bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shrink-0 ml-2">
                       {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  {conv.orderId && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeTab === 'team' ? 'text-blue-700 bg-blue-100' : 'text-brand-600 bg-brand-100'}`}>
                      Re: {conv.orderId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Active Chat */}
      {activeChat ? (
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${activeTab === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'}`}>
              {activeChat.initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-brand-950">{activeChat.name}</h2>
                {activeTab === 'team' && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{(activeChat as any).vehicle}</span>}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {activeChat.online ? <span className="text-emerald-600 font-medium">{t.online}</span> : t.offline}
                <span className="mx-1">•</span>
                <Lock className="w-3 h-3" /> {t.encrypted}
              </p>
            </div>
          </div>
          {activeChat.orderId && (
            <button className="hidden sm:block text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors">
              {t.viewOrder} {activeChat.orderId} →
            </button>
          )}
        </div>
        
        {/* Order specific context banner if team */}
        {activeTab === 'team' && activeChat.orderId && (
          <div className="bg-blue-50 py-2 px-4 shadow-sm shrink-0 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
            <span className="text-xs font-bold text-blue-800 flex items-center justify-center gap-1">
              Currently delivering {activeChat.orderId}
            </span>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-accent-50/30">
          <div className="flex justify-center">
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{t.today}</span>
          </div>
          
          <div className="flex justify-center text-center mx-auto max-w-sm">
            <span className="text-[10px] sm:text-xs text-gray-500 flex items-center justify-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <Lock className="w-3 h-3 shrink-0" /> {t.encryptionNotice}
            </span>
          </div>

          {messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 max-w-[85%] sm:max-w-[80%] ${msg.sender === 'pharmacy' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${msg.sender === 'pharmacy' ? 'bg-brand-900 text-white font-serif' : 'bg-gray-200 text-gray-700'}`}>
                {msg.sender === 'pharmacy' ? 'M' : activeChat.initial}
              </div>
              <div className={`p-3 shadow-sm ${msg.sender === 'pharmacy' ? 'bg-brand-900 text-white rounded-2xl rounded-br-none' : 'bg-white border border-gray-200 rounded-2xl rounded-bl-none'}`}>
                {msg.text && (
                  <p className={`text-sm ${msg.sender === 'pharmacy' ? 'text-white' : 'text-gray-800'}`}>
                    {msg.text.startsWith('Sent a file:') ? (
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {msg.text.replace('Sent a file: ', '')}</span>
                    ) : msg.text}
                  </p>
                )}
                {msg.location && (
                  <div className="bg-gray-100 p-2 rounded-xl mb-1">
                    <div className="flex items-center gap-2 mb-2 text-gray-900">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-gray-900">Agent's current location — shared at {msg.time}</span>
                    </div>
                    <div className="h-32 bg-gray-200 rounded-lg overflow-hidden relative mb-2 w-64">
                      <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" fill className="object-cover" unoptimized/>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                    </div>
                    <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-blue-700">
                      Get Directions From Here
                    </button>
                  </div>
                )}
                <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'pharmacy' ? 'justify-end' : ''}`}>
                  <span className={`text-[10px] ${msg.sender === 'pharmacy' ? 'text-brand-200' : 'text-gray-400'}`}>{msg.time}</span>
                  {msg.sender === 'pharmacy' && <CheckCheck className="w-3 h-3 text-brand-200" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
          {activeTab === 'team' ? (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
               <button onClick={() => setChipMessage('Please call the patient before arriving')} className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                 Please call the patient before arriving
               </button>
               <button onClick={() => setChipMessage('The patient\'s address has been updated')} className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                 The patient's address has been updated
               </button>
               <button onClick={() => setChipMessage('Return the order to the pharmacy')} className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                 Return the order to the pharmacy
               </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <button className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                {t.sendMedInfo}
              </button>
            </div>
          )}
          
          

          <div className="flex items-end gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            {activeTab === 'team' && (
              <button 
                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0"
              >
                <MapPin className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 bg-accent-50 border border-gray-200 rounded-2xl flex items-end overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
              <textarea 
                rows={1}
                placeholder={t.typeMessage}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full bg-transparent px-4 py-3 text-sm outline-none resize-none max-h-32 min-h-[44px]"
              ></textarea>
              <button className="p-3 text-gray-400 hover:text-brand-600 transition-colors shrink-0">
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-3 text-white rounded-xl transition-colors shadow-sm shrink-0 disabled:opacity-50 ${activeTab === 'team' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-900 hover:bg-brand-800'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 flex-col">
          <p className="text-gray-500 mb-4">Select a conversation</p>
        </div>
      )}
    </div>
  );
}
