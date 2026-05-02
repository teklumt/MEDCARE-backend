'use client';

import { useState, useRef, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, Phone, Info, Lock, X, Send, Mic, 
  Paperclip, Camera, Image as ImageIcon, FileText, 
  CheckCheck, ShieldCheck, Calendar, MapPin, Check, X as XIcon
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Message = {
  id: string;
  senderId: 'patient' | 'provider';
  content?: string;
  timestamp: string;
  type: 'text' | 'prescription' | 'appointment';
  isRead?: boolean;
  appointmentData?: {
    title: string;
    date: string;
    location: string;
    status: 'pending' | 'accepted' | 'declined';
  };
  prescriptionData?: {
    imageUrl: string;
    label: string;
  };
};

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'patient',
    content: 'Hello Pharmacist Sarah, I have a question about the medication I was prescribed.',
    timestamp: '10:00 AM',
    type: 'text',
    isRead: true,
  },
  {
    id: 'm2',
    senderId: 'provider',
    content: 'Hello Abebe. Of course, what would you like to know?',
    timestamp: '10:05 AM',
    type: 'text',
  },
  {
    id: 'm3',
    senderId: 'patient',
    content: 'Can I take Paracetamol along with the Amoxicillin?',
    timestamp: '10:10 AM',
    type: 'text',
    isRead: true,
  },
  {
    id: 'm4',
    senderId: 'provider',
    content: 'Yes, it is generally safe to take Paracetamol for fever or pain while on Amoxicillin. Just ensure you follow the dosage instructions. Would you like to schedule a quick consultation to review your full medication list?',
    timestamp: '10:15 AM',
    type: 'text',
  },
  {
    id: 'm5',
    senderId: 'provider',
    timestamp: '10:16 AM',
    type: 'appointment',
    appointmentData: {
      title: 'Medication Review',
      date: 'Tomorrow, 2:00 PM',
      location: 'Med-Care Central Pharmacy',
      status: 'pending'
    }
  },
  {
    id: 'm6',
    senderId: 'patient',
    timestamp: '10:20 AM',
    type: 'prescription',
    prescriptionData: {
      imageUrl: '/prescription.jpg',
      label: 'Current Prescription (For Reference)'
    },
    isRead: true,
  },
  {
    id: 'm7',
    senderId: 'provider',
    content: 'I have reviewed your prescription. Everything looks correct.',
    timestamp: '10:42 AM',
    type: 'text',
  }
];

export default function ActiveChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [showEncryptionBanner, setShowEncryptionBanner] = useState(true);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'patient',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  const handleAppointmentAction = (msgId: string, action: 'accepted' | 'declined') => {
    setMessages(messages.map(msg => {
      if (msg.id === msgId && msg.type === 'appointment' && msg.appointmentData) {
        return {
          ...msg,
          appointmentData: { ...msg.appointmentData, status: action }
        };
      }
      return msg;
    }));
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 md:py-8">
      <div className="flex-1 max-w-3xl mx-auto w-full bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-100 overflow-hidden flex flex-col h-[100dvh] md:h-[800px]">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/messages" className="p-2 -ml-2 text-gray-500 hover:text-brand-700 transition-colors rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold border border-brand-200">
                  PS
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                  Pharmacist Sarah
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                </h2>
                <p className="text-xs text-emerald-600 font-medium">{t('chat.online')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Encryption Banner */}
        <AnimatePresence>
          {showEncryptionBanner && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 border-b border-gray-100 overflow-hidden shrink-0"
            >
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  {t('chat.encryptionNotice')}
                </div>
                <button onClick={() => setShowEncryptionBanner(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#EFEAE2] bg-opacity-30">
          
          {/* Date Separator */}
          <div className="flex justify-center">
            <span className="bg-white/80 backdrop-blur-sm text-gray-500 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {t('chat.today')}
            </span>
          </div>

          {messages.map((msg) => {
            const isPatient = msg.senderId === 'patient';

            return (
              <div key={msg.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${isPatient ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <div className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}>
                    
                    {/* Text Message */}
                    {msg.type === 'text' && (
                      <div className={`p-3 rounded-2xl shadow-sm relative ${
                        isPatient 
                          ? 'bg-brand-600 text-white rounded-br-sm' 
                          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                      }`}>
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      </div>
                    )}

                    {/* Prescription Image */}
                    {msg.type === 'prescription' && msg.prescriptionData && (
                      <div className={`p-1.5 rounded-2xl shadow-sm ${isPatient ? 'bg-brand-600 rounded-br-sm' : 'bg-white rounded-bl-sm'}`}>
                        <div className="relative w-48 h-64 rounded-xl overflow-hidden mb-1 bg-gray-100">
                          <Image src={msg.prescriptionData.imageUrl} alt="Prescription" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">{t('chat.viewSecurely')}</span>
                          </div>
                        </div>
                        <p className={`text-xs px-2 pb-1 font-medium ${isPatient ? 'text-brand-100' : 'text-gray-500'}`}>
                          {msg.prescriptionData.label}
                        </p>
                      </div>
                    )}

                    {/* Appointment Card */}
                    {msg.type === 'appointment' && msg.appointmentData && (
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden w-64 sm:w-72 rounded-bl-sm">
                        <div className="bg-brand-50 px-4 py-3 border-b border-brand-100 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-brand-600" />
                          <h4 className="font-bold text-brand-900 text-sm">{t('chat.appointmentRequest')}</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="font-bold text-gray-900">{msg.appointmentData.title}</p>
                            <p className="text-sm text-brand-600 font-medium">{msg.appointmentData.date}</p>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs text-gray-500">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <p>{msg.appointmentData.location}</p>
                          </div>
                          
                          {msg.appointmentData.status === 'pending' ? (
                            <div className="flex gap-2 pt-2">
                              <button 
                                onClick={() => handleAppointmentAction(msg.id, 'declined')}
                                className="flex-1 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                              >
                                {t('chat.decline')}
                              </button>
                              <button 
                                onClick={() => handleAppointmentAction(msg.id, 'accepted')}
                                className="flex-1 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors"
                              >
                                {t('chat.accept')}
                              </button>
                            </div>
                          ) : (
                            <div className={`pt-2 flex items-center gap-1.5 text-xs font-bold ${msg.appointmentData.status === 'accepted' ? 'text-emerald-600' : 'text-red-500'}`}>
                              {msg.appointmentData.status === 'accepted' ? (
                                <><Check className="w-4 h-4" /> {t('chat.appointmentAccepted')}</>
                              ) : (
                                <><XIcon className="w-4 h-4" /> {t('chat.appointmentDeclined')}</>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timestamp & Status */}
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isPatient ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-gray-400 font-medium">{msg.timestamp}</span>
                      {isPatient && (
                        msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0 relative">
          
          {/* Attachments Menu */}
          <AnimatePresence>
            {showAttachments && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-4 mb-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 grid grid-cols-2 gap-2 w-64 z-30"
              >
                <button className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{t('chat.camera')}</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{t('chat.gallery')}</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{t('chat.prescription')}</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{t('chat.document')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <button 
              onClick={() => setShowAttachments(!showAttachments)}
              className={`p-2.5 rounded-full transition-colors shrink-0 ${showAttachments ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <Paperclip className="w-6 h-6" />
            </button>
            
            <div className="flex-1 bg-gray-100 rounded-3xl relative flex items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t('chat.messagePlaceholder')}
                className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-4 text-gray-900 placeholder-gray-500 max-h-32 min-h-[48px] scrollbar-hide"
                rows={1}
              />
            </div>

            {input.trim() ? (
              <button 
                onClick={handleSend}
                className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-colors shadow-sm shrink-0 mb-0.5"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button 
                className="p-3 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors shrink-0 mb-0.5"
              >
                <Mic className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
