'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getMockConversations } from './mockData';
import { 
  Search, Shield, Phone, Info, MoreVertical, X, Lock, Paperclip, 
  Mic, Image as ImageIcon, Camera, ArrowLeft,
  Check, CheckCheck, Clock, CheckCircle2, ChevronRight, FileText, Calendar, Send, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState(() => getMockConversations(t));
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'orders'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeConv = conversations.find(c => c.id === activeConvId);

  const filteredConversations = conversations.filter(c => {
    if (searchQuery && !c.pharmacyName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterTab === 'unread' && c.unreadCount === 0) return false;
    if (filterTab === 'orders' && !c.orderId) return false;
    return true;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeConvId) {
      scrollToBottom();
    }
  }, [activeConvId, activeConv?.messages]);

  const handleSendMessage = (text: string, type: 'text' | 'prescription_image' | 'voice' = 'text', fileData?: any) => {
    if (!text.trim() && type === 'text') return;
    if (!activeConvId) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'patient',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: type,
      attachmentData: fileData
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: type === 'text' ? text : `[${type === 'voice' ? 'Voice Message' : 'Image'}]`,
          lastMessageTime: 'Just now'
        };
      }
      return conv;
    }));

    setMessageInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setShowAttachments(false);
    
    // Simulate image upload
    if (file.type.startsWith('image/')) {
      handleSendMessage('Sent an image', 'prescription_image', {
        url: URL.createObjectURL(file)
      });
    } else {
      handleSendMessage(`Uploaded: ${file.name}`, 'text');
    }
    
    // reset
    e.target.value = '';
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      handleSendMessage('Voice message (simulated)', 'voice');
    } else {
      setIsRecording(true);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0 h-screen overflow-hidden">
      <DashboardNavbar />
      
      <div className="flex-1 flex overflow-hidden w-full max-w-[1400px] mx-auto bg-white border-l border-r border-gray-100 shadow-sm relative">
        
        {/* Conversation List Panel */}
        <div className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col border-r border-gray-100 bg-white transition-transform duration-300 ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 md:p-6 pb-2">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-serif text-brand-950">
                {t('messages.title')} <span className="text-gray-400 text-lg font-sans font-normal ml-1">/ {t('messages.subtitle')}</span>
              </h1>
              <button className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center hover:bg-brand-100 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            </div>
          </div>

          <div className="px-4 md:px-6 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('messages.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="px-4 md:px-6 mb-2">
            <div className="flex items-center gap-2">
              <FilterTab 
                active={filterTab === 'all'} 
                onClick={() => setFilterTab('all')} 
                label={t('messages.all')} 
              />
              <FilterTab 
                active={filterTab === 'unread'} 
                onClick={() => setFilterTab('unread')} 
                label={t('messages.unread')} 
                count={conversations.filter(c => c.unreadCount > 0).length}
              />
              <FilterTab 
                active={filterTab === 'orders'} 
                onClick={() => setFilterTab('orders')} 
                label={t('dashnav.orders')} 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full no-scrollbar px-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3 md:p-4 rounded-xl mb-1 flex items-start gap-3 transition-colors ${activeConvId === conv.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${activeConvId === conv.id ? 'bg-brand-200 text-brand-800' : 'bg-gray-100 text-gray-700'}`}>
                      {conv.pharmacyAvatar}
                    </div>
                    {conv.lastSeen === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1 shrink-0 min-w-0 pr-2">
                        <h3 className="font-bold text-gray-900 truncate">{conv.pharmacyName}</h3>
                        {conv.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 fill-brand-50 shrink-0" />}
                      </div>
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">{conv.lastMessageTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                          {conv.lastMessage}
                       </p>
                    </div>
                    {conv.orderId && (
                       <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold rounded uppercase tracking-wider">
                           Re: {conv.orderId}
                       </div>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-6">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-12 px-6">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <MessageSquare size={24} />
                 </div>
                 <h3 className="text-gray-900 font-bold mb-1">{t('messages.noConversations')}</h3>
                 <p className="text-gray-500 text-sm">Start a chat with a pharmacist to ask questions</p>
              </div>
            )}
            <div className="h-6" />
          </div>
        </div>

        {/* Active Chat Panel */}
        <div className={`flex-1 flex flex-col bg-[#FDFDFD] relative h-full ${!activeConvId && 'hidden md:flex'}`}>
          {activeConvId && activeConv ? (
            <>
              {/* Chat Header */}
              <div className="h-16 md:h-20 border-b border-gray-100 bg-white flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveConvId(null)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 md:hidden -ml-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold shrink-0">
                    {activeConv.pharmacyAvatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <h2 className="font-bold text-gray-900 truncate">{activeConv.pharmacyName}</h2>
                      {activeConv.isVerified && <CheckCircle2 className="w-4 h-4 text-brand-600 fill-brand-50 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        {activeConv.lastSeen === 'online' ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {t('chat.online')}
                            </>
                        ) : (
                            <span>{activeConv.lastSeen}</span>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 text-brand-700 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors hidden sm:flex">
                    <Info className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {activeConv.orderId && (
                 <div className="bg-brand-50 border-b border-brand-100 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-brand-100/50 transition-colors shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <p className="text-sm font-medium text-brand-900">
                           Re: Order #{activeConv.orderId}
                        </p>
                    </div>
                    <div className="text-brand-600 flex items-center text-xs font-bold">
                        View Order <ChevronRight className="w-3 h-3 ml-0.5" />
                    </div>
                 </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">

                 {activeConv.messages.map((msg: any, i: number) => {
                     const isLastFromSender = activeConv.messages[i+1]?.sender !== msg.sender;
                     
                     if (msg.sender === 'system' && msg.statusData) {
                         return (
                            <div key={msg.id} className="flex justify-center my-4">
                               <div className="bg-white border text-center border-gray-100 shadow-sm rounded-xl p-4 w-full max-w-sm">
                                   <div className="text-xl mb-1">📦</div>
                                   <h4 className="font-bold text-gray-900 text-sm">{msg.statusData.title}</h4>
                                   <p className="text-gray-500 text-xs mt-1 mb-3">{msg.statusData.desc}</p>
                                   <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors border border-gray-200">
                                       View Order Details
                                   </button>
                               </div>
                            </div>
                         );
                     }
                     
                     return (
                     <div key={msg.id} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                             {msg.sender === 'pharmacy' && isLastFromSender && (
                                <div className="flex items-center gap-1.5 ml-1 mb-0.5">
                                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600">
                                        {activeConv.pharmacyAvatar}
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                                        {msg.pharmacistName}
                                        <CheckCircle2 className="w-3 h-3 text-brand-600" />
                                    </span>
                                </div>
                             )}

                             {msg.type === 'prescription_image' ? (
                                 <div className="bg-brand-50 p-2 rounded-2xl rounded-tr-sm border border-brand-100 flex flex-col items-end group cursor-pointer relative overflow-hidden">
                                     <div className="w-full sm:w-64 h-48 bg-white rounded-xl flex items-center justify-center relative overflow-hidden border border-brand-100">
                                         {msg.attachmentData?.url ? (
                                           <img src={msg.attachmentData.url} alt="Prescription" className="w-full h-full object-cover" />
                                         ) : (
                                           <ImageIcon className="w-10 h-10 text-brand-200" />
                                         )}
                                     </div>
                                     <div className="px-2 pt-2 flex items-center justify-between w-full">
                                         <div className="flex flex-col">
                                             <span className="text-xs font-bold text-brand-900 flex items-center gap-1">
                                                📋 {t('chat.prescription')}
                                             </span>
                                         </div>
                                     </div>
                                 </div>
                             ) : msg.type === 'voice' ? (
                                 <div className={`px-4 py-2.5 rounded-2xl flex items-center gap-3 ${msg.sender === 'patient' ? 'bg-brand-600 text-white rounded-tr-sm shadow-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm shadow-sm'}`}>
                                     <Mic className="w-5 h-5 shrink-0" />
                                     <div className="flex items-center gap-1 h-4 w-24">
                                        <div className={`w-1 rounded-full h-full ${msg.sender === 'patient' ? 'bg-brand-300' : 'bg-brand-500'}`}></div>
                                        <div className={`w-1 rounded-full h-2/3 ${msg.sender === 'patient' ? 'bg-brand-300' : 'bg-brand-500'}`}></div>
                                        <div className={`w-1 rounded-full h-1/2 ${msg.sender === 'patient' ? 'bg-brand-300' : 'bg-brand-500'}`}></div>
                                        <div className={`w-1 rounded-full h-full ${msg.sender === 'patient' ? 'bg-brand-300' : 'bg-brand-500'}`}></div>
                                        <div className={`w-1 rounded-full h-3/4 ${msg.sender === 'patient' ? 'bg-brand-300' : 'bg-brand-500'}`}></div>
                                        <div className={`w-1 rounded-full h-full ${msg.sender === 'patient' ? 'bg-brand-300' : 'bg-brand-500'}`}></div>
                                        <div className={`w-1 rounded-full h-2/3 ${msg.sender === 'patient' ? 'bg-brand-300' : 'bg-brand-500'}`}></div>
                                     </div>
                                     <span className="text-[10px] font-medium opacity-80 shrink-0">0:04</span>
                                 </div>
                             ) : msg.type === 'appointment_suggestion' && msg.appointmentData ? (
                                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-tl-sm w-full sm:w-72 overflow-hidden">
                                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flexitems-center gap-2">
                                        <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-emerald-600" />
                                            {t('chat.appointmentRequest')}
                                        </h4>
                                    </div>
                                    <div className="p-4 flex flex-col gap-3">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Date & Time</p>
                                            <p className="text-sm font-medium text-gray-900">{msg.appointmentData.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Location</p>
                                            <p className="text-sm font-medium text-gray-900">{msg.appointmentData.location}</p>
                                        </div>
                                        {msg.appointmentData.notes && (
                                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <p className="text-sm text-gray-700 italic">"{msg.appointmentData.notes}"</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <button className="py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors">
                                                {t('chat.decline')}
                                            </button>
                                            <button className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors">
                                                {t('chat.accept')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                             ) : (
                                <div className={`px-4 py-2.5 rounded-2xl max-w-full break-words text-[15px] space-y-2 leading-relaxed ${
                                    msg.sender === 'patient' 
                                        ? 'bg-brand-600 text-white rounded-tr-sm shadow-sm' 
                                        : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                             )}

                             <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium shrink-0 ${msg.sender === 'patient' ? 'text-gray-400 mr-1' : 'text-gray-400 ml-1'}`}>
                                 {msg.time}
                                 {msg.sender === 'patient' && (
                                     msg.status === 'read' ? <CheckCheck className="w-3.5 h-3.5 text-brand-500 ml-0.5" /> :
                                     msg.status === 'delivered' ? <CheckCheck className="w-3.5 h-3.5 text-gray-400 ml-0.5" /> :
                                     <Check className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
                                 )}
                             </div>
                         </div>
                     </div>
                     )
                 })}
                 <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="p-3 md:p-4 bg-white border-t border-gray-100 pb-safe relative shrink-0">
                  <div className="max-w-[1200px] mx-auto flex items-end gap-2 relative">
                      
                      <div className="relative">
                          <button 
                              onClick={() => setShowAttachments(!showAttachments)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${showAttachments ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                          >
                             <Paperclip className="w-5 h-5" />
                          </button>
                          
                          <AnimatePresence>
                              {showAttachments && (
                                  <motion.div 
                                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute bottom-12 left-0 min-w-[200px] bg-white border border-gray-100 shadow-xl rounded-2xl p-2 z-50 flex flex-col gap-1"
                                  >
                                      <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleFileUpload}
                                        accept="image/*,.pdf,.doc,.docx"
                                      />
                                      <AttachmentOption icon={<Camera className="w-4 h-4"/>} label={t('chat.camera')} onClick={() => fileInputRef.current?.click()} />
                                      <AttachmentOption icon={<ImageIcon className="w-4 h-4"/>} label={t('chat.gallery')} onClick={() => fileInputRef.current?.click()} />
                                      <div className="h-px bg-gray-50 my-1"></div>
                                      <AttachmentOption icon={<Shield className="w-4 h-4 text-brand-600"/>} label={t('chat.prescription')} badge="OCR" onClick={() => fileInputRef.current?.click()} />
                                      <AttachmentOption icon={<FileText className="w-4 h-4 text-emerald-600"/>} label={t('chat.document')} onClick={() => fileInputRef.current?.click()} />
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>

                      {isRecording ? (
                          <div className="flex-1 bg-red-50 border border-red-100 rounded-full flex items-center pr-3 pl-4 min-h-[44px] transition-all relative">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2 shrink-0"></div>
                              <span className="text-red-600 font-medium text-sm flex-1">Recording Voice...</span>
                              <div className="flex items-center gap-1 h-4 mr-2">
                                <div className="w-1 bg-red-400 rounded-full h-full animate-[bounce_1s_infinite]"></div>
                                <div className="w-1 bg-red-400 rounded-full h-2/3 animate-[bounce_1s_infinite_100ms]"></div>
                                <div className="w-1 bg-red-400 rounded-full h-full animate-[bounce_1s_infinite_200ms]"></div>
                              </div>
                              <button 
                                onClick={() => setIsRecording(false)}
                                className="w-[32px] h-[32px] shrink-0 rounded-full bg-red-200 hover:bg-red-300 text-red-700 flex items-center justify-center transition-colors"
                              >
                                 <X className="w-4 h-4" />
                              </button>
                          </div>
                      ) : (
                          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl flex items-center pr-1 min-h-[44px] transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 focus-within:bg-white relative">
                              <textarea
                                  value={messageInput}
                                  onChange={(e) => setMessageInput(e.target.value)}
                                  placeholder={t('chat.messagePlaceholder')}
                                  rows={1}
                                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-3 px-4 text-[15px] max-h-32 placeholder:text-gray-400"
                                  style={{ minHeight: '44px' }}
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleSendMessage(messageInput);
                                      }
                                  }}
                              />
                          </div>
                      )}

                      {messageInput.trim() ? (
                          <button 
                            onClick={() => handleSendMessage(messageInput)}
                            className="w-[44px] h-[44px] shrink-0 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors shadow-sm"
                          >
                             <Send className="w-5 h-5 ml-1" />
                          </button>
                      ) : (
                          <button 
                            onClick={toggleRecording}
                            className={`w-[44px] h-[44px] shrink-0 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                          >
                             {isRecording ? <Send className="w-5 h-5 ml-1" /> : <Mic className="w-5 h-5" />}
                          </button>
                      )}
                  </div>
                  <div className="text-center mt-3 mb-1 px-4">
                      <p className="text-[10px] text-gray-400 font-medium">⚠️ For medical emergencies, call 911 or visit your nearest hospital. This chat is for information only.</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">ለድንገተኛ ሁኔታዎች 911 ይደውሉ</p>
                  </div>
              </div>
            </>
          ) : (
             <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50/50 p-8 text-center flex-col h-full">
                 <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 mb-6 text-brand-200">
                     <Shield className="w-10 h-10" />
                 </div>
                 <h2 className="text-xl font-serif text-gray-900 mb-2">Pharmacist Messaging</h2>
                 <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
                     Select a conversation on the left or start a new chat to connect with a verified pharmacist.
                 </p>
             </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FilterTab({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count?: number }) {
    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                active ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
            }`}
        >
            {label}
            {count !== undefined && count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'}`}>
                    {count}
                </span>
            )}
        </button>
    )
}

function AttachmentOption({ icon, label, badge, onClick }: { icon: React.ReactNode, label: string, badge?: string, onClick?: () => void }) {
    return (
        <button onClick={onClick} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white border border-gray-100 flex items-center justify-center text-gray-600 transition-colors">
                   {icon}
               </div>
               <span className="text-sm font-bold text-gray-800">{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-brand-500 px-1.5 py-0.5 rounded">
                    {badge}
                </span>
            )}
        </button>
    )
}
