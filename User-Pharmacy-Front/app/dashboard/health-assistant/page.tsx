'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { 
  ChevronLeft, Globe, AlertTriangle, X, Send, 
  Mic, Bot, Shield, Activity, MapPin, Square,
  CheckCircle2, AlertCircle, XCircle, Paperclip, FileText, Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { sendMedcareAiChat } from '@/lib/api';
import {
  readMedcareAiConversationId,
  writeMedcareAiConversationId
} from '@/lib/medcareAiSession';

type Message = {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  type?: 'standard' | 'rich';
  isError?: boolean;
  prescriptionMeta?: {
    doctor: string | null;
    clinic: string | null;
    medications: string[];
  };
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  richData?: {
    categories?: string[];
    guidance?: { type: 'safe' | 'warning' | 'avoid'; text: string }[];
    actions?: { label: string; icon: any }[];
  };
};

const SUGGESTED_PROMPTS = [
  "What is Paracetamol?",
  "I have a fever",
  "Pharmacy near me",
  "Malaria prevention",
  "Medicines in pregnancy"
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'Amharic' }
];

export default function HealthAssistantPage() {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'sys-1', role: 'system', content: t('assistant.private') }
  ]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Update system message when language changes
  useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[0] && newMessages[0].role === 'system') {
        newMessages[0].content = t('assistant.private');
      }
      return newMessages;
    });
  }, [t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setConversationId(readMedcareAiConversationId());
  }, []);

  const handleSend = async (text: string = input) => {
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;

    if (!trimmed && selectedFile) {
      setChatError('Add a message to send. Attachments are shown in the chat for your reference only; MedCare AI currently accepts text.');
      return;
    }

    let attachmentData = undefined;
    if (selectedFile) {
      attachmentData = {
        name: selectedFile.name,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile)
      };
    }

    const newUserMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed || 'Sent an attachment',
      attachment: attachmentData
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setSelectedFile(null);
    setChatError(null);
    setIsTyping(true);

    try {
      const data = await sendMedcareAiChat({
        content: trimmed,
        conversationId
      });

      const reply =
        typeof data.message?.text === 'string' && data.message.text.trim()
          ? data.message.text.trim()
          : 'No response text from MedCare AI.';

      const sid = data.session_id;
      const nextConv = sid != null && String(sid).trim() !== '' ? String(sid).trim() : conversationId;
      if (nextConv) {
        setConversationId(nextConv);
        writeMedcareAiConversationId(nextConv);
      }

      let prescriptionMeta: Message['prescriptionMeta'];
      const presc = data.prescription;
      if (presc?.detected) {
        prescriptionMeta = {
          doctor: presc.doctor ?? null,
          clinic: presc.clinic ?? null,
          medications: Array.isArray(presc.medications)
            ? presc.medications.map((m) => (typeof m === 'string' ? m : JSON.stringify(m)))
            : []
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'ai',
          content: reply,
          type: 'standard',
          prescriptionMeta
        }
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'MedCare AI request failed.';
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'ai',
          content: message,
          type: 'standard',
          isError: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setChatError('Voice input is not connected to MedCare AI yet. Please type your message.');
    } else {
      setIsRecording(true);
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="p-2 -ml-2 text-gray-500 hover:text-brand-700 transition-colors rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-gray-900 flex items-center gap-2">
              {t('assistant.title')}
            </h1>
            <p className="text-xs text-gray-500 font-medium">{t('assistant.subtitle')}</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="p-2 -mr-2 text-gray-500 hover:text-brand-700 transition-colors rounded-full hover:bg-gray-100 flex items-center gap-1"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:block">
                {language === 'am' ? 'AM' : 'EN'}
              </span>
            </button>
            
            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code as 'en' | 'am'); setShowLangDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border-b border-amber-200 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-start gap-3 relative">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="pr-6">
                <p className="text-sm text-amber-800 font-medium leading-snug">
                  {t('assistant.disclaimer')}
                </p>
              </div>
              <button 
                onClick={() => setShowDisclaimer(false)}
                className="absolute top-3 right-4 text-amber-600 hover:text-amber-800 p-1 rounded-md hover:bg-amber-100/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
              
              {msg.role === 'system' && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-100/50 px-3 py-1 rounded-full">
                  <Shield className="w-3.5 h-3.5" /> {msg.content}
                </div>
              )}

              {msg.role === 'ai' && (
                <div className="flex gap-3 max-w-[85%] sm:max-w-[75%]">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="space-y-2">
                    <div
                      className={`border text-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm ${
                        msg.isError
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {msg.prescriptionMeta && (
                      <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 shadow-sm text-sm space-y-2">
                        <p className="font-bold text-emerald-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 shrink-0" />
                          Prescription detected
                        </p>
                        {(msg.prescriptionMeta.doctor || msg.prescriptionMeta.clinic) && (
                          <ul className="text-emerald-900/90 space-y-1 text-[13px]">
                            {msg.prescriptionMeta.doctor && (
                              <li>
                                <span className="font-semibold">Doctor:</span> {msg.prescriptionMeta.doctor}
                              </li>
                            )}
                            {msg.prescriptionMeta.clinic && (
                              <li>
                                <span className="font-semibold">Clinic:</span> {msg.prescriptionMeta.clinic}
                              </li>
                            )}
                          </ul>
                        )}
                        {msg.prescriptionMeta.medications.length > 0 && (
                          <div>
                            <p className="font-semibold text-emerald-900 mb-1">Medications</p>
                            <ul className="list-disc list-inside text-emerald-900/90 text-[13px] space-y-0.5">
                              {msg.prescriptionMeta.medications.map((line, i) => (
                                <li key={i}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {msg.type === 'rich' && msg.richData && (
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
                        {msg.richData.categories && (
                          <div className="flex flex-wrap gap-2">
                            {msg.richData.categories.map(cat => (
                              <span key={cat} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {msg.richData.guidance && (
                          <div className="space-y-2.5">
                            {msg.richData.guidance.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                {item.type === 'safe' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                                {item.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                                {item.type === 'avoid' && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                                <span className="text-gray-700">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.richData.actions && (
                          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                            {msg.richData.actions.map((action, idx) => (
                              <button key={idx} className="flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors">
                                <action.icon className="w-4 h-4" /> {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {msg.role === 'user' && (
                <div className="bg-brand-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] sm:max-w-[75%] space-y-2">
                  {msg.attachment && (
                    <div className="bg-brand-700/50 rounded-xl overflow-hidden border border-brand-500/30">
                      {msg.attachment.type.startsWith('image/') ? (
                        <div className="flex flex-col">
                          <img src={msg.attachment.url} alt={msg.attachment.name} className="max-w-full max-h-48 object-cover" />
                          <div className="px-3 py-2 text-xs font-medium text-brand-100 flex items-center gap-1.5 bg-brand-800/50">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span className="truncate">{msg.attachment.name}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="px-3 py-3 text-sm font-medium text-brand-50 flex items-center gap-2">
                          <div className="p-2 bg-brand-600 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="truncate">{msg.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.content && <p className="text-[15px] leading-relaxed">{msg.content}</p>}
                </div>
              )}

            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] sm:max-w-[75%]">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-brand-600" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <span className="text-sm text-gray-500 font-medium ml-1">{t('assistant.thinking')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State / Suggested Prompts */}
          {messages.length === 1 && !isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">{t('assistant.help')}</h2>
              <p className="text-gray-500 text-sm mb-8 text-center max-w-md">
                {t('assistant.helpDesc')}
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void handleSend(prompt)}
                    className="bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-700 hover:text-brand-700 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto relative">
          {chatError && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="flex-1 leading-snug">{chatError}</p>
              <button
                type="button"
                onClick={() => setChatError(null)}
                className="p-1 rounded-md text-amber-700 hover:bg-amber-100/80"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {isRecording ? (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-full px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium text-sm">{t('assistant.listening')}</span>
                {/* Simulated waveform */}
                <div className="flex items-center gap-1 h-4 ml-2">
                  <div className="w-1 bg-red-400 rounded-full h-full animate-[bounce_1s_infinite]"></div>
                  <div className="w-1 bg-red-400 rounded-full h-2/3 animate-[bounce_1s_infinite_100ms]"></div>
                  <div className="w-1 bg-red-400 rounded-full h-full animate-[bounce_1s_infinite_200ms]"></div>
                  <div className="w-1 bg-red-400 rounded-full h-1/2 animate-[bounce_1s_infinite_300ms]"></div>
                  <div className="w-1 bg-red-400 rounded-full h-3/4 animate-[bounce_1s_infinite_400ms]"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={cancelRecording}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-red-100 rounded-full transition-colors"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
                <button 
                  onClick={toggleRecording}
                  className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* File Preview */}
              {selectedFile && (
                <div className="flex items-center gap-3 bg-brand-50 p-2 rounded-xl mb-1 mx-12 border border-brand-100">
                  <div className="w-10 h-10 rounded-lg bg-brand-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedFile.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(selectedFile)} alt={selectedFile.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-brand-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-brand-500 font-medium whitespace-nowrap">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                    // reset input so same file can be selected again
                    e.target.value = '';
                  }}
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 transition-colors shrink-0 ${
                    selectedFile ? 'text-brand-600' : 'text-gray-400 hover:text-brand-600'
                  }`}
                  aria-label="Upload file"
                >
                  <Paperclip className="w-6 h-6" />
                </button>
                
                <div className="flex-1 bg-gray-100 rounded-3xl relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder={t('assistant.placeholder')}
                    className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3.5 px-4 text-gray-900 placeholder-gray-500 max-h-32 min-h-[52px]"
                    rows={1}
                  />
                </div>

                {input.trim() ? (
                  <button 
                    onClick={() => void handleSend()}
                    className="p-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-colors shadow-sm shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={toggleRecording}
                    className="p-3.5 bg-brand-100 hover:bg-brand-200 text-brand-700 rounded-full transition-colors shrink-0"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </main>
  );
}
