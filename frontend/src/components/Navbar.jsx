import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Heart, ShoppingCart, Truck, LogOut, Key,
  X, Home, LayoutGrid, ChevronDown, UserCheck, ShieldCheck,
  User, MapPin, Package, Bot, Edit3
} from 'lucide-react';
import { formatCategoryName, toCategorySlug } from '../utils/categoryUtils';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

import ProfileSidebar from './ProfileSidebar';

export const Navbar = ({
  user,
  cartCount = 0,
  favoriteCount = 0,
  searchQuery = '',
  onSearchChange,
  onOpenCart,
  onOpenFavorites,
  onOpenOrders,
  onOpenChatbot,
  onOpenProfile,
  onLogout,
  categories = [],
}) => {
  const { t, translateData } = useLanguage();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isInternalProfileOpen, setIsInternalProfileOpen] = useState(false);

  const handleTriggerProfile = () => {
    if (typeof onOpenProfile === 'function') {
      onOpenProfile();
    } else {
      setIsInternalProfileOpen(true);
    }
  };
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
  const isAdmin = user?.role === 'ADMIN';

  // Ensure dark class is removed on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    localStorage.removeItem('sanjeevani_theme');
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick, { passive: true });
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCategoryClick = (e, catName, catId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowCategoriesDropdown(false);
    const slug = toCategorySlug(catName || catId);
    navigate(`/category/${slug}`);
  };

  return (
    <motion.header
      className="medical-navbar"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="navbar-container">

        {/* ── Brand Logo ─────────────────────────────────── */}
        <div
          className="navbar-brand"
          onClick={() => { navigate('/dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <div className="brand-logo-wrap">
            <img src="/sanjeevani_symbol.png" alt="Sanjeevani" className="brand-logo-img" />
          </div>
          <img
            src="/sanjeevani_text_transparent.png"
            alt="Sanjeevani"
            style={{ height: 46, width: 'auto', objectFit: 'contain', display: 'block' }}
            className="brand-text-img"
          />
        </div>

        {/* ── Search Bar ─────────────────────────────────── */}
        <div className="navbar-search-wrapper">
          <form onSubmit={(e) => e.preventDefault()} className="search-input-group" role="search">
            <Search className="search-icon" style={{ width: 18, height: 18 }} />
            <input
              type="search"
              className="search-input"
              placeholder="Search medicines, health products, devices..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search products"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="clear-search"
                aria-label="Clear search"
              >
                <X style={{ width: 15, height: 15 }} />
              </button>
            )}
          </form>
        </div>

        {/* ── Right Actions ─────────────────────────────── */}
        <div className="navbar-actions">

          {/* Home */}
          <button
            onClick={() => {
              navigate('/dashboard');
              const el = document.getElementById('offers-hero-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="action-btn"
            title="Home (Offers & Banners)"
          >
            <Home style={{ width: 20, height: 20, color: '#059669' }} />
          </button>

          {/* Categories */}
          <div style={{ position: 'relative' }} onMouseLeave={() => setShowCategoriesDropdown(false)}>
            <button
              className="action-btn cat-action-btn"
              onMouseEnter={() => setShowCategoriesDropdown(true)}
              onClick={() => setShowCategoriesDropdown(v => !v)}
              title="Categories"
              style={{ padding: '0.4rem 0.75rem', borderRadius: '9999px', background: '#ECFDF5', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LayoutGrid style={{ width: 18, height: 18, color: '#059669' }} />
              <span className="nav-cat-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>{t('categories') || translateData('Categories')}</span>
              <ChevronDown
                className="nav-cat-chevron"
                style={{
                  width: 14, height: 14, color: '#059669',
                  transition: 'transform 0.2s',
                  transform: showCategoriesDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>

            <AnimatePresence>
              {showCategoriesDropdown && categories.length > 0 && (
                <motion.div
                  className="navbar-cat-dropdown"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  {categories.map(cat => (
                    <button
                      key={cat.categoryId}
                      onClick={(e) => handleCategoryClick(e, cat.categoryName, cat.categoryId)}
                      className="navbar-cat-item"
                    >
                      {formatCategoryName(cat.categoryName)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wishlist */}
          <motion.button
            onClick={onOpenFavorites}
            className="action-btn"
            title="My Wishlist"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{ position: 'relative' }}
          >
            <Heart style={{ width: 22, height: 22, color: '#f43f5e' }} />
            <AnimatePresence>
              {favoriteCount > 0 && (
                <motion.span
                  key={favoriteCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  style={{
                    position: 'absolute', top: -3, right: -3,
                    background: '#f43f5e', color: '#fff',
                    fontSize: 9, fontWeight: 900,
                    minWidth: 17, height: 17, borderRadius: 99,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(244,63,94,0.4)',
                    border: '1.5px solid #fff'
                  }}
                >
                  {favoriteCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* My Cart (Shopping Cart 🛒) */}
          <motion.button
            onClick={onOpenCart}
            className="action-btn"
            title="My Cart (Items & Checkout)"
            aria-label="My Cart"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{ position: 'relative' }}
          >
            <ShoppingCart style={{ width: 22, height: 22, color: '#059669' }} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  style={{
                    position: 'absolute', top: -3, right: -3,
                    background: '#059669', color: '#fff',
                    fontSize: 9, fontWeight: 900,
                    minWidth: 17, height: 17, borderRadius: 99,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(5,150,105,0.4)',
                    border: '1.5px solid #fff'
                  }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* My Orders (Delivery Truck 🚚) */}
          <motion.button
            onClick={onOpenOrders}
            className="action-btn"
            title="My Orders & Delivery Tracking"
            aria-label="My Orders"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{ position: 'relative' }}
          >
            <Truck style={{ width: 22, height: 22, color: '#6366f1' }} />
          </motion.button>

          {/* Language Selector Dropdown (EN, Hindi, Telugu, Kannada) */}
          <LanguageSelector />

          {/* ── User Profile Pill ─────────────── */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileDropdown(false);
                handleTriggerProfile();
              }}
              className="profile-avatar-btn"
              title="Open Profile Sidebar"
            >
              {/* Avatar circle */}
              <div className="nav-user-avatar">{userInitial}</div>

              {/* Name (hidden on very small screens) */}
              <span className="nav-user-name" style={{ maxWidth: 110 }}>
                {user?.fullName || 'User'}
              </span>

              {/* Chevron */}
              <ChevronDown
                className="nav-chevron"
                style={{ width: 14, height: 14 }}
              />
            </button>

            {/* ── Dropdown ───────────────────────────────── */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  className="profile-dropdown-menu"
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* User Info Card */}
                  <div
                    className="nav-user-info-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleTriggerProfile();
                    }}
                  >
                    <div className="user-avatar-lg">{userInitial}</div>
                    <div className="user-text">
                      <span className="user-fullname">{user?.fullName || 'User Profile'}</span>
                      <span className="user-email">{user?.email || 'No email'}</span>
                      <span className={`user-role-badge ${isAdmin ? 'admin' : 'customer'}`}>
                        {isAdmin
                          ? <ShieldCheck style={{ width: 10, height: 10 }} />
                          : <UserCheck style={{ width: 10, height: 10 }} />
                        }
                        {user?.role || 'CUSTOMER'}
                      </span>
                    </div>
                  </div>


                  {/* Edit Profile & Mobile */}
                  <button
                    onClick={() => { setShowProfileDropdown(false); handleTriggerProfile(); }}
                    className="dropdown-item"
                  >
                    <div className="item-icon-wrap" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                      <Edit3 style={{ width: 14, height: 14, color: '#059669' }} />
                    </div>
                    <span>{translateData('Edit Name & Mobile')}</span>
                  </button>

                  {/* Saved Delivery Address */}
                  <button
                    onClick={() => { setShowProfileDropdown(false); handleTriggerProfile(); }}
                    className="dropdown-item"
                  >
                    <div className="item-icon-wrap" style={{ background: '#e0f2fe', border: '1px solid #bae6fd' }}>
                      <MapPin style={{ width: 14, height: 14, color: '#0284c7' }} />
                    </div>
                    <span>{translateData('Saved Delivery Address')}</span>
                  </button>

                  {/* My Orders */}
                  <button
                    onClick={() => { setShowProfileDropdown(false); if (onOpenOrders) onOpenOrders(); else setIsProfileSidebarOpen(true); }}
                    className="dropdown-item"
                  >
                    <div className="item-icon-wrap" style={{ background: '#e0e7ff', border: '1px solid #c7d2fe' }}>
                      <Package style={{ width: 14, height: 14, color: '#4f46e5' }} />
                    </div>
                    <span>{translateData('My Orders')}</span>
                  </button>

                  {/* My Wishlist */}
                  <button
                    onClick={() => { setShowProfileDropdown(false); if (onOpenFavorites) onOpenFavorites(); else setIsProfileSidebarOpen(true); }}
                    className="dropdown-item"
                  >
                    <div className="item-icon-wrap" style={{ background: '#fef2f2', border: '1px solid #fecdd3' }}>
                      <Heart style={{ width: 14, height: 14, color: '#e11d48' }} />
                    </div>
                    <span>{translateData('My Wishlist')}</span>
                  </button>

                  {/* Ask SANJEEVANI Chatbot */}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      if (onOpenChatbot) onOpenChatbot();
                      else {
                        const botEl = document.querySelector('.sanjeevani-bot-fab');
                        if (botEl) botEl.click();
                      }
                    }}
                    className="dropdown-item"
                  >
                    <div className="item-icon-wrap" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Bot style={{ width: 14, height: 14, color: '#16a34a' }} />
                    </div>
                    <span>{translateData('Ask SANJEEVANI AI')}</span>
                  </button>

                  {/* Change Password */}
                  <button
                    onClick={() => { setShowProfileDropdown(false); navigate('/change-password'); }}
                    className="dropdown-item"
                  >
                    <div
                      className="item-icon-wrap"
                      style={{ background: '#fef3c7', border: '1px solid #fde68a' }}
                    >
                      <Key style={{ width: 14, height: 14, color: '#d97706' }} />
                    </div>
                    <span>{translateData('Change Password')}</span>
                  </button>

                  <div className="nav-menu-divider" />

                  {/* Logout */}
                  <button
                    onClick={() => { setShowProfileDropdown(false); onLogout(); }}
                    className="dropdown-item"
                    style={{ color: '#dc2626' }}
                  >
                    <div
                      className="item-icon-wrap"
                      style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}
                    >
                      <LogOut style={{ width: 14, height: 14, color: '#dc2626' }} />
                    </div>
                    <span>{t('logout') || translateData('Logout')}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {isInternalProfileOpen && (
        <Suspense fallback={null}>
          <ProfileSidebar
            isOpen={isInternalProfileOpen}
            onClose={() => setIsInternalProfileOpen(false)}
            user={user}
            onLogout={onLogout}
            onOpenOrders={onOpenOrders}
          />
        </Suspense>
      )}
    </motion.header>
  );
};

export default Navbar;
