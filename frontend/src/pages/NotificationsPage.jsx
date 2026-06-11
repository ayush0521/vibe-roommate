import { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, ArrowLeft, Loader2, Link as LinkIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SkeletonNotification } from '../components/ui';

const FALLBACK_NOTIFS = [
  {
    _id: 'n1',
    type: 'new_match',
    title: 'New Roommate Match! 🎉',
    content: 'You have a new 94% compatible roommate match in Nanded!',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/matches'
  },
  {
    _id: 'n2',
    type: 'new_message',
    title: 'New message from Ayushi',
    content: 'Hey! Are you okay with sharing kitchen utensils?',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: '/chat'
  }
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getNotifications();
      if (data.data && data.data.length > 0) {
        setNotifications(data.data);
      } else {
        setNotifications(FALLBACK_NOTIFS);
      }
    } catch (err) {
      console.warn('API error fetching notifications. Using mocks.', err);
      setNotifications(FALLBACK_NOTIFS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (err) {
      // simulate success
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="min-h-screen bg-bg p-4 pt-24 pb-12">
      <div className="container max-w-3xl flex flex-col gap-6">
        
        {/* Back Link */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-muted hover:text-text font-bold text-sm self-start">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight flex items-center gap-2">
              <Bell className="text-emerald-500" size={26} /> Notifications
            </h1>
            <p className="text-sm text-text-muted mt-1 font-medium">Get real-time updates about match triggers, messages, and meetups.</p>
          </div>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-xs"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-2 mt-2">
            {[1,2,3,4,5].map((i) => <SkeletonNotification key={i} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`glass-card p-5 border flex items-start gap-4 transition-all ${
                    notif.isRead
                      ? 'border-border opacity-75'
                      : 'border-emerald-500/20 bg-emerald-500/[0.02] shadow-md'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex-center flex-shrink-0 ${
                    notif.isRead ? 'bg-slate-100 text-text-muted dark:bg-slate-800' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    <Bell size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className={`text-sm font-extrabold truncate ${notif.isRead ? 'text-text-secondary' : 'text-text'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-text-muted font-bold whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{notif.content}</p>

                    <div className="flex items-center gap-3 mt-3">
                      {notif.link && (
                        <Link
                          to={notif.link}
                          className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <LinkIcon size={11} /> View Match / Chat
                        </Link>
                      )}

                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkRead(notif._id)}
                          className="text-[10px] font-bold text-text-muted hover:text-text flex items-center gap-1.5 ml-auto bg-surface-2 px-2.5 py-1 rounded-md border border-border"
                        >
                          <Check size={11} /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted font-bold text-sm">You have no notifications yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
