import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Building2, ShieldAlert, Crown, Search, Check,
  X, Trash2, ArrowLeft, Loader2, RefreshCw, UserX, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/ui';

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, pendingReports: 0, premiumUsers: 0 });
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & filter
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'reports'

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  
  const [reportPage, setReportPage] = useState(1);
  const [reportTotalPages, setReportTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 8, search: userSearch });
      setUsers(data.data || []);
      setUserTotalPages(data.totalPages || 1);
      setUserPage(page);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchReports = async (page = 1) => {
    try {
      const { data } = await adminAPI.getReports({ page, limit: 8, status: 'pending' });
      setReports(data.data || []);
      setReportTotalPages(data.totalPages || 1);
      setReportPage(page);
    } catch (err) {
      toast.error('Failed to fetch reports');
    }
  };

  const loadAllData = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchUsers(1), fetchReports(1)]);
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) fetchUsers(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await adminAPI.toggleActive(id);
      toast.success(`User account ${currentStatus ? 'deactivated' : 'activated'}!`);
      fetchUsers(userPage);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleTogglePremium = async (id) => {
    try {
      await adminAPI.makePremium(id);
      toast.success('Premium status updated!');
      fetchStats();
      fetchUsers(userPage);
    } catch (err) {
      toast.error('Failed to update premium status');
    }
  };

  const handleResolveReport = async (id, action) => {
    try {
      await adminAPI.resolveReport(id, { status: action });
      toast.success(`Report resolved as ${action}!`);
      fetchStats();
      fetchReports(reportPage);
    } catch (err) {
      toast.error('Failed to resolve report');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteListing(id);
      toast.success('Listing deleted!');
      fetchStats();
      fetchUsers(userPage);
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '96px 16px 64px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', alignSelf: 'flex-start', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))',
              border: '1.5px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={26} style={{ color: '#10b981' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.5px' }}>Admin Dashboard</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Monitor roommate statistics, verify student files, and resolve reports.</p>
            </div>
          </div>
          <button
            onClick={loadAllData}
            disabled={refreshing}
            className="btn btn-secondary font-bold text-xs flex items-center gap-1.5"
            style={{ borderRadius: 10, padding: '10px 18px' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* === STATS BAR === */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { label: 'Total Registrations', val: stats.totalUsers, icon: <Users size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Premium Accounts', val: stats.premiumUsers, icon: <Crown size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Active Listings', val: stats.totalListings, icon: <Building2 size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Pending Reports', val: stats.pendingReports, icon: <ShieldAlert size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          ].map((card, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)', borderRadius: 20, padding: '24px',
              border: '1.5px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: 18
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-text)', margin: '4px 0 0', lineHeight: 1 }}>{card.val}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* === TABS PANEL === */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 2 }}>
          {[
            { id: 'users', label: 'Registered Users', icon: <Users size={16} /> },
            { id: 'reports', label: `Pending Reports (${stats.pendingReports})`, icon: <ShieldAlert size={16} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                border: 'none', background: 'none', fontSize: '0.85rem', fontWeight: 700,
                color: activeTab === t.id ? '#10b981' : 'var(--color-text-muted)',
                borderBottom: activeTab === t.id ? '2px solid #10b981' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s', paddingBottom: 12
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* === CONTENT PANELS === */}
        <div className="glass-card p-6 border border-border" style={{ borderRadius: 24 }}>
          {activeTab === 'users' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Search user bar */}
              <div style={{ position: 'relative', maxWidth: 360 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search user profile name..."
                  style={{
                    width: '100%', padding: '9px 12px 9px 36px', borderRadius: 12,
                    background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)',
                    color: 'var(--color-text)', fontSize: '0.8rem', outline: 'none'
                  }}
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 800 }}>
                      <th style={{ padding: '12px 16px' }}>Student</th>
                      <th style={{ padding: '12px 16px' }}>Email</th>
                      <th style={{ padding: '12px 16px' }}>College / City</th>
                      <th style={{ padding: '12px 16px' }}>Role</th>
                      <th style={{ padding: '12px 16px' }}>Premium</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                        <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar src={u.profilePhoto?.url} name={u.fullName} size={34} />
                          <span style={{ fontWeight: 700 }}>{u.fullName || 'Uncompleted Setup'}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>{u.authId?.email || 'N/A'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{u.college || '—'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{u.city || '—'}</div>
                        </td>
                        <td style={{ padding: '14px 16px', textTransform: 'capitalize', fontWeight: 600 }}>{u.authId?.role || 'N/A'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 800,
                            background: u.authId?.isPremium ? 'rgba(245,158,11,0.12)' : 'rgba(107,114,128,0.1)',
                            color: u.authId?.isPremium ? '#d97706' : 'var(--color-text-muted)',
                            border: `1px solid ${u.authId?.isPremium ? 'rgba(245,158,11,0.2)' : 'transparent'}`
                          }}>
                            {u.authId?.isPremium ? '★ Premium' : 'Free'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 800,
                            background: u.authId?.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: u.authId?.isActive ? '#059669' : '#ef4444'
                          }}>
                            {u.authId?.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleTogglePremium(u._id)}
                              className="btn btn-ghost"
                              style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                              title="Toggle Premium Role"
                            >
                              👑
                            </button>
                            <button
                              onClick={() => handleToggleActive(u._id, u.authId?.isActive)}
                              className="btn btn-ghost"
                              style={{
                                padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700,
                                color: u.authId?.isActive ? '#ef4444' : '#10b981'
                              }}
                            >
                              {u.authId?.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          No registered users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* User Pagination controls */}
              {userTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                  <button
                    disabled={userPage === 1}
                    onClick={() => fetchUsers(userPage - 1)}
                    className="btn btn-secondary text-xs font-bold py-2"
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700, padding: '0 8px' }}>
                    Page {userPage} of {userTotalPages}
                  </span>
                  <button
                    disabled={userPage === userTotalPages}
                    onClick={() => fetchUsers(userPage + 1)}
                    className="btn btn-secondary text-xs font-bold py-2"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Reports Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 800 }}>
                      <th style={{ padding: '12px 16px' }}>Reported By</th>
                      <th style={{ padding: '12px 16px' }}>Target Type</th>
                      <th style={{ padding: '12px 16px' }}>Target ID</th>
                      <th style={{ padding: '12px 16px' }}>Reason</th>
                      <th style={{ padding: '12px 16px' }}>Description</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r._id} style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                          {r.reportedBy?.fullName || 'Anonymous User'}
                        </td>
                        <td style={{ padding: '14px 16px', textTransform: 'uppercase', fontWeight: 800, color: r.targetType === 'listing' ? '#3b82f6' : '#10b981' }}>
                          {r.targetType}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {r.targetId}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, textTransform: 'capitalize' }}>
                          {r.reason?.replace('-', ' ')}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.description}>
                          {r.description || 'No notes provided'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {r.targetType === 'listing' && (
                              <button
                                onClick={() => handleDeleteListing(r.targetId)}
                                className="btn btn-ghost"
                                style={{ padding: '6px 10px', color: '#ef4444' }}
                                title="Delete reported listing"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleResolveReport(r._id, 'dismissed')}
                              className="btn btn-ghost"
                              style={{ padding: '6px 10px', color: '#6b7280' }}
                              title="Dismiss Report"
                            >
                              <X size={14} />
                            </button>
                            <button
                              onClick={() => handleResolveReport(r._id, 'resolved')}
                              className="btn btn-ghost"
                              style={{ padding: '6px 10px', color: '#10b981' }}
                              title="Mark Resolved"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          No pending reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Report Pagination controls */}
              {reportTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                  <button
                    disabled={reportPage === 1}
                    onClick={() => fetchReports(reportPage - 1)}
                    className="btn btn-secondary text-xs font-bold py-2"
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700, padding: '0 8px' }}>
                    Page {reportPage} of {reportTotalPages}
                  </span>
                  <button
                    disabled={reportPage === reportTotalPages}
                    onClick={() => fetchReports(reportPage + 1)}
                    className="btn btn-secondary text-xs font-bold py-2"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
