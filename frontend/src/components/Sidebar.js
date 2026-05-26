import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── MITS Logo SVG (placeholder — swap src with mits_logo.png) ── */
function MITSLogo({ size = 36 }) {
  return (
    <img
      src="/mits_logo.png"
      alt="MITS Logo"
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4 }}
      onError={e => {
        // Fallback if logo not found
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
}

const navItems = {
  admin: [
    { to: '/admin',          icon: '▦',  label: 'Overview'    },
    { to: '/admin/trainers', icon: '👥', label: 'Trainers'    },
    { to: '/admin/schedule', icon: '📅', label: 'Schedules'   },
    { to: '/admin/sheets',   icon: '📊', label: 'Sheets Sync' },
  ],
  employee: [
    { to: '/dashboard',         icon: '▦',  label: 'My Slots' },
    { to: '/dashboard/history', icon: '📅', label: 'History'  },
  ],
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  return (
    <>
      {/* Mobile top bar */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          .mobile-nav { display: none !important; }
        }
        .nav-link-item { transition: all 0.15s ease; }
        .nav-link-item:hover { background: rgba(255,255,255,0.06) !important; color: #e2e8f0 !important; }
        .logout-btn:hover { color: #f87171 !important; background: rgba(239,68,68,0.08) !important; }
      `}</style>

      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar-desktop" style={{
        width: collapsed ? 64 : 220,
        minHeight: '100vh',
        background: '#090909',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Header / Logo */}
        <div style={{
          padding: collapsed ? '18px 0' : '18px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <MITSLogo size={32} />
              {/* Fallback text logo */}
              <div style={{
                display: 'none', width: 32, height: 32,
                background: '#fff', borderRadius: 6,
                alignItems: 'center', justifyContent: 'center',
                color: '#000', fontWeight: 900, fontSize: 12, flexShrink: 0,
              }}>M</div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                TrainerTrack
              </span>
            </div>
          )}
          {collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/mits_logo.png" alt="MITS" style={{ width: 28, height: 28, objectFit: 'contain' }}
                onError={e => { e.target.style.background = '#fff'; e.target.style.borderRadius = '4px'; }} />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#666',
              cursor: 'pointer',
              fontSize: 14,
              padding: '3px 7px',
              lineHeight: 1,
              borderRadius: 5,
              flexShrink: 0,
            }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* User badge */}
        {!collapsed && (
          <div style={{
            margin: '10px 10px 4px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ color: '#888', fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {user?.role}
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/dashboard'}
              className="nav-link-item"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '11px 0' : '9px 12px',
                borderRadius: 7,
                textDecoration: 'none',
                color: isActive ? '#fff' : '#555',
                background: isActive ? 'rgba(255,255,255,0.09)' : 'transparent',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                justifyContent: collapsed ? 'center' : 'flex-start',
                whiteSpace: 'nowrap',
                borderLeft: isActive ? '2px solid #fff' : '2px solid transparent',
              })}
            >
              <span style={{ fontSize: collapsed ? 17 : 14, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            className="logout-btn"
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '11px 0' : '9px 12px',
              borderRadius: 7,
              background: 'none',
              border: 'none',
              color: '#444',
              cursor: 'pointer',
              fontSize: 13,
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: collapsed ? 17 : 14 }}>⎋</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="mobile-topbar" style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 56,
        background: '#090909',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/mits_logo.png" alt="MITS" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>TrainerTrack</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#666', fontSize: 11, textTransform: 'uppercase' }}>{user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#888', padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-nav" style={{
        display: 'none',
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: '#090909',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '8px 0 12px',
        justifyContent: 'space-around',
        zIndex: 100,
      }}>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              color: isActive ? '#fff' : '#444',
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              padding: '4px 12px',
            })}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
