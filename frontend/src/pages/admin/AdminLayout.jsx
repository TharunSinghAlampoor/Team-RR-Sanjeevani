import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Pill, FolderTree, PackageCheck, ShoppingBag, Users,
  BarChart3, FileSpreadsheet, Settings, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, ExternalLink, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

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

  const activeMenu = menuItems.find(m => location.pathname.startsWith(m.path));
  const pageTitle = activeMenu ? activeMenu.label : 'Admin Portal';

  return (
    <div className="admin-layout-root">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo-group">
            <img src="/sanjeevani_symbol.png" alt="Logo" className="admin-sidebar-logo-img" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="admin-sidebar-brand-name">
                Sanjeevani <span style={{ color: '#38bdf8', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Admin Portal</span>
              </span>
            )}
          </div>
          <button
            className="admin-toggle-sidebar-btn desktop-only"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            className="admin-toggle-sidebar-btn mobile-only"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
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
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon />
                {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5' }}
            title={isCollapsed && !isMobileOpen ? 'Sign Out' : undefined}
          >
            <LogOut size={20} />
            {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`admin-main-container ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-hamburger-btn"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="admin-page-title">{pageTitle}</h1>
          </div>

          <div className="admin-header-right">
            <a
              href="/dashboard"
              target="_blank"
              rel="noreferrer"
              className="admin-store-link"
            >
              <span className="store-link-text">Customer Store</span>
              <ExternalLink size={14} />
            </a>

            <div className="admin-profile-pill">
              <div className="admin-avatar">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="admin-user-info">
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  {user?.fullName || 'Admin'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
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
