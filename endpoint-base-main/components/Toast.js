import React from 'react';

const Toast = ({ message, type = 'info', visible }) => {
  const styles = {
    base: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      color: '#fff',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
      zIndex: 9999,
      transition: 'all 0.4s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
    },
    info: { background: '#334155' }, // slate-700
    success: { background: '#16a34a' }, // green-600
    error: { background: '#dc2626' }, // red-600
  };

  const icons = {
      success: '✅',
      error: '❌',
      info: '🔔',
  }

  if (!message) return null;

  return (
    <div style={{ ...styles.base, ...styles[type] }}>
      <span style={{fontSize: '1.25rem'}}>{icons[type]}</span>
      {message}
    </div>
  );
};

export default Toast;
