import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Phone, Mail, MapPin, ShieldCheck, Truck, Clock } from 'lucide-react';

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'Shop by Category', action: () => document.querySelector('.cat-hero-row')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Track Orders', href: '/track-order' },
  ],
  'Services': [
    { label: '24/7 Pharmacist Support', href: '#' },
    { label: 'Prescription Upload', href: '#' },
    { label: 'Express Delivery', href: '#' },
    { label: 'Health Consultation', href: '#' },
  ],
  'Policies': [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Return Policy', href: '#' },
    { label: 'Shipping Policy', href: '#' },
  ],
};

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: '100% Genuine Products', color: '#10b981' },
  { icon: Truck, label: 'Express Delivery', color: '#06b6d4' },
  { icon: Clock, label: '24/7 Support', color: '#8b5cf6' },
];

export const DashboardFooter = () => {
  return (
    <footer className="dashboard-footer">
      {/* Gradient top border */}
      <div className="footer-gradient-bar" />

      <div className="footer-inner">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-brand">
            <img src="/sanjeevani_symbol.png" alt="Sanjeevani" className="footer-logo-img" />
            <div>
              <p className="footer-brand-name">SANJEEVANI</p>
              <p className="footer-brand-tagline">Enterprise Medical Care</p>
            </div>
          </div>
          <p className="footer-brand-desc">
            Your trusted healthcare partner delivering genuine medicines, medical devices, 
            and wellness products with express delivery across India.
          </p>

          {/* Trust badges */}
          <div className="footer-trust-row">
            {TRUST_ITEMS.map(({ icon: Icon, label, color }) => (
              <div key={label} className="footer-trust-item">
                <Icon style={{ color, width: 14, height: 14 }} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <div className="footer-contact-item">
              <Phone className="w-3.5 h-3.5 text-teal-500" />
              <span>18001234321 (Toll Free)</span>
            </div>
            <div className="footer-contact-item">
              <Mail className="w-3.5 h-3.5 text-teal-500" />
              <span>support@sanjeevani.in</span>
            </div>
            <div className="footer-contact-item">
              <MapPin className="w-3.5 h-3.5 text-teal-500" />
              <span>Pan India Delivery</span>
            </div>
          </div>
        </div>

        {/* Links Columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading} className="footer-links-col">
            <h4 className="footer-links-heading">{heading}</h4>
            <ul className="footer-links-list">
              {links.map(({ label, href, action }) => (
                <li key={label}>
                  {action ? (
                    <button onClick={action} className="footer-link">{label}</button>
                  ) : (
                    <a href={href} className="footer-link">{label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Sanjeevani Healthcare. All rights reserved.
        </p>
        <p className="footer-made-with">
          Made with <Heart className="w-3 h-3 text-rose-500 fill-current inline mx-0.5" /> for better healthcare
        </p>
      </div>
    </footer>
  );
};

export default DashboardFooter;
