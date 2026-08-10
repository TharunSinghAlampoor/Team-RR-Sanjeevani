import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Phone, MapPin, Edit3, Check, Save,
  ShieldCheck, UserCheck, Package, Heart, Key, LogOut,
  ChevronRight, Sparkles, Building, Hash, Compass, RefreshCw, Navigation, Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { detectUserLocation } from '../utils/locationUtils';

export const ProfileSidebar = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenWishlist,
  onOpenChatbot,
  onChangePassword,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile fields state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // Delivery Address fields state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressMsg, setAddressMsg] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  // Load user details and saved address on mount/open
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.email || 'Valued User');
      setPhoneNumber(user.phoneNumber || user.phone || '');
    }

    try {
      const savedAddr = localStorage.getItem('user_delivery_address');
      if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        setStreet(parsed.street || '');
        setArea(parsed.area || '');
        setCity(parsed.city || '');
        setStateName(parsed.state || '');
        setPincode(parsed.pincode || '');
      } else {
        // Default initial address
        setStreet('House #12, Road No. 36');
        setArea('Jubilee Hills');
        setCity('Hyderabad');
        setStateName('Telangana');
        setPincode('500033');
      }
    } catch (e) {
      console.warn('Failed to parse saved delivery address:', e);
    }
  }, [user, isOpen]);

  const userInitial = (fullName || user?.email || 'U').charAt(0).toUpperCase();
  const isAdmin = user?.role === 'ADMIN';

  // Save profile changes
  const handleSaveProfile = () => {
    try {
      setProfileMsg('✅ Profile details saved successfully!');
      setIsEditingProfile(false);

      // Update local storage user name
      if (fullName.trim()) {
        localStorage.setItem('user', fullName.trim());
        sessionStorage.setItem('user', fullName.trim());
      }
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg('Failed to update profile.');
    }
  };

  // Save address changes
  const handleSaveAddress = () => {
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      setAddressMsg('⚠️ Please enter a valid 6-digit pincode.');
      return;
    }

    const addressData = {
      street: street.trim(),
      area: area.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      formatted: `${street.trim()}, ${area.trim()}, ${city.trim()}, ${stateName.trim()} - ${pincode.trim()}`
    };

    try {
      localStorage.setItem('user_delivery_address', JSON.stringify(addressData));
      sessionStorage.setItem('user_delivery_address', JSON.stringify(addressData));
      setAddressMsg('✅ Delivery address updated successfully!');
      setIsEditingAddress(false);
      setTimeout(() => setAddressMsg(''), 3000);
    } catch (e) {
      setAddressMsg('Failed to save address.');
    }
  };

  // Quick Pincode area auto-fill
  const handlePincodeLookup = async (pinVal) => {
    setPincode(pinVal);
    if (pinVal.length === 6 && /^\d{6}$/.test(pinVal)) {
      setIsDetecting(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pinVal}`);
        const data = await response.json();
        if (Array.isArray(data) && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setArea(po.Name || area);
          setCity(po.District || po.Block || city);
          setStateName(po.State || stateName);
        }
      } catch (e) {
        console.warn('Pincode lookup error:', e);
      } finally {
        setIsDetecting(false);
      }
    }
  };

  // Live GPS Location Detection
  const handleGPSLocationDetection = async () => {
    setIsDetecting(true);
    setAddressMsg('📍 Requesting GPS Location...');
    try {
      const locData = await detectUserLocation();
      if (locData && locData.raw && locData.raw.address) {
        const addr = locData.raw.address;
        const building = addr.building || addr.house_number || addr.amenity || addr.office || '';
        const road = addr.road || addr.street || addr.neighbourhood || addr.suburb || '';
        const streetVal = [building, road].filter(Boolean).join(', ') || locData.formattedAddress || 'My Current Location';
        const areaVal = addr.suburb || addr.neighbourhood || addr.residential || addr.district || 'City Center';
        const cityVal = addr.city || addr.town || addr.village || addr.city_district || addr.county || 'Hyderabad';
        const stateVal = addr.state || addr.region || 'Telangana';
        const pinVal = (addr.postcode || '').replace(/\D/g, '').slice(0, 6) || '500033';

        setStreet(streetVal);
        setArea(areaVal);
        setCity(cityVal);
        setStateName(stateVal);
        setPincode(pinVal);
        setIsEditingAddress(true);

        setAddressMsg('📍 Location auto-detected! You can edit any field below.');
        setTimeout(() => setAddressMsg(''), 4500);
      } else if (locData && locData.formattedAddress) {
        setStreet(locData.formattedAddress);
        setIsEditingAddress(true);
        setAddressMsg('📍 Location detected! Edit details below.');
        setTimeout(() => setAddressMsg(''), 4500);
      }
    } catch (err) {
      console.warn('GPS location error:', err);
      setAddressMsg(err.message || '⚠️ Unable to detect GPS location. Please enter manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2500, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop Overlay (Identical to Wishlist & Orders drawers) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Right Slide Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '100%', maxWidth: 420,
              height: '100%',
              background: '#ffffff',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
              borderLeft: '1.5px solid #e2e8f0',
              display: 'flex', flexDirection: 'column',
              zIndex: 2510,
              overflowY: 'auto',
            }}
          >
            {/* Header - Profile Title & Close Button */}
            <div style={{
              padding: '1.1rem 1.25rem 1rem',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
              borderBottom: '1.5px solid #a7f3d0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, zIndex: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <User style={{ width: 20, height: 20, color: '#059669' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                  My Profile
                </h3>
              </div>

              <button
                onClick={onClose}
                title="Close Profile"
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: '1.5px solid #a7f3d0', background: '#f0fdf4',
                  color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.18s'
                }}
              >
                <X style={{ width: 17, height: 17 }} />
              </button>
            </div>


          {/* Sidebar Content Body */}
          <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>

            {/* 2. Unified User Information Card (No Duplicates) */}
            <div style={{
              background: '#ffffff', border: '1.5px solid #e2e8f0',
              borderRadius: '1.1rem', padding: '1.15rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff', fontWeight: 900, fontSize: '1.4rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)', flexShrink: 0,
                  }}>
                    {userInitial}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                      {fullName}
                    </h4>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      fontSize: '0.72rem', fontWeight: 800, color: isAdmin ? '#991b1b' : '#065f46',
                      background: isAdmin ? '#fee2e2' : '#d1fae5', padding: '0.15rem 0.55rem', borderRadius: '99px', marginTop: '0.25rem'
                    }}>
                      {isAdmin ? <ShieldCheck style={{ width: 11, height: 11 }} /> : <UserCheck style={{ width: 11, height: 11 }} />}
                      {isAdmin ? 'ADMIN ACCOUNT' : 'VERIFIED CUSTOMER'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  style={{
                    background: isEditingProfile ? '#f1f5f9' : '#ecfdf5',
                    border: '1.5px solid #a7f3d0', color: '#047857',
                    padding: '0.35rem 0.75rem', borderRadius: '0.55rem',
                    fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}
                >
                  <Edit3 style={{ width: 13, height: 13 }} />
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {profileMsg && (
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '0.4rem 0.6rem', borderRadius: '0.5rem' }}>
                  {profileMsg}
                </p>
              )}

              {isEditingProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.6rem',
                        border: '1.5px solid #cbd5e1', fontSize: '0.86rem', fontWeight: 700,
                        color: '#0f172a', outline: 'none', background: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      placeholder="Enter mobile number"
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{
                        width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.6rem',
                        border: '1.5px solid #cbd5e1', fontSize: '0.86rem', fontWeight: 700,
                        color: '#0f172a', outline: 'none', background: '#fff',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      marginTop: '0.25rem', padding: '0.6rem 1rem', borderRadius: '0.6rem',
                      border: 'none', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff', fontWeight: 900, fontSize: '0.84rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      boxShadow: '0 3px 10px rgba(5,150,105,0.25)',
                    }}
                  >
                    <Save style={{ width: 15, height: 15 }} />
                    Save Profile Details
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
                    <Mail style={{ width: 15, height: 15, color: '#059669' }} />
                    <span>{user?.email || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
                    <Phone style={{ width: 15, height: 15, color: '#059669' }} />
                    <span style={{ fontWeight: 700 }}>+91 {phoneNumber || '9876543210'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Delivery Address Section (Editable with auto-lookup) */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
              border: '1.5px solid #a7f3d0', borderRadius: '1.1rem', padding: '1.1rem',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: '#047857', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin style={{ width: 16, height: 16, color: '#059669' }} />
                  Delivery Address
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={handleGPSLocationDetection}
                    disabled={isDetecting}
                    title="Auto-detect current GPS / IP location (Android, iPhone, PC, Tablet)"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      border: 'none', color: '#ffffff',
                      padding: '0.3rem 0.65rem', borderRadius: '0.5rem',
                      fontSize: '0.74rem', fontWeight: 900, cursor: isDetecting ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      boxShadow: '0 2px 8px rgba(5,150,105,0.3)', transition: 'all 0.2s',
                    }}
                  >
                    <Navigation
                      style={{
                        width: 13, height: 13, color: '#ffffff',
                        animation: isDetecting ? 'spin 1s linear infinite' : 'none'
                      }}
                    />
                    <span>{isDetecting ? 'Detecting...' : 'GPS'}</span>
                  </button>

                  <button
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    style={{
                      background: isEditingAddress ? '#f1f5f9' : '#ecfdf5',
                      border: '1.5px solid #a7f3d0', color: '#047857',
                      padding: '0.3rem 0.65rem', borderRadius: '0.5rem',
                      fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    <Edit3 style={{ width: 13, height: 13 }} />
                    {isEditingAddress ? 'Cancel' : 'Change'}
                  </button>
                </div>
              </div>

              {addressMsg && (
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 800, color: addressMsg.includes('⚠️') ? '#dc2626' : '#059669', background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '0.55rem', border: '1px solid #cbd5e1' }}>
                  {addressMsg}
                </p>
              )}

              {isEditingAddress ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* GPS Auto-Detect Button for Android, iPhone, Tablet & PC */}
                  <button
                    type="button"
                    onClick={handleGPSLocationDetection}
                    disabled={isDetecting}
                    style={{
                      width: '100%', padding: '0.65rem 0.95rem', borderRadius: '0.75rem',
                      border: '1.5px solid #a7f3d0',
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      color: '#047857', fontWeight: 900, fontSize: '0.84rem',
                      cursor: isDetecting ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      boxShadow: '0 3px 12px rgba(5,150,105,0.15)', transition: 'all 0.2s',
                    }}
                  >
                    <Navigation
                      style={{
                        width: 16, height: 16, color: '#059669',
                        animation: isDetecting ? 'spin 1s linear infinite' : 'none'
                      }}
                    />
                    <span>{isDetecting ? '📡 Locating GPS Position...' : '🎯 Auto-Detect My Current Location'}</span>
                  </button>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>House / Flat / Street</label>
                    <input
                      type="text"
                      placeholder="e.g. House #12, Plot 45"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      style={{
                        width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.6rem',
                        border: '1.5px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700,
                        color: '#0f172a', outline: 'none', background: '#ffffff',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Area / Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Jubilee Hills"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        style={{
                          width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.6rem',
                          border: '1.5px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700,
                          color: '#0f172a', outline: 'none', background: '#ffffff',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>City / District</label>
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{
                          width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.6rem',
                          border: '1.5px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700,
                          color: '#0f172a', outline: 'none', background: '#ffffff',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>State</label>
                      <input
                        type="text"
                        placeholder="e.g. Telangana"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        style={{
                          width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.6rem',
                          border: '1.5px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700,
                          color: '#0f172a', outline: 'none', background: '#ffffff',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Pincode (6 digits)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="e.g. 500033"
                        value={pincode}
                        onChange={(e) => handlePincodeLookup(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={{
                          width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.6rem',
                          border: '1.5px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700,
                          color: '#0f172a', outline: 'none', background: '#ffffff',
                        }}
                      />
                    </div>
                  </div>

                  {isDetecting && (
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <RefreshCw className="animate-spin" style={{ width: 12, height: 12 }} />
                      Auto-detecting Area & City from Pincode...
                    </p>
                  )}

                  <button
                    onClick={handleSaveAddress}
                    style={{
                      marginTop: '0.35rem', padding: '0.65rem 1rem', borderRadius: '0.6rem',
                      border: 'none', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      boxShadow: '0 3px 10px rgba(5,150,105,0.25)',
                    }}
                  >
                    <Save style={{ width: 15, height: 15 }} />
                    Save Delivery Address
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', marginBottom: '0.4rem' }}>
                    <MapPin style={{ width: 16, height: 16, color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                      {street ? `${street}, ${area}` : 'No address saved yet'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingLeft: '1.35rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
                      {city ? `${city}, ${stateName}` : ''}
                    </span>
                    {pincode && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', background: '#ffffff', padding: '0.1rem 0.5rem', borderRadius: '0.35rem', border: '1px solid #a7f3d0' }}>
                        PIN: {pincode}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Quick Action Menu Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.2rem' }}>
              <h5 style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Account Quick Actions
              </h5>

              {/* My Orders */}
              <button
                onClick={() => { onClose(); if (onOpenOrders) onOpenOrders(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  border: '1.5px solid #e2e8f0', background: '#ffffff',
                  color: '#0f172a', fontWeight: 800, fontSize: '0.88rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package style={{ width: 16, height: 16, color: '#059669' }} />
                  </div>
                  <span>My Orders</span>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
              </button>

              {/* My Wishlist */}
              <button
                onClick={() => { onClose(); if (onOpenWishlist) onOpenWishlist(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  border: '1.5px solid #e2e8f0', background: '#ffffff',
                  color: '#0f172a', fontWeight: 800, fontSize: '0.88rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart style={{ width: 16, height: 16, color: '#ef4444' }} />
                  </div>
                  <span>My Wishlist</span>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
              </button>

              {/* Saved Delivery Address */}
              <button
                onClick={() => { setIsEditingAddress(true); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  border: '1.5px solid #e2e8f0', background: '#ffffff',
                  color: '#0f172a', fontWeight: 800, fontSize: '0.88rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin style={{ width: 16, height: 16, color: '#0284c7' }} />
                  </div>
                  <span>Saved Delivery Address</span>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
              </button>

              {/* Ask SANJEEVANI AI Chatbot */}
              <button
                onClick={() => { onClose(); if (onOpenChatbot) onOpenChatbot(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  border: '1.5px solid #e2e8f0', background: '#ffffff',
                  color: '#0f172a', fontWeight: 800, fontSize: '0.88rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot style={{ width: 16, height: 16, color: '#059669' }} />
                  </div>
                  <span>Ask SANJEEVANI Assistant</span>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
              </button>

              {/* Change Password */}
              <button
                onClick={() => { onClose(); if (onChangePassword) onChangePassword(); else navigate('/change-password'); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  border: '1.5px solid #e2e8f0', background: '#ffffff',
                  color: '#0f172a', fontWeight: 800, fontSize: '0.88rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Key style={{ width: 16, height: 16, color: '#d97706' }} />
                  </div>
                  <span>Change Password</span>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
              </button>
            </div>

            {/* 5. Logout Button */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <button
                onClick={() => { onClose(); logout(); navigate('/login'); }}
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '0.75rem',
                  border: '1.5px solid #fecdd3', background: '#fff1f2',
                  color: '#e11d48', fontWeight: 900, fontSize: '0.9rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s',
                }}
              >
                <LogOut style={{ width: 18, height: 18 }} />
                <span>Log Out of Account</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  );
};

export default ProfileSidebar;
