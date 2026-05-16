'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  listConversations,
  getConversationMessages,
  sendConversationMessage,
  markConversationRead,
  type ConversationListItem,
  type ConversationMessage,
} from '@/lib/api';
import {
  Search,
  Shield,
  Phone,
  Info,
  MoreVertical,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Send,
  MessageSquare,
} from 'lucide-react';

type ConversationRow = {
  id: string;
  pharmacyName: string;
  pharmacyAvatar: string;
  isVerified: boolean;
  lastSeen: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  orderId: string | null;
};

function mapApiConvToRow(c: ConversationListItem): ConversationRow {
  const pharmacyP = c.participants.find((p) => p.role === 'pharmacy');
  const name = pharmacyP?.name?.trim() || 'Pharmacy';
  const last = c.lastMessage;
  const sent = last?.sentAt ? new Date(last.sentAt) : c.updatedAt ? new Date(c.updatedAt) : null;
  const lastMessageTime = sent
    ? sent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  return {
    id: c._id,
    pharmacyName: name,
    pharmacyAvatar: name.charAt(0).toUpperCase(),
    isVerified: true,
    lastSeen: 'online',
    lastMessage: last?.content || '',
    lastMessageTime,
    unreadCount: 0,
    orderId: c.relatedOrderId ? String(c.relatedOrderId) : null,
  };
}

function mergeThreadMessages(prev: ConversationMessage[], incoming: ConversationMessage[]) {
  if (!incoming.length) return prev;
  const map = new Map(prev.map((m) => [m._id, m]));
  for (const m of incoming) map.set(m._id, m);
  return [...map.values()].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}

export default function MessagesPage() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'orders'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [threadMessages, setThreadMessages] = useState<ConversationMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadSending, setThreadSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadMessagesRef = useRef<ConversationMessage[]>([]);
  const activeConvIdRef = useRef<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const filteredConversations = conversations.filter((c) => {
    if (searchQuery && !c.pharmacyName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterTab === 'unread' && c.unreadCount === 0) return false;
    if (filterTab === 'orders' && !c.orderId) return false;
    return true;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const refreshConversationList = async () => {
    try {
      const items = await listConversations();
      setConversations(items.map(mapApiConvToRow));
      setListError(null);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Could not load conversations');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void refreshConversationList();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void refreshConversationList();
    }, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    threadMessagesRef.current = threadMessages;
  }, [threadMessages]);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  useEffect(() => {
    if (activeConvId) {
      scrollToBottom();
    }
  }, [activeConvId, threadMessages, threadLoading]);

  useEffect(() => {
    if (!activeConvId) {
      setThreadMessages([]);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      setThreadLoading(true);
      setThreadMessages([]);
      try {
        await markConversationRead(activeConvId).catch(() => {});
        const { messages: page } = await getConversationMessages(activeConvId, { page: 1 });
        if (cancelled) return;
        setThreadMessages([...page].reverse());
      } catch {
        if (!cancelled) setThreadMessages([]);
      } finally {
        if (!cancelled) setThreadLoading(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [activeConvId]);

  useEffect(() => {
    if (!activeConvId) return;

    const POLL_MS = 8000;

    const poll = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const cid = activeConvIdRef.current;
      if (!cid) return;
      try {
        const list = threadMessagesRef.current;
        if (list.length === 0) {
          const { messages } = await getConversationMessages(cid, { page: 1 });
          if (messages.length) setThreadMessages([...messages].reverse());
          return;
        }
        let latest = list[0];
        for (let i = 1; i < list.length; i++) {
          if (new Date(list[i].sentAt).getTime() > new Date(latest.sentAt).getTime()) latest = list[i];
        }
        const { messages: inc } = await getConversationMessages(cid, { since: latest.sentAt });
        if (inc.length) {
          setThreadMessages((prev) => mergeThreadMessages(prev, inc));
        }
      } catch {
        /* ignore */
      }
    };

    const interval = setInterval(poll, POLL_MS);
    poll();
    return () => clearInterval(interval);
  }, [activeConvId]);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !activeConvId || threadSending) return;

    setThreadSending(true);
    try {
      const sent = await sendConversationMessage(activeConvId, trimmed);
      setMessageInput('');
      setThreadMessages((prev) => mergeThreadMessages(prev, [sent]));
      void refreshConversationList();
    } catch {
      /* optional toast */
    } finally {
      setThreadSending(false);
    }
  };

  useEffect(() => {
    if (activeConvId && conversations.length > 0 && !conversations.some((c) => c.id === activeConvId)) {
      setActiveConvId(null);
    }
  }, [conversations, activeConvId]);

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
            {listLoading && (
              <div className="text-center py-8 text-gray-500 text-sm">Loading conversations…</div>
            )}
            {listError && !listLoading && (
              <div className="text-center py-8 px-4 text-red-600 text-sm">{listError}</div>
            )}
            {!listLoading && !listError && filteredConversations.length > 0 &&
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3 md:p-4 rounded-xl mb-1 flex items-start gap-3 transition-colors ${activeConvId === conv.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${activeConvId === conv.id ? 'bg-brand-200 text-brand-800' : 'bg-gray-100 text-gray-700'}`}
                    >
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
                        Re: {conv.orderId.slice(-8)}
                      </div>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-6">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            {!listLoading && !listError && filteredConversations.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">{t('messages.noConversations')}</h3>
                <p className="text-gray-500 text-sm">Messages with your pharmacy appear here after you contact them from an order.</p>
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
                {threadLoading && (
                  <div className="text-center text-gray-500 text-sm py-8">Loading messages…</div>
                )}
                {!threadLoading &&
                  threadMessages.map((msg, i) => {
                    const isSystem = msg.senderRole === 'system' || msg.kind === 'system';
                    if (isSystem) {
                      return (
                        <div key={msg._id} className="flex justify-center w-full">
                          <div className="rounded-2xl bg-gray-100 text-gray-600 text-xs px-3 py-2 max-w-[92%] text-center break-words border border-gray-200">
                            {msg.content}
                          </div>
                        </div>
                      );
                    }
                    const isPatient = msg.senderRole === 'patient';
                    const isLastFromSender = threadMessages[i + 1]?.senderRole !== msg.senderRole;
                    const timeStr =
                      msg.sentAt != null
                        ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                    return (
                      <div key={msg._id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ${isPatient ? 'items-end' : 'items-start'}`}
                        >
                          {!isPatient && isLastFromSender && (
                            <div className="flex items-center gap-1.5 ml-1 mb-0.5">
                              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600">
                                {activeConv.pharmacyAvatar}
                              </div>
                              <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                                {msg.senderName || activeConv.pharmacyName}
                                <CheckCircle2 className="w-3 h-3 text-brand-600" />
                              </span>
                            </div>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-full break-words text-[15px] leading-relaxed shadow-sm ${
                              isPatient
                                ? 'bg-brand-600 text-white rounded-tr-sm'
                                : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div
                            className={`text-[10px] sm:text-xs font-medium shrink-0 ${isPatient ? 'text-gray-400 mr-1' : 'text-gray-400 ml-1'}`}
                          >
                            {timeStr}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="p-3 md:p-4 bg-white border-t border-gray-100 pb-safe relative shrink-0">
                <div className="max-w-[1200px] mx-auto flex items-end gap-2 relative">
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl flex items-center pr-1 min-h-[44px] transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 focus-within:bg-white relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={t('chat.messagePlaceholder')}
                      rows={1}
                      disabled={threadLoading}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-3 px-4 text-[15px] max-h-32 placeholder:text-gray-400 disabled:opacity-60"
                      style={{ minHeight: '44px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void handleSendMessage(messageInput);
                        }
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!messageInput.trim() || threadSending || threadLoading}
                    onClick={() => void handleSendMessage(messageInput)}
                    className="w-[44px] h-[44px] shrink-0 rounded-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:pointer-events-none text-white flex items-center justify-center transition-colors shadow-sm"
                  >
                    {threadSending ? (
                      <span className="text-xs font-bold">…</span>
                    ) : (
                      <Send className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                </div>
                <div className="text-center mt-3 mb-1 px-4">
                  <p className="text-[10px] text-gray-400 font-medium">
                    ⚠️ For medical emergencies, call 911 or visit your nearest hospital. This chat is for information only.
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">ለድንገተኛ ሁኔታዎች 911 ይደውሉ</p>
                </div>
              </div>
            </>
          ) : activeConvId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm py-16">Loading conversation…</div>
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
