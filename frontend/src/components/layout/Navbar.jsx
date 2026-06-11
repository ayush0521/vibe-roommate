import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageCircle, Heart, Building2, Bell, Settings,
  LogOut, Moon, Sun, Menu, X, User, Video, ChevronDown,
  CheckCircle, ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

const studentLinks = [
  { to: '/matches', icon: Heart, label: 'Matches' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/listings', icon: Building2, label: 'Listings' },
  { to: '/meetings', icon: Video, label: 'Meetings' },
];

const ownerLinks = [
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/listings', icon: Building2, label: 'Listings' },
  { to: '/meetings', icon: Video, label: 'Meetings' },
];

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { isDark, toggleTheme, sidebarExpanded, toggleSidebar } = useTheme();
  const { unreadCount, notifications } = useNotifications();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (to) => location.pathname.startsWith(to);

  // Home links to /home (the dashboard page)
  const isHomeActive = location.pathname === '/home' || location.pathname === '/';
  const linksToRender = user?.role === 'owner' ? ownerLinks : studentLinks;
  const finalLinks = [...linksToRender];
  if (user?.role === 'admin') {
    finalLinks.push({ to: '/admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <>
      {/* ===== TOP HEADER BAR ===== */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 50,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Responsive Sidebar Toggle Button */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(!mobileOpen);
              } else {
                toggleSidebar();
              }
            }}
            className="p-2 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text cursor-pointer flex-center"
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(16,185,129,0.3)',
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>V</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>
              Vibe<span style={{ color: '#10b981' }}>Roommate</span>
            </span>
          </Link>
        </div>

        {/* Right side utility icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="btn btn-ghost btn-icon"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="btn btn-ghost btn-icon"
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: '#ef4444', color: 'white', borderRadius: '99px',
                  fontSize: '0.65rem', fontWeight: 700, minWidth: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px', border: '2px solid var(--color-surface)',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 16, boxShadow: 'var(--shadow-lg)', width: 320,
                    maxHeight: 400, overflowY: 'auto', zIndex: 200,
                  }}
                >
                  <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    <Link to="/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: '0.75rem', color: '#10b981', textDecoration: 'none' }}>See all</Link>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No notifications yet</div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div key={n._id} style={{
                        padding: '12px 16px',
                        background: n.isRead ? 'transparent' : 'rgba(16,185,129,0.04)',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                      }} onClick={() => { navigate(n.link || '/notifications'); setNotifOpen(false); }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{n.content}</div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px 6px 6px', borderRadius: 12,
                background: profileOpen ? 'var(--color-surface-2)' : 'transparent',
                border: '1.5px solid var(--color-border)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ position: 'relative' }}>
                {profile?.profilePhoto?.url ? (
                  <img src={profile.profilePhoto.url} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                      {profile?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                {profile?.verificationStatus === 'verified' && (
                  <CheckCircle size={12} style={{ position: 'absolute', bottom: -1, right: -1, color: '#10b981', background: 'var(--color-surface)', borderRadius: '50%' }} />
                )}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:inline">
                {profile?.fullName || 'Profile'}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 16, boxShadow: 'var(--shadow-lg)', width: 200, zIndex: 200,
                    overflow: 'hidden',
                  }}
                >
                  {[
                    { to: `/profile/${profile?._id}`, icon: User, label: 'My Profile' },
                    { to: '/settings', icon: Settings, label: 'Settings' },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} onClick={() => setProfileOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', textDecoration: 'none',
                      color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon size={16} style={{ color: 'var(--color-text-muted)' }} /> {label}
                    </Link>
                  ))}
                  <div style={{ height: 1, background: 'var(--color-border)' }} />
                  <button onClick={logout} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', width: '100%', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#ef4444', fontSize: '0.875rem', fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ===== COLLAPSIBLE LEFT SIDEBAR NAV ===== */}
      <aside style={{
        position: 'fixed', top: 64, left: 0, bottom: 0,
        zIndex: 40,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 10px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: sidebarExpanded ? 240 : 78,
      }}
        className={`hidden md:flex`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Home Tab */}
          <Link
            to="/home"
            style={{
              display: 'flex', alignItems: 'center', gap: sidebarExpanded ? 12 : 0,
              padding: '12px', borderRadius: 12,
              textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
              color: isHomeActive ? '#10b981' : 'var(--color-text-muted)',
              background: isHomeActive ? 'rgba(16,185,129,0.08)' : 'transparent',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              transition: 'all 0.2s',
            }}
            title="Home"
          >
            <Home size={18} />
            {sidebarExpanded && <span>Home</span>}
          </Link>

          {/* Other Navigation Tabs */}
          {finalLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: sidebarExpanded ? 12 : 0,
                padding: '12px', borderRadius: 12,
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
                color: isActive(to) ? '#10b981' : 'var(--color-text-muted)',
                background: isActive(to) ? 'rgba(16,185,129,0.08)' : 'transparent',
                justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                transition: 'all 0.2s',
              }}
              title={label}
            >
              <Icon size={18} />
              {sidebarExpanded && <span>{label}</span>}
            </Link>
          ))}
        </div>

        {/* Sidebar Footer (Collapse arrow / Settings shortcut) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link
            to="/settings"
            style={{
              display: 'flex', alignItems: 'center', gap: sidebarExpanded ? 12 : 0,
              padding: '12px', borderRadius: 12,
              textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
              color: isActive('/settings') ? '#10b981' : 'var(--color-text-muted)',
              background: isActive('/settings') ? 'rgba(16,185,129,0.08)' : 'transparent',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              transition: 'all 0.2s',
            }}
            title="Settings"
          >
            <Settings size={18} />
            {sidebarExpanded && <span>Settings</span>}
          </Link>
        </div>
      </aside>

      {/* ===== RESPONSIVE MOBILE NAVIGATION DRAWER DRAWER ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}
              className="md:hidden"
            />
            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, zIndex: 48,
                background: 'var(--color-surface)',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex', flexDirection: 'column',
                padding: '24px 16px',
              }}
              className="md:hidden"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                  Vibe<span style={{ color: '#10b981' }}>Roommate</span>
                </span>
                <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                <Link
                  to="/home"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12,
                    textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
                    color: isHomeActive ? '#10b981' : 'var(--color-text-muted)',
                    background: isHomeActive ? 'rgba(16,185,129,0.08)' : 'transparent',
                  }}
                >
                  <Home size={18} /> Home
                </Link>
                {finalLinks.map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to} to={to}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12,
                      textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
                      color: isActive(to) ? '#10b981' : 'var(--color-text-muted)',
                      background: isActive(to) ? 'rgba(16,185,129,0.08)' : 'transparent',
                    }}
                  >
                    <Icon size={18} /> {label}
                  </Link>
                ))}
                <div style={{ height: 1, background: 'var(--color-border)', margin: '12px 0' }} />
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12,
                    textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
                    color: isActive('/settings') ? '#10b981' : 'var(--color-text-muted)',
                    background: isActive('/settings') ? 'rgba(16,185,129,0.08)' : 'transparent',
                  }}
                >
                  <Settings size={18} /> Settings
                </Link>
              </div>

              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px', width: '100%',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444',
                  fontSize: '0.875rem', fontWeight: 600,
                }}
              >
                <LogOut size={18} /> Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
