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
import { X, Loader2 } from 'lucide-react';

interface InterstitialAdEvent {
  adKey: string;
  scriptUrl: string;
}

const InterstitialAdModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  // Listen for interstitial ad requests
  useEffect(() => {
    const handleShowInterstitial = (event: CustomEvent<InterstitialAdEvent>) => {
      setIsOpen(true);
      setIsLoading(true);
      setCountdown(5);
      setCanClose(false);
      
      // Simulate ad loading
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    window.addEventListener('chess:showInterstitial', handleShowInterstitial as EventListener);
    
    return () => {
      window.removeEventListener('chess:showInterstitial', handleShowInterstitial as EventListener);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isLoading || canClose) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isLoading, canClose]);

  const handleClose = useCallback(() => {
    if (!canClose) return;
    
    setIsOpen(false);
    // Notify ad manager
    window.dispatchEvent(new CustomEvent('chess:interstitialClosed'));
  }, [canClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && canClose && handleClose()}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => !canClose && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Advertisement</span>
            {!isLoading && (
              <span className="text-sm text-muted-foreground">
                {canClose ? 'You can close now' : `Skip in ${countdown}s`}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Support free chess by viewing this brief message
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div 
              id="interstitial-ad-container" 
              className="w-full min-h-[300px] bg-muted/30 rounded-lg flex items-center justify-center border border-border"
            >
              {/* Ad content will be injected here by ad network */}
              <p className="text-sm text-muted-foreground">Ad content</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={!canClose}
          >
            <X className="h-4 w-4 mr-2" />
            {canClose ? 'Close' : `Wait ${countdown}s`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterstitialAdModal;


