/// <reference types="vite/client" />

/**
 * Type declarations for the ChessAdManager global
 * Loaded from public/js/ad-manager.js
 */
interface ChessAdManagerInterface {
  init: () => void;
  cleanup: () => void;
  setGameplayActive: (active: boolean) => void;
  onGameComplete: () => void;
  showRewardedAd: (rewardType: string, callback?: (success: boolean) => void) => boolean;
  onRewardedAdComplete: (success: boolean) => void;
  showInterstitial: () => boolean;
  refreshBannerAds: () => void;
  isReady: () => boolean;
  canShowRewarded: () => boolean;
  canShowAds: () => boolean;
  getSessionState: () => Record<string, unknown>;
}

declare global {
  interface Window {
    ChessAdManager?: ChessAdManagerInterface;
  }
}

export {};
