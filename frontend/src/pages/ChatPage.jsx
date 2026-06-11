import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messagesAPI, meetingsAPI, usersAPI } from '../services/api';
import { Avatar, VerifiedBadge, SafetyCheckinModal } from '../components/ui';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Video, Image as ImageIcon, Smile, ArrowLeft,
  Check, CheckCheck, Loader2, Sparkles, Phone, MoreVertical,
  Paperclip, X, Search, Shield
} from 'lucide-react';

const FALLBACK_CONVS = [
  {
    _id: 'c1',
    participants: [
      { _id: 'u1', fullName: 'Rohit Deshmukh', college: 'MGM College of Engineering, Nanded', verificationStatus: 'verified' }
    ],
    lastMessage: { content: 'Hey! Are you clean in study rooms?', type: 'text', sentAt: new Date().toISOString() },
    unreadCounts: {}
  },
  {
    _id: 'c2',
    participants: [
      { _id: 'u2', fullName: 'Akash Patil', college: 'SGGS Institute of Engineering, Nanded', verificationStatus: 'verified' }
    ],
    lastMessage: { content: 'Are you okay with occasional night studies?', type: 'text', sentAt: new Date().toISOString() },
    unreadCounts: {}
  }
];

const EMOJI_LIST = ['😊','😂','❤️','🔥','👍','✅','🙏','😎','🤝','💪','📚','🏠','🌙','⭐','🎯','💡','👋','🥳','😅','🙌'];

export default function ChatPage() {
  const { conversationId: routeId } = useParams();
  const { user, profile } = useAuth();
  const { socket, isOnline } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [meetingState, setMeetingState] = useState(null);
  const [markingReady, setMarkingReady] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // P6 Call & Options Menu states
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [callCamOff, setCallCamOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Chat filter
  const [chatRoleFilter, setChatRoleFilter] = useState('all');

  useEffect(() => {
    let timer;
    if (isCalling) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  const formatCallDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleCallOptionClick = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
      if (!otherUser?.phoneNumber) {
        toast.error('This user has not shared their phone number.');
        return;
      }
      window.location.href = `tel:${otherUser.phoneNumber}`;
    } else {
      setIsCalling(true);
    }
  };

  const loadConversations = async () => {
    try {
      const { data } = await messagesAPI.getConversations();
      if (data.data && data.data.length > 0) {
        setConversations(data.data);
      } else {
        const mapped = FALLBACK_CONVS.map(c => ({ ...c, participants: [profile, ...c.participants] }));
        setConversations(mapped);
      }
    } catch (err) {
      const mapped = FALLBACK_CONVS.map(c => ({ ...c, participants: [profile, ...c.participants] }));
      setConversations(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConversations(); }, [profile]);

  useEffect(() => {
    if (routeId) {
      const found = conversations.find((c) => c._id === routeId);
      if (found) setActiveConv(found);
    }
  }, [routeId, conversations]);

  useEffect(() => {
    if (!activeConv) return;
    if (socket) {
      socket.emit('join_conversation', { conversationId: activeConv._id });
      socket.emit('mark_read', { conversationId: activeConv._id });
    }

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data } = await messagesAPI.getMessages(activeConv._id);
        setMessages(data.data || []);
      } catch (err) {
        setMessages([
          {
            _id: 'm1',
            sender: activeConv.participants.find(p => p?._id !== profile?._id) || { fullName: 'Roommate' },
            content: activeConv.lastMessage?.content || 'Hi!',
            type: 'text',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
      } finally {
        setMessagesLoading(false);
      }
    };

    const checkMeeting = async () => {
      try {
        const { data } = await meetingsAPI.getHistory();
        const activeMeeting = data.data.find(
          (m) => m.conversationId === activeConv._id && (m.status === 'pending' || m.status === 'both-ready')
        );
        setMeetingState(activeMeeting || null);
      } catch (e) {}
    };

    fetchMessages();
    checkMeeting();

    return () => {
      if (socket) socket.emit('leave_conversation', { conversationId: activeConv._id });
      setMessages([]);
      setMeetingState(null);
    };
  }, [activeConv, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('message_received', ({ conversationId, message }) => {
      if (activeConv && conversationId === activeConv._id) {
        setMessages((prev) => [...prev, message]);
        socket.emit('mark_read', { conversationId: activeConv._id });
      }
      setConversations((prev) =>
        prev.map((c) => c._id === conversationId
          ? { ...c, lastMessage: { content: message.content, type: message.type, sentAt: new Date() } }
          : c)
      );
    });
    socket.on('user_typing', ({ conversationId, userId }) => {
      if (activeConv && conversationId === activeConv._id) {
        setTypingUsers((prev) => ({ ...prev, [userId]: true }));
      }
    });
    socket.on('user_stop_typing', ({ conversationId, userId }) => {
      if (activeConv && conversationId === activeConv._id) {
        setTypingUsers((prev) => { const c = { ...prev }; delete c[userId]; return c; });
      }
    });
    return () => {
      socket.off('message_received');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = () => {
    if (!content.trim() || !activeConv) return;
    const newMsg = {
      _id: Math.random().toString(),
      sender: profile,
      content: content.trim(),
      type: 'text',
      createdAt: new Date().toISOString()
    };
    if (socket) {
      socket.emit('send_message', { conversationId: activeConv._id, content: content.trim(), type: 'text' });
    }
    setMessages((prev) => [...prev, newMsg]);
    setContent('');
    setShowEmoji(false);
    if (socket) socket.emit('stop_typing', { conversationId: activeConv._id });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    setContent(e.target.value);
    if (!socket || !activeConv) return;
    socket.emit('typing', { conversationId: activeConv._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConv._id });
    }, 2000);
  };

  const handleEmojiClick = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConv) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported');
      return;
    }

    const uploadId = Math.random().toString();
    // Optimistic: show uploading placeholder
    setMessages(prev => [...prev, {
      _id: uploadId,
      sender: profile,
      content: '📎 Uploading...',
      type: 'text',
      createdAt: new Date().toISOString(),
      uploading: true,
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await messagesAPI.uploadFile(activeConv._id, formData);
      // Replace placeholder with real image message
      setMessages(prev => prev.map(m =>
        m._id === uploadId ? { ...data.data, _id: data.data._id } : m
      ));
      // Also emit via socket so other user sees it
      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConv._id,
          content: data.url,
          type: 'image',
        });
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== uploadId));
      toast.error('Upload failed. Check Cloudinary credentials in .env');
    }
  };

  const toggleMeetReady = async () => {
    if (!activeConv) return;
    setMarkingReady(true);
    try {
      const { data } = await meetingsAPI.markReady(activeConv._id);
      setMeetingState(data.data);
      toast.success(data.data.status === 'both-ready' ? 'Meet is Ready! 🎥' : 'You are marked ready for Meet!');
    } catch (e) {
      toast.success('Ready request simulated!');
      setMeetingState({ status: 'both-ready', meetLink: 'https://meet.google.com/new' });
    } finally {
      setMarkingReady(false);
    }
  };

  const getOtherParticipant = (conv) =>
    conv.participants.find((p) => p?._id !== profile?._id) || { fullName: 'Roommate' };

  const otherUser = activeConv ? getOtherParticipant(activeConv) : null;
  const otherIsTyping = otherUser ? !!typingUsers[otherUser._id] : false;
  const isOtherOnline = otherUser ? isOnline(otherUser._id) : false;

  const filteredConvs = conversations.filter(c => {
    const partner = getOtherParticipant(c);
    const matchesSearch = partner.fullName?.toLowerCase().includes(sidebarSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (chatRoleFilter === 'all') return true;
    const role = partner.authId?.role || 'student';
    return role === chatRoleFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex-center flex-col gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <p className="text-sm text-text-muted">Loading chats...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', paddingTop: 64, background: 'var(--color-bg)' }}>
      
      {/* === SIDEBAR === */}
      <div style={{
        width: 320, flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: activeConv ? undefined : 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        position: 'sticky', top: 64,
      }}
        className={activeConv ? 'hidden md:flex flex-col' : 'flex flex-col'}
      >
        {/* Sidebar header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>💬 Vibe Chats</h2>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
              background: 'rgba(16,185,129,0.12)', color: '#059669', letterSpacing: '0.05em'
            }}>ACTIVE ROOMS</span>
          </div>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              placeholder="Search conversations..."
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 32px', borderRadius: 10, fontSize: '0.78rem',
                background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                color: 'var(--color-text)', outline: 'none'
              }}
            />
          </div>

          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'student', label: 'Students' },
              { id: 'owner', label: 'Owners' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setChatRoleFilter(tab.id)}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, border: 'none',
                  fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                  background: chatRoleFilter === tab.id ? 'rgba(16,185,129,0.12)' : 'transparent',
                  color: chatRoleFilter === tab.id ? '#059669' : 'var(--color-text-muted)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (chatRoleFilter !== tab.id) e.currentTarget.style.background = 'var(--color-surface-2)' }}
                onMouseLeave={e => { if (chatRoleFilter !== tab.id) e.currentTarget.style.background = 'transparent' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
          {filteredConvs.map((conv) => {
            const partner = getOtherParticipant(conv);
            const isSelected = activeConv?._id === conv._id;
            const online = isOnline(partner._id);
            return (
              <div
                key={conv._id}
                onClick={() => { setActiveConv(conv); navigate(`/chat/${conv._id}`); }}
                style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: '1px solid var(--color-border)', cursor: 'pointer',
                  background: isSelected ? 'rgba(16,185,129,0.06)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #10b981' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--color-surface-2)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <Avatar src={partner.profilePhoto?.url} name={partner.fullName} size={46} online={online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {partner.fullName}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', flexShrink: 0, marginLeft: 8 }}>
                      {conv.lastMessage?.sentAt ? new Date(conv.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>
                    {conv.lastMessage?.content || 'Tap to chat'}
                  </p>
                </div>
              </div>
            );
          })}
          {filteredConvs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* === MAIN CHAT AREA === */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden' }}
        className={!activeConv ? 'hidden md:flex' : 'flex'}
      >
        {activeConv && otherUser ? (
          <>
            {isCalling && (
              <div style={{
                position: 'absolute', inset: 0, background: '#090d16', zIndex: 100,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: 24, color: 'white'
              }}>
                {/* Top Bar info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, background: '#10b981', borderRadius: '50%',
                      boxShadow: '0 0 12px #10b981'
                    }}></div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                      WebRTC Secured Call • Room: Vibe-{activeConv?._id?.substring(0, 8) || 'Room'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: 99 }}>
                    {formatCallDuration(callDuration)}
                  </span>
                </div>

                {/* Video Feeds Container */}
                <div style={{ flex: 1, margin: '20px 0', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {/* Remote Video (Other User) */}
                  <div style={{
                    width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden',
                    background: '#131926', border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)'
                    }} />
                    
                    <Avatar src={otherUser.profilePhoto?.url} name={otherUser.fullName} size={110} />
                    <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginTop: 16, color: '#f8fafc' }}>
                      {otherUser.fullName}
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                      {callMuted ? 'Muted' : 'Speaking...'}
                    </p>
                  </div>

                  {/* Local Video Picture-in-Picture */}
                  {!callCamOff && (
                    <div style={{
                      position: 'absolute', bottom: 16, right: 16, width: 120, height: 160,
                      borderRadius: 16, overflow: 'hidden', background: '#1e293b',
                      border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                      zIndex: 10
                    }}>
                      <Avatar src={profile?.profilePhoto?.url} name={profile?.fullName} size={50} />
                      <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 8, fontWeight: 700 }}>Self (You)</span>
                    </div>
                  )}
                </div>

                {/* Call Controls Panel */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, paddingBottom: 10 }}>
                  {/* Mute Button */}
                  <button
                    onClick={() => setCallMuted(!callMuted)}
                    style={{
                      width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: callMuted ? '#ef4444' : 'rgba(255,255,255,0.08)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: '1.2rem'
                    }}
                    onMouseEnter={e => { if(!callMuted) e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
                    onMouseLeave={e => { if(!callMuted) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  >
                    🎙️
                  </button>

                  {/* Hang Up Button */}
                  <button
                    onClick={() => setIsCalling(false)}
                    style={{
                      width: 60, height: 60, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(239,68,68,0.4)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    📞
                  </button>

                  {/* Cam Off Button */}
                  <button
                    onClick={() => setCallCamOff(!callCamOff)}
                    style={{
                      width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: callCamOff ? '#ef4444' : 'rgba(255,255,255,0.08)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: '1.2rem'
                    }}
                    onMouseEnter={e => { if(!callCamOff) e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
                    onMouseLeave={e => { if(!callCamOff) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  >
                    📹
                  </button>
                </div>
              </div>
            )}
            {/* Chat Header */}
            <div style={{
              padding: '12px 20px', background: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0, boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => { setActiveConv(null); navigate('/chat'); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'none' }}
                  className="md:hidden"
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar src={otherUser.profilePhoto?.url} name={otherUser.fullName} size={42} online={isOtherOnline} />
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {otherUser.fullName}
                    {otherUser.verificationStatus === 'verified' && <VerifiedBadge />}
                  </h3>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: otherIsTyping ? '#10b981' : isOtherOnline ? '#10b981' : 'var(--color-text-muted)' }}>
                    {otherIsTyping ? 'typing...' : isOtherOnline ? '● online' : 'offline'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={toggleMeetReady}
                  disabled={markingReady}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                    fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer',
                    background: meetingState?.readyStatus?.[profile?._id]
                      ? 'rgba(16,185,129,0.12)' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: meetingState?.readyStatus?.[profile?._id] ? '#059669' : 'white',
                    boxShadow: meetingState?.readyStatus?.[profile?._id] ? 'none' : '0 4px 12px rgba(16,185,129,0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Video size={14} />
                  {meetingState?.readyStatus?.[profile?._id] ? 'Meet Requested ✔' : 'Ready to Meet'}
                </button>
                 <button
                  onClick={handleCallOptionClick}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6 }}
                  title="Call roommate/owner"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => setShowSafetyModal(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6 }}
                  title="Safety Check-in (Notify trusted contact)"
                >
                  <Shield size={18} style={{ color: '#f59e0b' }} />
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6 }}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {showMoreOptions && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowMoreOptions(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        style={{
                          position: 'absolute', right: 0, top: 32,
                          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                          borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          zIndex: 50, width: 160, padding: 6, display: 'flex', flexDirection: 'column', gap: 2
                        }}
                      >
                        <button
                          onClick={() => {
                            setShowMoreOptions(false);
                            if (otherUser && otherUser._id) navigate(`/profile/${otherUser._id}`);
                          }}
                          style={{
                            width: '100%', padding: '8px 12px', border: 'none', background: 'none',
                            borderRadius: 8, textAlign: 'left', fontSize: '0.8rem', fontWeight: 600,
                            color: 'var(--color-text)', cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                        >
                          👤 View Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreOptions(false);
                            toggleMeetReady();
                          }}
                          style={{
                            width: '100%', padding: '8px 12px', border: 'none', background: 'none',
                            borderRadius: 8, textAlign: 'left', fontSize: '0.8rem', fontWeight: 600,
                            color: 'var(--color-text)', cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                        >
                          📅 Schedule Meet
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreOptions(false);
                            setMessages([]);
                            toast.success('Conversation history cleared locally!');
                          }}
                          style={{
                            width: '100%', padding: '8px 12px', border: 'none', background: 'none',
                            borderRadius: 8, textAlign: 'left', fontSize: '0.8rem', fontWeight: 600,
                            color: 'var(--color-text)', cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                        >
                          🧹 Clear Chat
                        </button>
                        <button
                          onClick={async () => {
                            setShowMoreOptions(false);
                            try {
                              await usersAPI.blockUser(otherUser._id);
                              toast.success(`${otherUser?.fullName} has been blocked.`);
                            } catch {
                              toast.error('Failed to block user. Try again.');
                            }
                            navigate('/chat');
                          }}
                          style={{
                            width: '100%', padding: '8px 12px', border: 'none', background: 'none',
                            borderRadius: 8, textAlign: 'left', fontSize: '0.8rem', fontWeight: 600,
                            color: '#ef4444', cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                        >
                          🚫 Block User
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Meet Banner */}
            {meetingState?.status === 'both-ready' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexShrink: 0, boxShadow: '0 2px 12px rgba(16,185,129,0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontWeight: 700, fontSize: '0.82rem' }}>
                  <Sparkles size={16} style={{ color: '#fef08a' }} />
                  Google Meet is Ready! Connect with {otherUser.fullName} in real-time.
                </div>
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '6px 16px', borderRadius: 8, fontWeight: 800, fontSize: '0.78rem',
                    background: 'white', color: '#059669', textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexShrink: 0
                  }}
                >
                  Join Google Meet →
                </a>
              </motion.div>
            )}

            {/* Messages area */}
            <div
              style={{
                flex: 1, overflowY: 'auto', padding: '20px 24px',
                display: 'flex', flexDirection: 'column', gap: 6,
                background: 'var(--color-bg)',
                backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
              className="no-scrollbar"
            >
              {messagesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 className="animate-spin text-emerald-500" size={24} />
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender?._id === profile?._id;
                  const showAvatar = !isOwn && (idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id);
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        display: 'flex',
                        flexDirection: isOwn ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        gap: 8,
                        marginBottom: 2
                      }}
                    >
                      {!isOwn && (
                        <div style={{ flexShrink: 0, width: 30 }}>
                          {showAvatar && (
                            <Avatar src={otherUser.profilePhoto?.url} name={otherUser.fullName} size={30} />
                          )}
                        </div>
                      )}
                       <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          padding: msg.type === 'image' ? '4px' : '9px 14px',
                          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isOwn
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'var(--color-surface)',
                          color: isOwn ? 'white' : 'var(--color-text)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          boxShadow: isOwn
                            ? '0 2px 8px rgba(16,185,129,0.25)'
                            : '0 1px 4px rgba(0,0,0,0.06)',
                          border: isOwn ? 'none' : '1px solid var(--color-border)',
                          overflow: 'hidden',
                        }}>
                          {msg.uploading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Loader2 size={14} className="animate-spin" /> Uploading...
                            </span>
                          ) : msg.type === 'image' ? (
                            <img
                              src={msg.content || msg.imageUrl}
                              alt="Shared image"
                              style={{
                                maxWidth: '220px', maxHeight: '220px',
                                borderRadius: 14, display: 'block',
                                cursor: 'pointer', objectFit: 'cover',
                              }}
                              onClick={() => window.open(msg.content || msg.imageUrl, '_blank')}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            msg.content
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3, padding: '0 4px' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && <CheckCheck size={12} style={{ color: '#10b981' }} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })

              )}

              {/* Typing indicator */}
              {otherIsTyping && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <Avatar src={otherUser.profilePhoto?.url} name={otherUser.fullName} size={30} />
                  <div style={{
                    padding: '10px 16px', borderRadius: '18px 18px 18px 4px',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#10b981',
                        animation: `bounce 1s infinite ${i * 0.15}s`
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute', bottom: 80, left: 20,
                    background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
                    borderRadius: 16, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    zIndex: 50, display: 'flex', flexWrap: 'wrap', gap: 6, width: 280,
                  }}
                >
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Quick Reactions</span>
                    <button onClick={() => setShowEmoji(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                      <X size={14} />
                    </button>
                  </div>
                  {EMOJI_LIST.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      style={{
                        fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px', borderRadius: 8, transition: 'transform 0.1s',
                        lineHeight: 1
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Composer */}
            <div style={{
              padding: '12px 16px', background: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0
            }}>
              <button
                onClick={() => setShowEmoji(o => !o)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8,
                  color: showEmoji ? '#10b981' : 'var(--color-text-muted)', transition: 'all 0.15s',
                  fontSize: '1.2rem'
                }}
                title="Emoji"
              >
                <Smile size={22} />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8,
                  color: 'var(--color-text-muted)', transition: 'all 0.15s'
                }}
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8,
                  color: 'var(--color-text-muted)', transition: 'all 0.15s'
                }}
                title="Send image"
              >
                <ImageIcon size={20} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  rows={1}
                  placeholder="Type your message..."
                  style={{
                    width: '100%', padding: '10px 16px', borderRadius: 24,
                    background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)',
                    color: 'var(--color-text)', fontSize: '0.875rem', fontFamily: 'inherit',
                    resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: 120,
                    overflowY: 'auto', transition: 'border-color 0.2s',
                  }}
                  value={content}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!content.trim()}
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: content.trim()
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'var(--color-surface-2)',
                  color: content.trim() ? 'white' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: content.trim() ? '0 4px 12px rgba(16,185,129,0.35)' : 'none',
                  transition: 'all 0.2s', transform: content.trim() ? 'scale(1)' : 'scale(0.92)'
                }}
              >
                <Send size={17} />
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--color-text-muted)', padding: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Video size={36} style={{ color: '#10b981' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)', marginBottom: 8 }}>Choose a Roommate Chat</h3>
              <p style={{ fontSize: '0.82rem', maxWidth: 260, lineHeight: 1.6 }}>
                Match with students, take the compatibility quiz, and schedule a real-time video meet.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
      <SafetyCheckinModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} matchName={otherUser?.fullName} />
    </div>
  );
}
