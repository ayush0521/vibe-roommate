import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Building2, MessageCircle, Calendar, ShieldCheck, Zap,
  ChevronRight, ArrowRight, Star, GraduationCap, Moon, Sun,
  Mail, Phone, MapPin
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? 'dark' : 'light';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const features = [
    {
      icon: <Users size={24} />,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
      title: 'AI Compatibility Match',
      desc: 'Take our 10-question behavioral quiz. Get matched based on sleep habits, cleanliness, and social vibe.'
    },
    {
      icon: <Building2 size={24} />,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.1)',
      title: 'Campus-Near Housing',
      desc: 'Browse rooms, hostels, PGs, and flats right near college campuses, with distance filters and direct owner contact.'
    },
    {
      icon: <MessageCircle size={24} />,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
      title: 'Real-Time Chat',
      desc: 'Chat with matches directly inside the app. WhatsApp-style, clean, fast, and secure.'
    },
    {
      icon: <Calendar size={24} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      title: 'Google Meet Scheduling',
      desc: 'Schedule a quick 1-on-1 virtual video call to sync up before making roommates official.'
    },
  ];

  return (
    <div className="min-h-screen gradient-hero overflow-x-hidden">

      {/* ===== PREMIUM HEADER ===== */}
      <header style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 1px 24px rgba(0,0,0,0.04)',
          background: 'var(--color-surface)',
          padding: '0',
        }}
      >
        <div className="container" style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: -8, right: -8, width: 20, height: 20,
                borderRadius: '50%', background: 'rgba(255,255,255,0.25)'
              }} />
              <span style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.5px', position: 'relative' }}>VR</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.5px', color: 'var(--color-text)' }}>
              Vibe<span style={{ color: '#10b981' }}>Roommate</span>
            </div>
          </Link>

          {/* Nav Links — Desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/listings" style={{
              padding: '6px 14px', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem',
              color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.target.style.background = 'var(--color-surface-2)'; e.target.style.color = 'var(--color-text)'; }}
              onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--color-text-muted)'; }}
            >
              Browse PGs
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{
                width: 38, height: 38, borderRadius: 10, border: '1.5px solid var(--color-border)',
                background: 'var(--color-surface)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-muted)', transition: 'all 0.2s',
                marginLeft: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link to="/login" style={{
              padding: '7px 16px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
              color: 'var(--color-text)', textDecoration: 'none',
              border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
              transition: 'all 0.2s', marginLeft: 4,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              Login
            </Link>

            <Link to="/register" style={{
              padding: '7px 18px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              marginLeft: 4,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.35)'; }}
            >
              Get Started <ChevronRight size={15} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Pill badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              color: '#059669', padding: '6px 14px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700,
              boxShadow: '0 2px 8px rgba(16,185,129,0.1)'
            }}>
              <GraduationCap size={14} /> Smart Student Roommate Finder & Housing Platform
            </div>

            <h1 style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-1.5px', color: 'var(--color-text)', margin: 0 }}>
              Find Your Perfect <br />
              <span style={{
                background: 'linear-gradient(135deg, #10b981, #059669 50%, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>Roommate & Room</span><br />
              Without the Hassle.
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
              Match with compatible students from engineering, medical, and management colleges. Find verified PGs, flats, and hostels near your campus.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                borderRadius: 14, fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                boxShadow: '0 6px 24px rgba(16,185,129,0.4)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(16,185,129,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(16,185,129,0.4)'; }}
              >
                Find Roommates Now <ArrowRight size={18} />
              </Link>
              <Link to="/listings" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                borderRadius: 14, fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                background: 'var(--color-surface)', color: 'var(--color-text)',
                border: '1.5px solid var(--color-border)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                Browse Nearby PG/Flats
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingTop: 24, marginTop: 8, borderTop: '1px solid var(--color-border)' }}>
              {[
                { val: '98%', label: 'Success Match Rate' },
                { val: '5+', label: 'Nanded Colleges Covered' },
                { val: '200+', label: 'Verified Listings' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, #10b981, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.val}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Visual Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div style={{ position: 'absolute', width: 280, height: 280, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', filter: 'blur(60px)', top: -20, left: -20, zIndex: 0 }} />
            <div style={{ position: 'absolute', width: 280, height: 280, background: 'rgba(139,92,246,0.12)', borderRadius: '50%', filter: 'blur(60px)', bottom: -20, right: -20, zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Match Card */}
              <motion.div
                whileHover={{ scale: 1.04, rotate: 0 }}
                initial={{ rotate: -2 }}
                style={{
                  background: 'var(--color-surface)', borderRadius: 18, padding: '16px 18px',
                  border: '1.5px solid var(--color-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'default',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(16,185,129,0.2)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>O</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)' }}>Om Patre</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(16,185,129,0.25)' }}>94% Match</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 3 }}>MGM College, Nanded • CSE • 2nd Year</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>✨ Clean Planner</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.1)', color: '#7c3aed', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>📚 Study Focused</span>
                  </div>
                </div>
              </motion.div>

              {/* Listing Card */}
              <motion.div
                whileHover={{ scale: 1.04, rotate: 0 }}
                initial={{ rotate: 1.5 }}
                style={{
                  background: 'var(--color-surface)', borderRadius: 18, padding: '16px 18px',
                  border: '1.5px solid var(--color-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.2)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                <div style={{ width: 60, height: 60, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem', textAlign: 'center', padding: 4 }}>Cidco PG</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-text)' }}>Shree Boys PG</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981' }}>₹4,200/mo</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 3 }}>Cidco, Nanded • Single/Double Occupancy</p>
                  <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
                    <span style={{ fontSize: '0.65rem', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: 99 }}>📶 WiFi</span>
                    <span style={{ fontSize: '0.65rem', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: 99 }}>🍽️ Mess</span>
                  </div>
                </div>
              </motion.div>

              {/* Chat Card */}
              <motion.div
                whileHover={{ scale: 1.04, rotate: 0 }}
                initial={{ rotate: -1 }}
                style={{
                  background: 'var(--color-surface)', borderRadius: 18, padding: '14px 18px',
                  border: '1.5px solid rgba(16,185,129,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'default',
                  borderLeft: '4px solid #10b981', alignSelf: 'flex-end', width: '80%',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(16,185,129,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>R</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>Rohit Deshmukh</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>"Hey! Are you a late-night studier? I study till 2 AM usually."</p>
                </div>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section style={{ padding: '80px 0', background: 'rgba(255,255,255,0.4)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: 12 }}>How VibeRoommate Solves Student Housing</h2>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>Finding a roommate and a home shouldn't feel like a lottery. We bring trust, compatibility, and real-time connectivity to Nanded's student community.</p>
        </div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04, y: -6 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--color-surface)', borderRadius: 20, padding: '28px 24px',
                border: '1.5px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column', gap: 14, cursor: 'default',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 40px ${f.color}25`; e.currentTarget.style.borderColor = `${f.color}40`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 14, background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${f.color}20` }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>{f.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SAFETY SECTION ===== */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>Safety and Verification First</h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0 }}>
              We know safety is a priority, especially when moving to a new city. VibeRoommate provides multiple verification layers:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  title: 'College Email Verification (.ac.in / .edu)',
                  desc: 'Use your MGM, SGGS, or any college email to get instantly verified. Supports .ac.in, .edu, and other college domains.'
                },
                {
                  title: 'Manual ID Upload Verification',
                  desc: 'No official email? Upload your college ID card or fee receipt. Our team manually reviews within 24 hours.'
                },
                {
                  title: 'Owner Verification via ID + OpenStreetMap',
                  desc: 'Property owners verify via government ID and location pinning on OpenStreetMap — no paid APIs, fully transparent.'
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)', margin: '0 0 4px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Algorithm Box */}
          <div style={{ background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)', borderRadius: 24, padding: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Zap style={{ color: '#f59e0b' }} size={20} /> Smart Match Algorithm
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0 }}>
              Our matching engine filters by gender, smoking/drinking tolerance, and budget, then scores dynamically:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Cleanliness', pct: '15%', note: 'Chores & organization' },
                { label: 'Sleep Schedule', pct: '15%', note: 'Night Owls vs Early Birds' },
                { label: 'Study Habits', pct: '15%', note: 'Quiet vs collaborative' },
                { label: 'Social Vibe', pct: '10%', note: 'Guests & social energy' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--color-surface)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--color-text)' }}>{s.label} <span style={{ color: '#10b981' }}>({s.pct})</span></div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', padding: '48px 0 32px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>VR</div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)' }}>VibeRoommate</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.7, maxWidth: 240 }}>
              Built with ❤️ and trust for Nanded's student community. Finding the right roommate changes everything.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--color-text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Links</h5>
            {['Browse PGs', 'Find Roommates', 'Login', 'Register'].map(l => (
              <div key={l} style={{ marginBottom: 8 }}>
                <Link to={l === 'Browse PGs' ? '/listings' : l === 'Find Roommates' ? '/register' : `/${l.toLowerCase()}`}
                  style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = '#10b981'}
                  onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
                >{l}</Link>
              </div>
            ))}
          </div>

          {/* Support */}
          <div>
            <h5 style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--color-text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Support & Contact</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="mailto:support@vibeRoommate.in" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <Mail size={14} /> support@vibeRoommate.in
              </a>
              <a href="tel:+917887654321" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <Phone size={14} /> +91 78876 54321
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <MapPin size={14} /> Nanded, Maharashtra, India
              </div>
              <div style={{ marginTop: 6, padding: '8px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, display: 'inline-block' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669' }}>🕐 Support Hours: 9 AM – 9 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
            © {new Date().getFullYear()} VibeRoommate. Built with love &amp; trust for Indian College Students. 🇮🇳
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Use',   to: '/terms' },
              { label: 'Help Center',    to: '/help' },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={(e) => e.target.style.color = '#10b981'}
                onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
              >{label}</Link>
            ))}
          </div>

        </div>
      </footer>
    </div>
  );
}
