import { useEffect, useCallback, useRef } from 'react';

interface RewardedAdResult {
  success: boolean;
  rewardType: 'hint' | 'undo' | 'analysis' | null;
}

interface UseAdManagerOptions {
  onRewardGranted?: (rewardType: string) => void;
}

export function useAdManager(options: UseAdManagerOptions = {}) {
  const { onRewardGranted } = options;
  const rewardCallbackRef = useRef(onRewardGranted);
  
  // Keep callback ref updated
  useEffect(() => {
    rewardCallbackRef.current = onRewardGranted;
  }, [onRewardGranted]);

  // Set gameplay active state
  const setGameplayActive = useCallback((active: boolean) => {
    if (window.ChessAdManager) {
      window.ChessAdManager.setGameplayActive(active);
    }
  }, []);

  // Notify when a game is completed
  const notifyGameComplete = useCallback(() => {
    if (window.ChessAdManager) {
      window.ChessAdManager.onGameComplete();
    }
    // Also dispatch event for the ad manager script
    window.dispatchEvent(new CustomEvent('chess:gameComplete'));
  }, []);

  // Request a rewarded ad for a specific feature
  const requestRewardedAd = useCallback((
    rewardType: 'hint' | 'undo' | 'analysis',
    onComplete?: (success: boolean) => void
  ): boolean => {
    if (!window.ChessAdManager) {
      console.warn('[useAdManager] ChessAdManager not available');
      if (onComplete) onComplete(false);
      return false;
    }

    if (!window.ChessAdManager.canShowRewarded()) {
      console.log('[useAdManager] Cannot show rewarded ad right now');
      if (onComplete) onComplete(false);
      return false;
    }

    return window.ChessAdManager.showRewardedAd(rewardType, (success) => {
      if (success && rewardCallbackRef.current) {
        rewardCallbackRef.current(rewardType);
      }
      if (onComplete) onComplete(success);
    });
  }, []);

  // Check if rewarded ads are available
  const canShowRewardedAd = useCallback((): boolean => {
    return window.ChessAdManager?.canShowRewarded() ?? false;
  }, []);

  // Check if ads can be shown (general)
  const canShowAds = useCallback((): boolean => {
    return window.ChessAdManager?.canShowAds() ?? false;
  }, []);

  // Listen for rewarded ad results
  useEffect(() => {
    const handleRewardResult = (event: CustomEvent<RewardedAdResult>) => {
      const { success, rewardType } = event.detail;
      if (success && rewardType && rewardCallbackRef.current) {
        rewardCallbackRef.current(rewardType);
      }
    };

    window.addEventListener('chess:rewardedAdResult', handleRewardResult as EventListener);
    
    return () => {
      window.removeEventListener('chess:rewardedAdResult', handleRewardResult as EventListener);
    };
  }, []);

  return {
    setGameplayActive,
    notifyGameComplete,
    requestRewardedAd,
    canShowRewardedAd,
    canShowAds
  };
}

export default useAdManager;
