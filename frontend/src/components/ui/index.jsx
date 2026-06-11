import { CheckCircle } from 'lucide-react';

const tagEmojis = {
  'Night Owl': '🦉', 'Early Bird': '🐦', 'Clean Planner': '✨',
  'Social Explorer': '🌟', 'Budget Saver': '💰', 'Study Focused': '📚',
  'Easy Going': '😎', 'Homebody': '🏠', 'Active Lifestyle': '💪', 'Balanced': '⚖️',
};

const tagColors = [
  'rgba(16,185,129,0.08)', 'rgba(139,92,246,0.08)', 'rgba(245,158,11,0.08)',
  'rgba(59,130,246,0.08)', 'rgba(236,72,153,0.08)',
];
const tagTextColors = ['#059669', '#7c3aed', '#d97706', '#2563eb', '#be185d'];

export const VerifiedBadge = ({ size = 'sm' }) => (
  <span className="badge badge-verified" style={{ fontSize: size === 'sm' ? '0.65rem' : '0.75rem' }}>
    <CheckCircle size={size === 'sm' ? 10 : 13} /> Verified Student
  </span>
);

export const PersonalityTag = ({ tag, index = 0 }) => {
  const emoji = tagEmojis[tag] || '🎯';
  const bg = tagColors[index % tagColors.length];
  const color = tagTextColors[index % tagTextColors.length];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: '99px',
      background: bg, color, fontSize: '0.75rem', fontWeight: 600,
      border: `1px solid ${color}22`,
    }}>
      {emoji} {tag}
    </span>
  );
};

export const Avatar = ({ src, name, size = 40, online = false, verified = false }) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    {src ? (
      <img src={src} alt={name} style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        border: '2px solid var(--color-border)',
      }} />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: size * 0.38,
        border: '2px solid var(--color-border)',
        flexShrink: 0,
      }}>
        {name?.[0]?.toUpperCase() || 'U'}
      </div>
    )}
    {online && <span className="online-dot" />}
    {verified && (
      <CheckCircle size={14} style={{
        position: 'absolute', bottom: -1, right: -1,
        color: '#10b981', background: 'white', borderRadius: '50%',
      }} />
    )}
  </div>
);

export const ScoreRing = ({ score }) => {
  const deg = (score / 100) * 360;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{
      width: 76, height: 76, borderRadius: '50%', position: 'relative',
      background: `conic-gradient(${color} ${deg}deg, var(--color-border) 0)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: 'var(--color-surface)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontWeight: 800, fontSize: '1rem', color, lineHeight: 1 }}>{score}%</span>
        <span style={{ fontSize: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>MATCH</span>
      </div>
    </div>
  );
};

export const CompatibilityBar = ({ label, score }) => {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{score}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
      </div>
    </div>
  );
};

export const FacilityChip = ({ facility }) => {
  const icons = {
    wifi: '📶', parking: '🅿️', laundry: '🫧', mess: '🍽️',
    water: '💧', security: '🔒', ac: '❄️', gym: '🏋️',
    cctv: '📹', 'power-backup': '⚡',
  };
  const labels = {
    wifi: 'WiFi', parking: 'Parking', laundry: 'Laundry', mess: 'Mess',
    water: 'Water', security: 'Security', ac: 'AC', gym: 'Gym',
    cctv: 'CCTV', 'power-backup': 'Power Backup',
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 99,
      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
      fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-text-muted)',
    }}>
      {icons[facility]} {labels[facility] || facility}
    </span>
  );
};

// ── Skeleton Components ────────────────────────────────────────────────────

const skeletonStyle = {
  background: 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-2) 50%, var(--color-surface) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
  borderRadius: 8,
};

export const Skeleton = ({ width = '100%', height = 16, borderRadius = 8, style = {} }) => (
  <div style={{ ...skeletonStyle, width, height, borderRadius, flexShrink: 0, ...style }} />
);

/** Match card skeleton — mirrors the real match card layout */
export const SkeletonCard = () => (
  <div style={{
    background: 'var(--color-surface)', borderRadius: 20, padding: 24,
    border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 16,
  }}>
    {/* Header row */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Skeleton width={56} height={56} borderRadius='50%' />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={160} height={11} />
          <Skeleton width={90}  height={10} />
        </div>
      </div>
      <Skeleton width={76} height={76} borderRadius='50%' />
    </div>
    {/* Tags */}
    <div style={{ display: 'flex', gap: 8 }}>
      <Skeleton width={80}  height={26} borderRadius={99} />
      <Skeleton width={100} height={26} borderRadius={99} />
      <Skeleton width={70}  height={26} borderRadius={99} />
    </div>
    {/* Highlights box */}
    <div style={{ background: 'var(--color-surface-2)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton width={120} height={10} />
      <Skeleton width='90%' height={10} />
      <Skeleton width='75%' height={10} />
      <Skeleton width='80%' height={10} />
    </div>
    {/* Action buttons */}
    <div style={{ display: 'flex', gap: 8 }}>
      <Skeleton width='50%' height={38} borderRadius={10} />
      <Skeleton width='50%' height={38} borderRadius={10} />
    </div>
  </div>
);

/** Listing card skeleton */
export const SkeletonListingCard = () => (
  <div style={{
    background: 'var(--color-surface)', borderRadius: 20, overflow: 'hidden',
    border: '1.5px solid var(--color-border)',
  }}>
    <Skeleton width='100%' height={180} borderRadius={0} />
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width='80%' height={16} />
      <Skeleton width='50%' height={12} />
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <Skeleton width={60} height={22} borderRadius={99} />
        <Skeleton width={70} height={22} borderRadius={99} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <Skeleton width={80} height={20} />
        <Skeleton width={100} height={34} borderRadius={10} />
      </div>
    </div>
  </div>
);

/** Full profile page skeleton */
export const SkeletonProfile = () => (
  <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ background: 'var(--color-surface)', borderRadius: 24, padding: 32, border: '1.5px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <Skeleton width={96} height={96} borderRadius='50%' />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton width='60%' height={20} />
          <Skeleton width='40%' height={13} />
          <Skeleton width='30%' height={13} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton width='100%' height={12} />
        <Skeleton width='90%'  height={12} />
        <Skeleton width='70%'  height={12} />
      </div>
    </div>
    <div style={{ background: 'var(--color-surface)', borderRadius: 24, padding: 32, border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width={140} height={14} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[80, 110, 90, 100, 70].map((w, i) => (
          <Skeleton key={i} width={w} height={28} borderRadius={99} />
        ))}
      </div>
    </div>
  </div>
);

/** Notification row skeleton */
export const SkeletonNotification = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
    <Skeleton width={44} height={44} borderRadius='50%' />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Skeleton width='70%' height={12} />
      <Skeleton width='40%' height={10} />
    </div>
  </div>
);

export { default as SafetyCheckinModal } from './SafetyCheckinModal';

