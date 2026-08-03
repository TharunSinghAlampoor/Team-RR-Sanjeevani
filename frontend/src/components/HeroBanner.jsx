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
    bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
    accentColor: '#10b981',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
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
    bgGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
    accentColor: '#3b82f6',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
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
    bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
    accentColor: '#8b5cf6',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
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
    bgGradient: 'linear-gradient(135deg, #db2777 0%, #be185d 50%, #831843 100%)',
    accentColor: '#ec4899',
    badgeBg: '#fce7f3',
    badgeText: '#9d174d',
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
    <div id="offers-hero-section" style={{ position: 'relative', width: '100%', marginBottom: '1.5rem' }}>
      <div
        style={{
          borderRadius: '1.25rem',
          overflow: 'hidden',
          position: 'relative',
          background: offer.bgGradient,
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.5s ease',
          padding: '1.75rem 2rem',
          color: '#ffffff',
        }}
      >
        {/* Decorative background glow circle */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ width: '100%', zIndex: 2 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div style={{ maxWidth: '650px' }}>
                {/* Badge Tag */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.22)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <OfferIcon style={{ width: 14, height: 14 }} />
                    {offer.tag}
                  </span>
                  <span
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: '#fef08a',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Tag style={{ width: 12, height: 12 }} /> CODE: {offer.code}
                  </span>
                </div>

                {/* Title */}
                <h1
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    margin: '0 0 0.4rem',
                    lineHeight: 1.25,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  {offer.title}
                </h1>

                {/* Subtitle */}
                <p
                  style={{
                    fontSize: '0.9rem',
                    margin: '0 0 1rem',
                    opacity: 0.92,
                    lineHeight: 1.4,
                    maxWidth: '550px',
                    fontWeight: 500,
                  }}
                >
                  {offer.subtitle}
                </p>

                {/* Highlights & CTA Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={onExploreOffers}
                    style={{
                      background: '#ffffff',
                      color: offer.badgeText,
                      border: 'none',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                    }}
                  >
                    <span>{offer.buttonText}</span>
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, opacity: 0.95 }}>
                    <ShieldCheck style={{ width: 16, height: 16, color: '#fef08a' }} />
                    <span>{offer.highlight}</span>
                  </div>
                </div>
              </div>

              {/* Promo Graphic Box */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '1rem',
                  textAlign: 'center',
                  minWidth: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <OfferIcon style={{ width: 38, height: 38, marginBottom: '0.4rem', color: '#ffffff' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>USE PROMO CODE</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fef08a' }}>{offer.code}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            zIndex: 3,
          }}
        >
          <ChevronLeft style={{ width: 18, height: 18 }} />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            zIndex: 3,
          }}
        >
          <ChevronRight style={{ width: 18, height: 18 }} />
        </button>

        {/* Dot Indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.6rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.4rem',
            zIndex: 3,
          }}
        >
          {OFFERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              style={{
                width: currentSlide === idx ? '20px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                background: currentSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;