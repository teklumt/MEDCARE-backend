import { MessageSquare, Search, Shield, Filter, MapPin, SearchX, CheckCircle2, ChevronRight, Send, Paperclip, Mic, Image as ImageIcon, Camera, Phone, Info, MoreVertical, X, Check, Lock, CheckCheck, Clock, FileText, Calendar } from 'lucide-react';

export const getMockConversations = (t: (key: string) => string): any[] => [
  {
    id: 'conv-1',
    pharmacyName: t('orders.pharmacy.1'),
    pharmacyAvatar: 'M',
    isVerified: true,
    lastSeen: 'online',
    lastMessage: 'Your prescription is ready for pickup.',
    lastMessageTime: '10:32 AM',
    unreadCount: 2,
    orderId: 'MED-20847',
    messages: [
      {
        id: 'msg-1',
        sender: 'patient',
        text: 'Hello, I have a question about my order.',
        time: '10:15 AM',
        status: 'read'
      },
      {
        id: 'msg-2',
        sender: 'pharmacy',
        text: 'Hello! How can we help you today with order #MED-20847?',
        time: '10:18 AM',
        pharmacistName: 'Abebe (Pharmacist)'
      },
      {
        id: 'msg-3',
        sender: 'patient',
        text: 'Did my doctor send the new amoxicillin prescription?',
        time: '10:20 AM',
        status: 'read'
      },
      {
        id: 'msg-4',
        sender: 'pharmacy',
        text: 'Yes, we received it. We are preparing it now.',
        time: '10:25 AM',
        pharmacistName: 'Abebe (Pharmacist)'
      },
      {
        id: 'msg-5',
        sender: 'system',
        text: 'status_update',
        time: '10:30 AM',
        statusData: {
            title: 'Order Preparing',
            desc: 'Your order is being prepared by the pharmacist.',
            orderId: 'MED-20847'
        }
      },
      {
        id: 'msg-6',
        sender: 'pharmacy',
        text: 'Your prescription is ready for pickup.',
        time: '10:32 AM',
        pharmacistName: 'Abebe (Pharmacist)'
      }
    ]
  },
  {
    id: 'conv-2',
    pharmacyName: t('orders.pharmacy.2'),
    pharmacyAvatar: 'K',
    isVerified: true,
    lastSeen: 'Offline (Last seen 2h ago)',
    lastMessage: `📋 ${t('chat.prescription')}`,
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-21',
        sender: 'pharmacy',
        text: 'Good afternoon, please send a picture of your prescription so we can verify the dosage.',
        time: '2:15 PM',
        pharmacistName: 'Sara (Pharmacist)'
      },
      {
        id: 'msg-22',
        sender: 'patient',
        type: 'prescription_image',
        text: 'Here it is.',
        time: '2:30 PM',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'conv-3',
    pharmacyName: t('orders.pharmacy.3'),
    pharmacyAvatar: 'H',
    isVerified: true,
    lastSeen: 'online',
    lastMessage: `📅 ${t('chat.appointmentRequest')}`,
    lastMessageTime: 'Tuesday',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-31',
        sender: 'patient',
        text: 'I keep getting headaches after taking the new medicine.',
        time: '9:00 AM',
        status: 'read'
      },
      {
        id: 'msg-32',
        sender: 'pharmacy',
        text: 'That sounds like a possible side effect. You should consult a doctor before continuing.',
        time: '9:15 AM',
        pharmacistName: 'Daniel (Pharmacist)'
      },
      {
        id: 'msg-33',
        sender: 'pharmacy',
        type: 'appointment_suggestion',
        text: '',
        time: '9:16 AM',
        pharmacistName: 'Daniel (Pharmacist)',
        appointmentData: {
            date: 'Tomorrow, 10:00 AM',
            location: 'Telehealth Video Call',
            notes: 'General consultation regarding medication side effects.'
        }
      }
    ]
  }
];
