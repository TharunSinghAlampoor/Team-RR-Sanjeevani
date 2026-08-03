import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Sparkles, ChevronLeft, ChevronRight, Zap, ShieldCheck, Truck, ArrowRight, Gift } from 'lucide-react';

const OFFERS = [
  {
    id: 1,
    tag: 'LIMITED TIME OFFER',
    title: 'Flat 25% OFF on Prescriptions & Medicines',
    subtitle: 'Get genuine, certified medicines delivered directly to your doorstep within 2 hours.',
    code: 'SANJEEVANI25',
    bgGradient: 'linear-gradient(135deg, rgba(15, 118, 110, 0.95) 0%, rgba(13, 148, 136, 0.96) 50%, rgba(4, 120, 87, 0.97) 100%)',
    bgImage: "url('/bg_clean_teal.jpg')",
    accentColor: '#34d399',
    badgeBg: '#ccfbf1',
    badgeText: '#0f766e',
    icon: Sparkles,
    buttonText: 'Claim 25% OFF Now',
    highlight: '24/7 Pharmacy Online',
  },
  {
    id: 2,
    tag: 'SUPER SAVINGS SALE',
    title: 'Up to 40% OFF on Wellness & Nutrition Supplements',
    subtitle: 'Boost your family health with top-rated vitamins, minerals, and immunity boosters.',
    code: 'HEALTH40',
    bgGradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.94) 0%, rgba(16, 185, 129, 0.95) 50%, rgba(4, 120, 87, 0.96) 100%)',
    bgImage: "url('/custom_medical_bg_light.jpg')",
    accentColor: '#6ee7b7',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    icon: Zap,
    buttonText: 'Shop Wellness Deals',
    highlight: '100% Authentic Brands',
  },
  {
    id: 3,
    tag: 'EXPRESS DELIVERY PROMO',
    title: 'FREE Express Delivery on All Medical Devices & Monitors',
    subtitle: 'High precision Blood Pressure monitors, Diabetes meters, and Pulse Oximeters with warranty.',
    code: 'FREEDEL',
    bgGradient: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(15, 118, 110, 0.96) 50%, rgba(17, 94, 89, 0.97) 100%)',
    bgImage: "url('/custom_medical_bg_dark.jpg')",
    accentColor: '#2dd4bf',
    badgeBg: '#e6fffa',
    badgeText: '#115e59',
    icon: Truck,
    buttonText: 'Explore Medical Devices',
    highlight: 'Instant Dispatch',
  },
  {
    id: 4,
    tag: 'MOTHER & BABY CARE',
    title: 'Save Extra 30% on Baby & Pediatric Care Essentials',
    subtitle: 'Dermatologically tested pediatric skincare, infant nutrition, and baby hygiene care.',
    code: 'BABY30',
    bgGradient: 'linear-gradient(135deg, rgba(4, 120, 87, 0.94) 0%, rgba(5, 150, 105, 0.95) 50%, rgba(20, 184, 166, 0.96) 100%)',
    bgImage: "url('/dashboard_dark_bg.jpg')",
    accentColor: '#5eead4',
    badgeBg: '#d1fae5',
    badgeText: '#047857',
    icon: Gift,
    buttonText: 'Shop Baby Essentials',
    highlight: 'Pediatrician Approved',
  },
];

export const HeroBanner = ({ onExploreOffers }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % OFFERS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const offer = OFFERS[currentSlide];
  const OfferIcon = offer.icon;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % OFFERS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + OFFERS.length) % OFFERS.length);

  return (
    <div id="offers-hero-section" style={{ position: 'relative', width: '100%', marginBottom: '1.75rem' }}>
      <motion.div
        key={`banner-container-${offer.id}`}
        initial={{ opacity: 0.92, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55 }}
        style={{
          borderRadius: '1.35rem',
          overflow: 'hidden',
          position: 'relative',
          background: `${offer.bgGradient}, ${offer.bgImage}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
          minHeight: '260px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          padding: '2.25rem 2.75rem',
          color: '#ffffff',
        }}
      >
        {/* Animated Background Pulse Circle */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-45%',
            right: '-10%',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.18)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating Rotating Sparkle Particles */}
        <motion.div
          animate={{ rotate: 360, y: [0, -10, 0] }}
          transition={{ rotate: { duration: 16, repeat: Infinity, ease: 'linear' }, y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }}
          style={{ position: 'absolute', right: '300px', top: '30px', opacity: 0.3, pointerEvents: 'none' }}
        >
          <Sparkles size={36} style={{ color: '#ffffff' }} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, x: 50, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', zIndex: 2 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div style={{ maxWidth: '680px' }}>
                {/* Animated Badge Tag */}
                <motion.div
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.85rem',
                      borderRadius: '9999px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}
                  >
                    <OfferIcon style={{ width: 15, height: 15 }} />
                    {offer.tag}
                  </motion.span>

                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      color: '#fef08a',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      border: '1.5px solid rgba(254, 240, 138, 0.4)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Tag style={{ width: 13, height: 13 }} /> CODE: {offer.code}
                  </motion.span>
                </motion.div>

                {/* Animated Title */}
                <motion.h1
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 900,
                    margin: '0 0 0.5rem',
                    lineHeight: 1.22,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    textShadow: '0 2px 6px rgba(0,0,0,0.22)',
                  }}
                >
                  {offer.title}
                </motion.h1>

                {/* Animated Subtitle */}
                <motion.p
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  style={{
                    fontSize: '0.98rem',
                    margin: '0 0 1.25rem',
                    opacity: 0.94,
                    lineHeight: 1.5,
                    maxWidth: '580px',
                    fontWeight: 500,
                  }}
                >
                  {offer.subtitle}
                </motion.p>

                {/* Highlights & CTA Button */}
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap' }}
                >
                  <motion.button
                    onClick={onExploreOffers}
                    whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 24px rgba(0,0,0,0.28)' }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      background: '#ffffff',
                      color: offer.badgeText,
                      border: 'none',
                      padding: '0.72rem 1.45rem',
                      borderRadius: '0.8rem',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.16)',
                    }}
                  >
                    <span>{offer.buttonText}</span>
                    <ArrowRight style={{ width: 17, height: 17 }} />
                  </motion.button>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', fontWeight: 700, opacity: 0.95 }}>
                    <ShieldCheck style={{ width: 18, height: 18, color: '#fef08a' }} />
                    <span>{offer.highlight}</span>
                  </div>
                </motion.div>
              </div>

              {/* Floating Promo Graphic Box */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -7, 0] }}
                transition={{
                  scale: { duration: 0.45, delay: 0.2 },
                  opacity: { duration: 0.45, delay: 0.2 },
                  y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
                }}
                whileHover={{ scale: 1.07, rotate: 1 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(14px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.32)',
                  padding: '1.4rem 1.8rem',
                  borderRadius: '1.2rem',
                  textAlign: 'center',
                  minWidth: '185px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                >
                  <OfferIcon style={{ width: 44, height: 44, marginBottom: '0.5rem', color: '#ffffff', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.22))' }} />
                </motion.div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.9, letterSpacing: '0.05em' }}>USE PROMO CODE</span>
                <span style={{ fontSize: '1.32rem', fontWeight: 900, letterSpacing: '0.07em', color: '#fef08a', textShadow: '0 2px 5px rgba(0,0,0,0.22)' }}>{offer.code}</span>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Large Navigation Arrows */}
        <motion.button
          whileHover={{ scale: 1.18, background: 'rgba(0,0,0,0.55)' }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.35)',
            color: '#fff',
            border: 'none',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            zIndex: 3,
          }}
        >
          <ChevronLeft style={{ width: 22, height: 22 }} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.18, background: 'rgba(0,0,0,0.55)' }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.35)',
            color: '#fff',
            border: 'none',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            zIndex: 3,
          }}
        >
          <ChevronRight style={{ width: 22, height: 22 }} />
        </motion.button>

        {/* Animated Slide Progress Bar */}
        <motion.div
          key={`progress-${currentSlide}`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5.5, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            background: '#ffffff',
            opacity: 0.85,
            zIndex: 4,
          }}
        />

        {/* Dot Indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.8rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 3,
          }}
        >
          {OFFERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              style={{
                width: currentSlide === idx ? '28px' : '10px',
                height: '10px',
                borderRadius: '9999px',
                background: currentSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HeroBanner;