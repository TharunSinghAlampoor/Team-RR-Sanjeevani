import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Search, Tag, User } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'categories', label: 'Categories', icon: LayoutGrid, path: '/category/all' },
  { id: 'search', label: 'Search', icon: Search, action: 'search' },
  { id: 'offers', label: 'Offers', icon: Tag, action: 'offers' },
  { id: 'account', label: 'Account', icon: User, action: 'account' },
];

export const BottomNavBar = ({ activeTab = 'home', onSearchClick, onOffersClick, onAccountClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (location.pathname === '/dashboard') return 'home';
    if (location.pathname.startsWith('/category')) return 'categories';
    return 'home';
  };

  const currentTab = getActiveTab();

  const handleClick = (item) => {
    if (item.action === 'search' && onSearchClick) {
      onSearchClick();
    } else if (item.action === 'offers' && onOffersClick) {
      onOffersClick();
    } else if (item.action === 'account' && onAccountClick) {
      onAccountClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav className="sj-bottom-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            className={`sj-bottom-nav__item ${isActive ? 'sj-bottom-nav__item--active' : ''}`}
            onClick={() => handleClick(item)}
          >
            <Icon className="sj-bottom-nav__icon" />
            <span className="sj-bottom-nav__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
