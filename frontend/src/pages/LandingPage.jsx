import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DashboardFooter from '../components/DashboardFooter';
import { Pill, Stethoscope, Microscope, ShieldCheck, ArrowRight, Clock, Sparkles } from 'lucide-react';
import './LandingPage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const SERVICES = [
  {
    icon: Pill,
    title: 'Express Medicine Delivery',
    desc: 'Order genuine prescription medicines & health supplements with 100% door-step express delivery across India.',
    color: '#059669',
    bg: '#ffffff',
    border: '#a7f3d0',
  },
  {
    icon: Stethoscope,
    title: '24/7 Doctor Consultations',
    desc: 'Consult top verified healthcare specialists online anytime with instant e-prescriptions.',
    color: '#0284c7',
    bg: '#ffffff',
    border: '#bae6fd',
  },
  {
    icon: Microscope,
    title: 'Diagnostic Lab Tests',
    desc: 'Book full body health checkups & lab tests with certified home sample collection & digital reports.',
    color: '#7c3aed',
    bg: '#ffffff',
    border: '#ddd6fe',
  },
  {
    icon: ShieldCheck,
    title: 'Razorpay Instant Payments',
    desc: '100% secure payment gateway supporting PhonePe, Google Pay, Paytm, UPI QR scan & Cards.',
    color: '#2563eb',
    bg: '#ffffff',
    border: '#bfdbfe',
  },
];

const STATS = [
  { value: '100K+', label: 'Happy Patients Served', icon: Sparkles, color: '#059669' },
  { value: '100%', label: 'Genuine Medicines Guarantee', icon: ShieldCheck, color: '#0284c7' },
  { value: '24/7', label: 'Express Delivery & Support', icon: Clock, color: '#7c3aed' },
];

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();


  return (
    <div className="landing simple-landing light-landing">
      {/* ── Background Animated Glows ── */}
      <div className="landing-bg">
        <motion.div
          className="hero-orb hero-orb-1"
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero-orb hero-orb-2"
          animate={{
            x: [0, -35, 45, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.08, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="hero-grid" />
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.img
              src="/sanjeevani_symbol.png"
              alt="Sanjeevani Logo"
              className="landing-logo-img"
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'contain', border: '2px solid #10b981', background: '#ffffff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}
              whileHover={{ rotate: 360, scale: 1.08 }}
              transition={{ duration: 0.8 }}
            />
            <img src="/sanjeevani_text_transparent.png" alt="Sanjeevani" className="landing-logo-text-img" style={{ height: '42px', objectFit: 'contain' }} />
          </Link>

          <div className="landing-nav-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing-nav-btn primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav-btn ghost">Sign In</Link>
                <Link to="/register" className="landing-nav-btn primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <main className="landing-hero">
        <motion.div
          className="landing-hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo Brand Animation */}
          <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
            <motion.img
              src="/sanjeevani_text_transparent.png"
              alt="Sanjeevani Logo"
              className="landing-logo-text-img"
              style={{ height: '92px', objectFit: 'contain' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Active Badge */}
          <motion.div variants={itemVariants} className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Active Healthcare Services • Pan India Express</span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={itemVariants} className="hero-title">
            Health Delivered<br />
            <span className="hero-gradient-text">To You.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="hero-subtitle">
            Order 100% genuine prescription medicines, consult verified doctors online, 
            and experience seamless Razorpay payments with instant door-step delivery.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="hero-actions">
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/dashboard" className="hero-btn-primary">
                  Go to Dashboard
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" className="hero-btn-primary">
                    Get Started Now
                    <ArrowRight style={{ width: 18, height: 18 }} />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/login" className="hero-btn-secondary">
                    Sign In
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Light Theme Stats Bar */}
          <motion.div
            variants={itemVariants}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.25rem',
              marginTop: '3.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid #cbd5e1',
              width: '100%',
              maxWidth: 820,
            }}
            className="landing-stats-grid"
          >
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <motion.div
                key={label}
                whileHover={{ y: -4, scale: 1.03 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1.1rem',
                  borderRadius: '1rem',
                  background: 'rgba(255, 255, 255, 0.92)',
                  border: '1.5px solid #e2e8f0',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color, fontWeight: 900, fontSize: '1.5rem' }}>
                  <Icon style={{ width: 20, height: 20 }} />
                  <span>{value}</span>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 800, marginTop: '0.25rem', textAlign: 'center' }}>{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* ── Key Healthcare Services Section ── */}
      <section className="landing-services" style={{ padding: '4rem 1.5rem 6rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '0.8rem' }}>
            <Sparkles style={{ width: 14, height: 14, color: '#059669' }} />
            <span>Why Choose Sanjeevani</span>
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>
            Complete Healthcare Solutions
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#475569', fontWeight: 600, maxWidth: 580, margin: '0 auto' }}>
            Designed for modern medical care with instant online ordering, verified medications, and express delivery.
          </p>
        </motion.div>

        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {SERVICES.map(({ icon: Icon, title, desc, color, bg, border }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                padding: '1.85rem 1.6rem',
                borderRadius: '1.25rem',
                background: bg,
                border: `1.5px solid ${border}`,
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '0.85rem',
                background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${border}`,
                boxShadow: `0 4px 14px ${color}20`,
              }}>
                <Icon style={{ width: 26, height: 26, color }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <DashboardFooter />
    </div>
  );
};

export default LandingPage;
