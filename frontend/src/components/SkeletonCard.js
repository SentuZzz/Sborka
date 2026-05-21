import React from 'react';

const SkeletonCard = () => {
  return (
    <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton-box" style={{ height: '180px', marginBottom: '20px' }} />
      <div className="skeleton-box" style={{ height: '16px', width: '85%', marginBottom: '10px' }} />
      <div className="skeleton-box" style={{ height: '16px', width: '60%', marginBottom: '20px' }} />
      <div className="skeleton-box" style={{ height: '26px', width: '50%', marginBottom: '10px' }} />
      <div className="skeleton-box" style={{ height: '14px', width: '40%', marginBottom: '20px' }} />
      <div className="skeleton-box" style={{ height: '42px', borderRadius: '8px' }} />
    </div>
  );
};

export default SkeletonCard;
