"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightbulb, Undo, BarChart3, Play, X, Loader2 } from 'lucide-react';

interface RewardedAdEvent {
  rewardType: 'hint' | 'undo' | 'analysis';
  adKey: string;
  scriptUrl: string;
}

const REWARD_INFO = {
  hint: {
    icon: Lightbulb,
    title: 'Get a Hint',
    description: 'Watch a short ad to get a hint for your next move.',
    color: 'text-amber-500'
  },
  undo: {
    icon: Undo,
    title: 'Undo Move',
    description: 'Watch a short ad to undo your last move.',
    color: 'text-blue-500'
  },
  analysis: {
    icon: BarChart3,
    title: 'Free Analysis',
    description: 'Watch a short ad to get a free position analysis.',
    color: 'text-green-500'
  }
};

const RewardedAdModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rewardType, setRewardType] = useState<'hint' | 'undo' | 'analysis' | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  // Listen for rewarded ad requests
  useEffect(() => {
    const handleShowRewardedAd = (event: CustomEvent<RewardedAdEvent>) => {
      const { rewardType: type } = event.detail;
      setRewardType(type);
      setIsOpen(true);
      setIsWatching(false);
    };

    window.addEventListener('chess:showRewardedAd', handleShowRewardedAd as EventListener);
    
    return () => {
      window.removeEventListener('chess:showRewardedAd', handleShowRewardedAd as EventListener);
    };
  }, []);

  const handleWatchAd = useCallback(() => {
    setIsWatching(true);
    
    // Simulate ad watching (replace with actual ad SDK integration)
    setTimeout(() => {
      if (window.ChessAdManager) {
        window.ChessAdManager.onRewardedAdComplete(true);
      }
      setIsOpen(false);
      setIsWatching(false);
    }, 3000);
  }, []);

  const handleClose = useCallback(() => {
    if (isWatching) return;
    
    if (window.ChessAdManager) {
      window.ChessAdManager.onRewardedAdComplete(false);
    }
    setIsOpen(false);
  }, [isWatching]);

  if (!rewardType) return null;

  const info = REWARD_INFO[rewardType];
  const Icon = info.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${info.color}`} />
            {info.title}
          </DialogTitle>
          <DialogDescription>
            {info.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          {isWatching ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading ad... Please wait
              </p>
              <div 
                id="rewarded-ad-container" 
                className="w-full min-h-[250px] bg-muted/50 rounded-lg flex items-center justify-center"
              >
                <p className="text-xs text-muted-foreground">
                  Ad will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full bg-muted ${info.color}`}>
                <Icon className="h-8 w-8" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Watch a short advertisement to unlock this feature for free!
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          {!isWatching && (
            <>
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleWatchAd}>
                <Play className="h-4 w-4 mr-2" />
                Watch Ad
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardedAdModal;


