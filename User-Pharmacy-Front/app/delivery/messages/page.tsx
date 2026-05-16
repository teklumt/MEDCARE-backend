'use client';

import { useState, useRef, useEffect } from 'react';
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

export default function DeliveryMessages() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
    return true;
  });

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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="flex flex-col md:flex-row h-full min-h-0 overflow-hidden bg-white max-w-[1400px] mx-auto w-full">
      <div
        className={`w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col border-r border-gray-100 bg-white transition-transform duration-300 ${
          activeConvId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 md:p-6 pb-2 border-b border-gray-100 shrink-0">
          <h1 className="text-2xl font-serif text-brand-950 font-bold">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Chats with your pharmacy</p>
        </div>

        <div className="px-4 md:px-6 mb-4 shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full px-2 min-h-0">
          {listLoading && (
            <div className="text-center py-8 text-gray-500 text-sm">Loading conversations…</div>
          )}
          {listError && !listLoading && (
            <div className="text-center py-8 px-4 text-red-600 text-sm">{listError}</div>
          )}
          {!listLoading &&
            !listError &&
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-3 md:p-4 rounded-xl mb-1 flex items-start gap-3 transition-colors ${
                  activeConvId === conv.id ? 'bg-brand-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      activeConvId === conv.id ? 'bg-brand-200 text-brand-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {conv.pharmacyAvatar}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-bold text-gray-900 truncate">{conv.pharmacyName}</h3>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                    {conv.lastMessage}
                  </p>
                  {conv.orderId && (
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold rounded uppercase tracking-wider">
                      Re: {conv.orderId.slice(-8)}
                    </div>
                  )}
                </div>
              </button>
            ))}
          {!listLoading && !listError && filteredConversations.length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No conversations yet</h3>
              <p className="text-gray-500 text-sm">
                When a pharmacy assigns you to a delivery, your chat will appear here.
              </p>
            </div>
          )}
          <div className="h-6" />
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-[#FDFDFD] relative min-h-0 min-w-0 ${!activeConvId && 'hidden md:flex'}`}>
        {activeConvId && activeConv ? (
          <>
            <div className="h-16 md:h-20 border-b border-gray-100 bg-white flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveConvId(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 md:hidden -ml-2 shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold shrink-0">
                  {activeConv.pharmacyAvatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <h2 className="font-bold text-gray-900 truncate">{activeConv.pharmacyName}</h2>
                    <CheckCircle2 className="w-4 h-4 text-brand-600 fill-brand-50 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Pharmacy
                  </div>
                </div>
              </div>
            </div>

            {activeConv.orderId && (
              <div className="bg-brand-50 border-b border-brand-100 px-4 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">📦</span>
                  <p className="text-sm font-medium text-brand-900 truncate">Re: Order #{activeConv.orderId.slice(-8)}</p>
                </div>
                <div className="text-brand-600 flex items-center text-xs font-bold shrink-0">
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 min-h-0">
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
                  const isMine = msg.senderRole === 'delivery';
                  const isLastFromSender = threadMessages[i + 1]?.senderRole !== msg.senderRole;
                  const timeStr =
                    msg.sentAt != null
                      ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        {!isMine && isLastFromSender && (
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
                            isMine
                              ? 'bg-brand-600 text-white rounded-tr-sm'
                              : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div
                          className={`text-[10px] sm:text-xs font-medium shrink-0 ${isMine ? 'text-gray-400 mr-1' : 'text-gray-400 ml-1'}`}
                        >
                          {timeStr}
                        </div>
                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 bg-white border-t border-gray-100 shrink-0">
              <div className="max-w-[1200px] mx-auto flex items-end gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl flex items-center pr-1 min-h-[44px] transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 focus-within:bg-white relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Message your pharmacy…"
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
            </div>
          </>
        ) : activeConvId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm py-16">Loading conversation…</div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50/50 p-8 text-center flex-col h-full">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 mb-6 text-brand-200">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-serif text-gray-900 mb-2">Driver messaging</h2>
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
              Select a conversation or wait for a pharmacy to assign you to an order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
