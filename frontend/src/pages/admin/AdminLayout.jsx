import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Pill, FolderTree, PackageCheck, ShoppingBag, Users,
  BarChart3, FileSpreadsheet, Settings, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, Bell, Search, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';
import './AdminLayout.css';

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Medicines', path: '/admin/products', icon: Pill },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Inventory', path: '/admin/inventory', icon: PackageCheck },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Get current active title
  const activeMenu = menuItems.find(m => location.pathname.startsWith(m.path));
  const pageTitle = activeMenu ? activeMenu.label : 'Admin Portal';

  return (
    <div className="admin-layout-root">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo-group">
            <img src="/sanjeevani_symbol.png" alt="Logo" className="admin-sidebar-logo-img" />
            {!isCollapsed && (
              <span className="admin-sidebar-brand-name">
                Sanjeevani <span style={{ color: '#38bdf8', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Admin Portal</span>
              </span>
            )}
          </div>
          <button
            className="admin-toggle-sidebar-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5' }}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`admin-main-container ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-page-title">{pageTitle}</h1>
          </div>

          <div className="admin-header-right">
            <a
              href="/dashboard"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#059669',
                background: '#ecfdf5',
                padding: '0.4rem 0.8rem',
                borderRadius: '0.6rem',
                border: '1px solid #a7f3d0',
                textDecoration: 'none'
              }}
            >
              <span>View Customer Store</span>
              <ExternalLink size={14} />
            </a>

            <div className="admin-profile-pill">
              <div className="admin-avatar">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  {user?.fullName || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ShieldCheck size={11} />
                  <span>SYSTEM ADMIN</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-body-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
