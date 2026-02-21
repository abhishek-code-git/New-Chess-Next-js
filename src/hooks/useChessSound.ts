import { useCallback } from 'react';

// Create audio context lazily
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
};

// Generate move sound
const createMoveSound = (isCapture: boolean = false): OscillatorNode => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  if (isCapture) {
    // Capture sound - lower pitch, slightly longer
    oscillator.frequency.setValueAtTime(180, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  } else {
    // Regular move - quick tap sound
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
  }
  
  oscillator.type = 'sine';
  
  return oscillator;
};

// Check sound
const createCheckSound = (): OscillatorNode => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(500, ctx.currentTime);
  oscillator.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(500, ctx.currentTime + 0.2);
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  oscillator.type = 'triangle';
  
  return oscillator;
};

export type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'gameEnd';

export const useChessSound = () => {
  const playSound = useCallback((type: SoundType) => {
    try {
      const ctx = getAudioContext();
      
      // Resume audio context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      let oscillator: OscillatorNode;
      let duration: number;
      
      switch (type) {
        case 'capture':
          oscillator = createMoveSound(true);
          duration = 0.15;
          break;
        case 'check':
          oscillator = createCheckSound();
          duration = 0.3;
          break;
        case 'castle':
          oscillator = createMoveSound(false);
          duration = 0.12;
          break;
        case 'gameEnd':
          oscillator = createCheckSound();
          duration = 0.4;
          break;
        default:
          oscillator = createMoveSound(false);
          duration = 0.08;
      }
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  return { playSound };
};
