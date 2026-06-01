'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  listConversations,
  getConversationMessages,
  sendConversationMessage,
  markConversationRead,
  type ConversationListItem,
  type ConversationMessage,
} from '@/lib/api';
import { Search, Lock, Send, Globe, ChevronDown } from 'lucide-react';

type PatientSidebarRow = {
  id: string;
  name: string;
  initial: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  orderId: string | null;
};

type TeamSidebarRow = {
  id: string;
  name: string;
  initial: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  orderId: string | null;
};

function mapApiConvToPatientRow(c: ConversationListItem): PatientSidebarRow {
  const patientP = c.participants.find((p) => p.role === 'patient');
  const name = patientP?.name?.trim() || 'Patient';
  const last = c.lastMessage;
  const sent = last?.sentAt ? new Date(last.sentAt) : c.updatedAt ? new Date(c.updatedAt) : null;
  const today = new Date();
  let timeLabel = '';
  let isYesterday = false;
  if (sent && !Number.isNaN(sent.getTime())) {
    const calendarDay =
      sent.getFullYear() === today.getFullYear() && sent.getMonth() === today.getMonth() && sent.getDate() === today.getDate();
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    isYesterday =
      sent.getFullYear() === y.getFullYear() && sent.getMonth() === y.getMonth() && sent.getDate() === y.getDate();
    timeLabel = calendarDay || isYesterday ? sent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : sent.toLocaleDateString();
  }

  const oid = c.relatedOrderId ? String(c.relatedOrderId) : null;

  return {
    id: c._id,
    name,
    initial: name.charAt(0).toUpperCase(),
    lastMessage: last?.content || '',
    time: isYesterday ? 'Yesterday' : timeLabel,
    unread: 0,
    online: true,
    orderId: oid ? oid.slice(-8).toUpperCase() : null,
  };
}

function mapApiConvToTeamRow(c: ConversationListItem): TeamSidebarRow {
  const deliveryP = c.participants.find((p) => p.role === 'delivery');
  const name = deliveryP?.name?.trim() || 'Driver';
  const last = c.lastMessage;
  const sent = last?.sentAt ? new Date(last.sentAt) : c.updatedAt ? new Date(c.updatedAt) : null;
  const today = new Date();
  let timeLabel = '';
  let isYesterday = false;
  if (sent && !Number.isNaN(sent.getTime())) {
    const calendarDay =
      sent.getFullYear() === today.getFullYear() && sent.getMonth() === today.getMonth() && sent.getDate() === today.getDate();
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    isYesterday =
      sent.getFullYear() === y.getFullYear() && sent.getMonth() === y.getMonth() && sent.getDate() === y.getDate();
    timeLabel = calendarDay || isYesterday ? sent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : sent.toLocaleDateString();
  }

  const oid = c.relatedOrderId ? String(c.relatedOrderId) : null;

  return {
    id: c._id,
    name,
    initial: name.charAt(0).toUpperCase(),
    lastMessage: last?.content || '',
    time: isYesterday ? 'Yesterday' : timeLabel,
    unread: 0,
    online: true,
    orderId: oid ? oid.slice(-8).toUpperCase() : null,
  };
}

function mergeConversationMessages(prev: ConversationMessage[], incoming: ConversationMessage[]) {
  if (!incoming.length) return prev;
  const map = new Map(prev.map((m) => [m._id, m]));
  for (const m of incoming) map.set(m._id, m);
  return [...map.values()].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}

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
    team: 'Team',
    noConversations: 'No conversations yet',
    noConversationsHint: 'Open a chat from Pharmacy Orders to message a patient.',
    loadingList: 'Loading conversations…',
    loadingThread: 'Loading messages…',
    selectConversation: 'Select a conversation',
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
    team: 'ቡድን',
    noConversations: 'ገና ውይይት የለም',
    noConversationsHint: 'ከፋርማሲ ትዕዛዞች ገጽ ውይይት ይክፈቱ።',
    loadingList: 'ውይይቶች በመጫን ላይ…',
    loadingThread: 'መልዕክቶች በመጫን ላይ…',
    selectConversation: 'ውይይት ይምረጡ',
  },
};

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'patients' | 'team'>('patients');
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const patientSidebarRows = useMemo(
    () => conversations.filter((c) => c.participants.some((p) => p.role === 'patient')).map(mapApiConvToPatientRow),
    [conversations],
  );
  const teamSidebarRows = useMemo(
    () => conversations.filter((c) => c.participants.some((p) => p.role === 'delivery')).map(mapApiConvToTeamRow),
    [conversations],
  );

  const [activePatientConvId, setActivePatientConvId] = useState<string | null>(null);
  const [patientThreadMessages, setPatientThreadMessages] = useState<ConversationMessage[]>([]);
  const [patientThreadLoading, setPatientThreadLoading] = useState(false);
  const [patientThreadSending, setPatientThreadSending] = useState(false);

  const [activeTeamConvId, setActiveTeamConvId] = useState<string | null>(null);
  const [teamThreadMessages, setTeamThreadMessages] = useState<ConversationMessage[]>([]);
  const [teamThreadLoading, setTeamThreadLoading] = useState(false);
  const [teamThreadSending, setTeamThreadSending] = useState(false);

  const threadMessagesRef = useRef<ConversationMessage[]>([]);
  const activePatientConvIdRef = useRef<string | null>(null);
  const teamThreadMessagesRef = useRef<ConversationMessage[]>([]);
  const activeTeamConvIdRef = useRef<string | null>(null);
  const patientMessagesEndRef = useRef<HTMLDivElement>(null);
  const teamMessagesEndRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();
const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    threadMessagesRef.current = patientThreadMessages;
  }, [patientThreadMessages]);

  useEffect(() => {
    activePatientConvIdRef.current = activePatientConvId;
  }, [activePatientConvId]);

  useEffect(() => {
    teamThreadMessagesRef.current = teamThreadMessages;
  }, [teamThreadMessages]);

  useEffect(() => {
    activeTeamConvIdRef.current = activeTeamConvId;
  }, [activeTeamConvId]);

  const refreshConversations = async () => {
    try {
      const items = await listConversations();
      setConversations(items);
      setListError(null);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Could not load conversations');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void refreshConversations();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void refreshConversations();
    }, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const cid = params.get('conversation');
    if (!cid) return;
    const tabParam = params.get('tab');
    const teamMatch = conversations.find(
      (c) => c._id === cid && c.participants.some((p) => p.role === 'delivery'),
    );
    const patientMatch = conversations.find(
      (c) => c._id === cid && c.participants.some((p) => p.role === 'patient'),
    );
    if (tabParam === 'team' && teamMatch) {
      setActiveTab('team');
      setActiveTeamConvId(cid);
    } else if (patientMatch) {
      setActiveTab('patients');
      setActivePatientConvId(cid);
    } else if (teamMatch) {
      setActiveTab('team');
      setActiveTeamConvId(cid);
    }
  }, [conversations]);

  useEffect(() => {
    if (activePatientConvId && patientSidebarRows.length > 0 && !patientSidebarRows.some((r) => r.id === activePatientConvId)) {
      setActivePatientConvId(null);
      setPatientThreadMessages([]);
    }
  }, [patientSidebarRows, activePatientConvId]);

  useEffect(() => {
    if (activeTeamConvId && teamSidebarRows.length > 0 && !teamSidebarRows.some((r) => r.id === activeTeamConvId)) {
      setActiveTeamConvId(null);
      setTeamThreadMessages([]);
    }
  }, [teamSidebarRows, activeTeamConvId]);

  useEffect(() => {
    if (!activePatientConvId || activeTab !== 'patients') {
      setPatientThreadMessages([]);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      setPatientThreadLoading(true);
      setPatientThreadMessages([]);
      try {
        await markConversationRead(activePatientConvId).catch(() => {});
        const { messages: page } = await getConversationMessages(activePatientConvId, { page: 1 });
        if (cancelled) return;
        setPatientThreadMessages([...page].reverse());
      } catch {
        if (!cancelled) setPatientThreadMessages([]);
      } finally {
        if (!cancelled) setPatientThreadLoading(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [activePatientConvId, activeTab]);

  useEffect(() => {
    if (!activeTeamConvId || activeTab !== 'team') {
      setTeamThreadMessages([]);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      setTeamThreadLoading(true);
      setTeamThreadMessages([]);
      try {
        await markConversationRead(activeTeamConvId).catch(() => {});
        const { messages: page } = await getConversationMessages(activeTeamConvId, { page: 1 });
        if (cancelled) return;
        setTeamThreadMessages([...page].reverse());
      } catch {
        if (!cancelled) setTeamThreadMessages([]);
      } finally {
        if (!cancelled) setTeamThreadLoading(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [activeTeamConvId, activeTab]);

  useEffect(() => {
    if (!activePatientConvId || activeTab !== 'patients') return;

    const POLL_MS = 8000;

    const poll = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const cid = activePatientConvIdRef.current;
      if (!cid) return;
      try {
        const list = threadMessagesRef.current;
        if (list.length === 0) {
          const { messages } = await getConversationMessages(cid, { page: 1 });
          if (messages.length) setPatientThreadMessages([...messages].reverse());
          return;
        }
        let latest = list[0];
        for (let i = 1; i < list.length; i++) {
          if (new Date(list[i].sentAt).getTime() > new Date(latest.sentAt).getTime()) latest = list[i];
        }
        const { messages: inc } = await getConversationMessages(cid, { since: latest.sentAt });
        if (inc.length) setPatientThreadMessages((prev) => mergeConversationMessages(prev, inc));
      } catch {
        /* ignore */
      }
    };

    const interval = setInterval(poll, POLL_MS);
    poll();
    return () => clearInterval(interval);
  }, [activePatientConvId, activeTab]);

  useEffect(() => {
    if (!activeTeamConvId || activeTab !== 'team') return;

    const POLL_MS = 8000;

    const poll = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const cid = activeTeamConvIdRef.current;
      if (!cid) return;
      try {
        const list = teamThreadMessagesRef.current;
        if (list.length === 0) {
          const { messages } = await getConversationMessages(cid, { page: 1 });
          if (messages.length) setTeamThreadMessages([...messages].reverse());
          return;
        }
        let latest = list[0];
        for (let i = 1; i < list.length; i++) {
          if (new Date(list[i].sentAt).getTime() > new Date(latest.sentAt).getTime()) latest = list[i];
        }
        const { messages: inc } = await getConversationMessages(cid, { since: latest.sentAt });
        if (inc.length) setTeamThreadMessages((prev) => mergeConversationMessages(prev, inc));
      } catch {
        /* ignore */
      }
    };

    const interval = setInterval(poll, POLL_MS);
    poll();
    return () => clearInterval(interval);
  }, [activeTeamConvId, activeTab]);

  useEffect(() => {
    if (activeTab === 'patients' && activePatientConvId) {
      patientMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    if (activeTab === 'team' && activeTeamConvId) {
      teamMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, activePatientConvId, activeTeamConvId, patientThreadMessages, teamThreadMessages, patientThreadLoading, teamThreadLoading]);
const t = TRANSLATIONS[language];

  const filteredPatientRows = patientSidebarRows.filter((conv) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      conv.name.toLowerCase().includes(q) ||
      conv.lastMessage.toLowerCase().includes(q) ||
      (conv.orderId && conv.orderId.toLowerCase().includes(q))
    );
  });

  const filteredTeamConversations = teamSidebarRows.filter((conv) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      conv.name.toLowerCase().includes(q) ||
      conv.lastMessage.toLowerCase().includes(q) ||
      (conv.orderId && conv.orderId.toLowerCase().includes(q))
    );
  });

  const handleSendPatientMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !activePatientConvId || patientThreadSending) return;

    setPatientThreadSending(true);
    try {
      const sent = await sendConversationMessage(activePatientConvId, trimmed);
      setNewMessage('');
      setPatientThreadMessages((prev) => mergeConversationMessages(prev, [sent]));
      void refreshConversations();
    } catch {
      /* optional toast */
    } finally {
      setPatientThreadSending(false);
    }
  };

  const handleSendTeamMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !activeTeamConvId || teamThreadSending) return;

    setTeamThreadSending(true);
    try {
      const sent = await sendConversationMessage(activeTeamConvId, trimmed);
      setNewMessage('');
      setTeamThreadMessages((prev) => mergeConversationMessages(prev, [sent]));
      void refreshConversations();
    } catch {
      /* optional toast */
    } finally {
      setTeamThreadSending(false);
    }
  };

  const handleSendMessage = () => {
    if (activeTab === 'patients') void handleSendPatientMessage();
    else void handleSendTeamMessage();
  };

  const setChipMessage = (msg: string) => setNewMessage(msg);

  const activePatientRow = patientSidebarRows.find((r) => r.id === activePatientConvId);
  const activeTeamRow = teamSidebarRows.find((r) => r.id === activeTeamConvId);

  const onSelectPatientsTab = () => {
    setActiveTab('patients');
  };

  const onSelectTeamTab = () => {
    setActiveTab('team');
    if (teamSidebarRows.length > 0 && !activeTeamConvId) {
      setActiveTeamConvId(teamSidebarRows[0].id);
    }
  };

  const sendDisabled =
    activeTab === 'patients'
      ? !newMessage.trim() || patientThreadSending || patientThreadLoading || !activePatientConvId
      : !newMessage.trim() || teamThreadSending || teamThreadLoading || !activeTeamConvId;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-white">
      {/* Left Panel: Conversation List */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col shrink-0 bg-accent-50/30">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold text-brand-950">{t.messages}</h2>
</div>

          <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
            <button
              type="button"
              onClick={onSelectPatientsTab}
              className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                activeTab === 'patients' ? 'bg-white text-brand-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.patients}
            </button>
            <button
              type="button"
              onClick={onSelectTeamTab}
              className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                activeTab === 'team' ? 'bg-white text-brand-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
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
          {activeTab === 'patients' && listLoading && (
            <div className="p-4 text-sm text-gray-500 text-center">{t.loadingList}</div>
          )}
          {activeTab === 'patients' && listError && (
            <div className="p-4 text-sm text-red-600 text-center">{listError}</div>
          )}
          {activeTab === 'patients' && !listLoading && !listError && filteredPatientRows.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500 space-y-1">
              <p>{t.noConversations}</p>
              <p className="text-xs text-gray-400">{t.noConversationsHint}</p>
            </div>
          )}

          {activeTab === 'team' && listLoading && (
            <div className="p-4 text-sm text-gray-500 text-center">{t.loadingList}</div>
          )}
          {activeTab === 'team' && listError && (
            <div className="p-4 text-sm text-red-600 text-center">{listError}</div>
          )}
          {activeTab === 'team' && !listLoading && !listError && filteredTeamConversations.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500 space-y-1">
              <p>{t.noConversations}</p>
              <p className="text-xs text-gray-400">Driver chats appear here when you dispatch delivery orders.</p>
            </div>
          )}

          {activeTab === 'patients'
            ? filteredPatientRows.map((conv) => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => setActivePatientConvId(conv.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 cursor-pointer transition-colors flex gap-3 ${
                    activePatientConvId === conv.id ? 'bg-brand-50' : 'hover:bg-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-brand-100 text-brand-700">
                      {conv.initial}
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-sm text-brand-950 truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {conv.time === 'Yesterday' ? t.yesterday : conv.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage || '—'}
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
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-brand-600 bg-brand-100">
                          Re: {conv.orderId}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            : filteredTeamConversations.map((conv) => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => setActiveTeamConvId(conv.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 cursor-pointer transition-colors flex gap-3 ${
                    activeTeamConvId === conv.id ? 'bg-brand-50' : 'hover:bg-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-blue-100 text-blue-700">
                      {conv.initial}
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-sm text-brand-950 truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {conv.time === 'Yesterday' ? t.yesterday : conv.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage || '—'}
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
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-blue-700 bg-blue-100">
                          Re: {conv.orderId}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
        </div>
      </div>

      {/* Right Panel */}
      {(activeTab === 'patients' && activePatientRow) || (activeTab === 'team' && activeTeamRow) ? (
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* Header */}
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  activeTab === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'
                }`}
              >
                {activeTab === 'patients' ? activePatientRow!.initial : activeTeamRow!.initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-brand-950 truncate">
                    {activeTab === 'patients' ? activePatientRow!.name : activeTeamRow!.name}
                  </h2>
                  {activeTab === 'team' && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      Delivery
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {(activeTab === 'patients' ? activePatientRow!.online : activeTeamRow!.online) ? (
                    <span className="text-emerald-600 font-medium">{t.online}</span>
                  ) : (
                    t.offline
                  )}
                  <span className="mx-1">•</span>
                  <Lock className="w-3 h-3" /> {t.encrypted}
                </p>
              </div>
            </div>
            {activeTab === 'patients' && activePatientRow!.orderId && (
              <span className="hidden sm:inline text-sm font-bold text-brand-700 bg-brand-50 px-4 py-2 rounded-xl">
                {t.viewOrder} #{activePatientRow!.orderId} →
              </span>
            )}
            {activeTab === 'team' && activeTeamRow!.orderId && (
              <span className="hidden sm:inline text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl">
                {t.viewOrder} {activeTeamRow!.orderId} →
              </span>
            )}
          </div>

          {activeTab === 'team' && activeTeamRow!.orderId && (
            <div className="bg-blue-50 py-2 px-4 shadow-sm shrink-0 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
              <span className="text-xs font-bold text-blue-800 flex items-center justify-center gap-1">
                Order context: {activeTeamRow!.orderId}
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-accent-50/30 min-h-0 flex flex-col">
            <div className="flex justify-center shrink-0">
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{t.today}</span>
            </div>
            <div className="flex justify-center text-center mx-auto max-w-sm shrink-0">
              <span className="text-[10px] sm:text-xs text-gray-500 flex items-center justify-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                <Lock className="w-3 h-3 shrink-0" /> {t.encryptionNotice}
              </span>
            </div>

            {activeTab === 'patients' ? (
              <div className="flex flex-col gap-3 flex-1">
                {patientThreadLoading && (
                  <div className="text-center text-xs text-gray-500 py-8">{t.loadingThread}</div>
                )}
                {!patientThreadLoading && patientThreadMessages.length === 0 && (
                  <div className="text-center text-xs text-gray-500 py-8">No messages yet. Say hello!</div>
                )}
                {!patientThreadLoading &&
                  patientThreadMessages.map((msg) => {
                    const isSystem = msg.senderRole === 'system' || msg.kind === 'system';
                    if (isSystem) {
                      return (
                        <div key={msg._id} className="flex justify-center w-full shrink-0">
                          <div className="rounded-2xl bg-gray-100 text-gray-600 text-xs px-3 py-2 max-w-[95%] text-center break-words border border-gray-200">
                            {msg.content}
                          </div>
                        </div>
                      );
                    }
                    const mine = msg.senderRole === 'pharmacy';
                    const timeLabel =
                      msg.sentAt != null
                        ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                    return (
                      <div
                        key={msg._id}
                        className={`p-3 rounded-2xl text-sm shadow-sm max-w-[85%] ${
                          mine
                            ? 'bg-brand-600 text-white rounded-tr-sm self-end'
                            : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm self-start'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1.5 ${mine ? 'text-brand-100' : 'text-gray-400'}`}>{timeLabel}</p>
                      </div>
                    );
                  })}
                <div ref={patientMessagesEndRef} className="h-px shrink-0" aria-hidden />
              </div>
            ) : (
              <div className="flex flex-col gap-3 flex-1">
                {teamThreadLoading && (
                  <div className="text-center text-xs text-gray-500 py-8">{t.loadingThread}</div>
                )}
                {!teamThreadLoading && teamThreadMessages.length === 0 && (
                  <div className="text-center text-xs text-gray-500 py-8">No messages yet. Say hello!</div>
                )}
                {!teamThreadLoading &&
                  teamThreadMessages.map((msg) => {
                    const isSystem = msg.senderRole === 'system' || msg.kind === 'system';
                    if (isSystem) {
                      return (
                        <div key={msg._id} className="flex justify-center w-full shrink-0">
                          <div className="rounded-2xl bg-gray-100 text-gray-600 text-xs px-3 py-2 max-w-[95%] text-center break-words border border-gray-200">
                            {msg.content}
                          </div>
                        </div>
                      );
                    }
                    const mine = msg.senderRole === 'pharmacy';
                    const timeLabel =
                      msg.sentAt != null
                        ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                    return (
                      <div
                        key={msg._id}
                        className={`p-3 rounded-2xl text-sm shadow-sm max-w-[85%] ${
                          mine
                            ? 'bg-brand-900 text-white rounded-tr-sm self-end'
                            : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm self-start'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1.5 ${mine ? 'text-blue-200' : 'text-gray-400'}`}>{timeLabel}</p>
                      </div>
                    );
                  })}
                <div ref={teamMessagesEndRef} className="h-px shrink-0" aria-hidden />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 shrink-0">
            {activeTab === 'team' ? (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                <button
                  type="button"
                  onClick={() => setChipMessage('Please call the patient before arriving')}
                  className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full whitespace-nowrap"
                >
                  Please call the patient before arriving
                </button>
                <button
                  type="button"
                  onClick={() => setChipMessage("The patient's address has been updated")}
                  className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full whitespace-nowrap"
                >
                  The patient&apos;s address has been updated
                </button>
                <button
                  type="button"
                  onClick={() => setChipMessage('Return the order to the pharmacy')}
                  className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full whitespace-nowrap"
                >
                  Return the order to the pharmacy
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg">{t.sendMedInfo}</span>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 bg-accent-50 border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
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
                  disabled={
                    (activeTab === 'patients' && (!activePatientConvId || patientThreadLoading)) ||
                    (activeTab === 'team' && (!activeTeamConvId || teamThreadLoading))
                  }
                  className="w-full bg-transparent px-4 py-3 text-sm outline-none resize-none max-h-32 min-h-[44px] disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sendDisabled}
                className={`p-3 text-white rounded-xl transition-colors shadow-sm shrink-0 disabled:opacity-50 ${
                  activeTab === 'team' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-900 hover:bg-brand-800'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 flex-col px-6 text-center">
          <p className="text-gray-500">{t.selectConversation}</p>
          {activeTab === 'patients' && patientSidebarRows.length === 0 && !listLoading && (
            <p className="text-xs text-gray-400 mt-2">{t.noConversationsHint}</p>
          )}
          {activeTab === 'team' && teamSidebarRows.length === 0 && !listLoading && (
            <p className="text-xs text-gray-400 mt-2">Driver chats appear when you dispatch orders to a delivery agent.</p>
          )}
        </div>
      )}
    </div>
  );
}
