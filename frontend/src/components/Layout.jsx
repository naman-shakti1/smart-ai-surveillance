import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { alertAPI, healthAPI } from '../services/api'
import {
  LayoutDashboard, Camera, Bell, Car, Activity,
  LogOut, Shield, ChevronLeft, ChevronRight,
  BarChart2
} from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cameras', icon: Camera, label: 'Cameras' },
  { to: '/tracking', icon: Activity, label: 'Tracking' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/stats', icon: BarChart2, label: 'Analytics' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const [sysOnline, setSysOnline] = useState(true)
  const [streamCount, setStreamCount] = useState(0)

  useEffect(() => {
    const poll = async () => {
      try {
        const [ac, hc] = await Promise.all([alertAPI.count(), healthAPI.check()])
        setAlertCount(ac.data.unacknowledged)
        setSysOnline(true)
        setStreamCount(hc.data.streaming_cams?.length ?? 0)
      } catch {
        setSysOnline(false)
      }
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar${collapsed ? ' collapsed' : ''}`}
        style={{
          width: collapsed ? 60 : 232,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          overflow: 'hidden',
        }}
      >
        <div className="sidebar-logo">
          <Shield size={23} color="#f97316" style={{ flexShrink: 0 }} />
          {!collapsed && (
            <div className="sidebar-logo-text">
              SENTINEL AI
              <span>Surveillance operations</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div style={{
            padding: '11px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}>
            <span
              className="live-dot"
              style={{
                background: sysOnline ? '#10b981' : '#ef4444',
                boxShadow: sysOnline ? '0 0 7px #10b981' : 'none',
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
              {sysOnline ? `System online · ${streamCount} streaming` : 'Backend offline'}
            </span>
          </div>
        )}

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
              {label === 'Alerts' && alertCount > 0 && !collapsed && (
                <span className="nav-badge">{alertCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(value => !value)}
          className="btn btn-ghost"
          style={{ margin: 8, justifyContent: 'center', padding: 8 }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-user">
              <div className="sidebar-user-name">{user?.username}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{user?.email}</div>
              <div className="sidebar-user-role">OPERATOR</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <LogOut size={15} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
