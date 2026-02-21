"use client";

import React from 'react';
import { Chess } from 'chess.js';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Flag, Handshake, RotateCcw, Home, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameOverModalProps {
  game: Chess;
  isOpen: boolean;
  playerColor?: 'w' | 'b';
  gameMode: 'vs_computer' | 'local' | 'online';
  resigned?: 'w' | 'b' | null;
  onPlayAgain: () => void;
  pointsEarned?: number;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  game,
  isOpen,
  playerColor = 'w',
  gameMode,
  resigned,
  onPlayAgain,
  pointsEarned,
}) => {
  const router = useRouter();
  
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();
  const currentTurn = game.turn();

  const getResult = () => {
    if (resigned) {
      const resignedPlayer = resigned === 'w' ? 'White' : 'Black';
      const winner = resigned === 'w' ? 'Black' : 'White';
      return {
        title: `${resignedPlayer} Resigned`,
        description: `${winner} wins by resignation!`,
        icon: Flag,
        isWin: gameMode === 'vs_computer' && resigned !== playerColor,
        isDraw: false,
      };
    }
    
    if (isCheckmate) {
      const winner = currentTurn === 'w' ? 'Black' : 'White';
      const isPlayerWin = gameMode === 'vs_computer' && 
        ((playerColor === 'w' && currentTurn === 'b') || 
         (playerColor === 'b' && currentTurn === 'w'));
      return {
        title: 'Checkmate!',
        description: `${winner} wins the game!`,
        icon: Crown,
        isWin: isPlayerWin,
        isDraw: false,
      };
    }
    
    if (isStalemate) {
      return {
        title: 'Stalemate!',
        description: 'The game ends in a draw.',
        icon: Handshake,
        isWin: false,
        isDraw: true,
      };
    }
    
    if (isDraw) {
      return {
        title: 'Draw!',
        description: 'The game ends in a draw.',
        icon: Handshake,
        isWin: false,
        isDraw: true,
      };
    }
    
    return {
      title: 'Game Over',
      description: 'The game has ended.',
      icon: Flag,
      isWin: false,
      isDraw: false,
    };
  };

  const result = getResult();
  const ResultIcon = result.icon;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader className="text-center">
          <div className={cn(
            'mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4',
            result.isWin && 'gold-gradient',
            result.isDraw && 'bg-muted',
            !result.isWin && !result.isDraw && 'bg-destructive/20'
          )}>
            <ResultIcon className={cn(
              'w-10 h-10',
              result.isWin && 'text-primary-foreground',
              result.isDraw && 'text-muted-foreground',
              !result.isWin && !result.isDraw && 'text-destructive'
            )} />
          </div>
          <DialogTitle className="text-2xl font-heading">
            {result.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {result.description}
          </DialogDescription>
          
          {pointsEarned !== undefined && pointsEarned > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">
                +{pointsEarned} points earned!
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={onPlayAgain}
            className="w-full gold-gradient text-primary-foreground"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          
          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameOverModal;


