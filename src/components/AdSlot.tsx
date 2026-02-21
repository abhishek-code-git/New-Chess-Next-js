"use client";

import React, { useEffect, useRef } from 'react';

interface AdSlotProps {
  className?: string;
}

const AdSlot: React.FC<AdSlotProps> = ({ className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.ChessAdManager?.refreshBannerAds) {
      setTimeout(() => {
        window.ChessAdManager?.refreshBannerAds();
      }, 2000);
    }
  }, []);

  return (
    <div
      ref={ref}
      data-ad-slot="inline"
      className={`flex items-center justify-center min-h-[50px] overflow-hidden ${className}`}
      aria-label="Advertisement"
      style={{ maxWidth: '100%' }}
    />
  );
};

export default AdSlot;


