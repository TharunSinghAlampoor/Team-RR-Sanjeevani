import React from 'react';
import AuthSharedBackground from './AuthSharedBackground';

/**
 * AuthLayout — Centered Auth Layout Wrapper
 * Renders the AuthSharedBackground canvas background and centered glassmorphism card container.
 */
export const AuthLayout = ({ children }) => {
  return (
    <div
      className="auth-page-wrapper"
      style={{
        width: '100vw',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
      }}
    >
      <AuthSharedBackground />
      <div className="auth-container">
        <div className="auth-card">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
