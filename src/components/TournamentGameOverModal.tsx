"use client";

import React from 'react';
import { Chess } from 'chess.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Flag, Handshake, Trophy, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TournamentGameOverModalProps {
  game: Chess;
  isOpen: boolean;
  playerColor: 'w' | 'b';
  result: string | null;
  onClose: () => void;
  pointsAwarded?: number;
  opponentName: string;
}

const TournamentGameOverModal: React.FC<TournamentGameOverModalProps> = ({
  game,
  isOpen,
  playerColor,
  result,
  onClose,
  pointsAwarded,
  opponentName,
}) => {
  const getResultInfo = () => {
    if (!result) return { title: 'Game Over', description: '', icon: Flag, isWin: false, isDraw: false };

    const isCheckmate = game.isCheckmate();
    
    if (result === '1-0') {
      const isWin = playerColor === 'w';
      return {
        title: isCheckmate ? 'Checkmate!' : (isWin ? 'You Win!' : 'You Lost'),
        description: isWin ? `You defeated ${opponentName}!` : `${opponentName} wins the game`,
        icon: isWin ? Crown : Flag,
        isWin,
        isDraw: false,
      };
    }
    if (result === '0-1') {
      const isWin = playerColor === 'b';
      return {
        title: isCheckmate ? 'Checkmate!' : (isWin ? 'You Win!' : 'You Lost'),
        description: isWin ? `You defeated ${opponentName}!` : `${opponentName} wins the game`,
        icon: isWin ? Crown : Flag,
        isWin,
        isDraw: false,
      };
    }
    return {
      title: 'Draw!',
      description: 'The game ends in a draw',
      icon: Handshake,
      isWin: false,
      isDraw: true,
    };
  };

  const info = getResultInfo();
  const ResultIcon = info.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader className="text-center">
          <div className={cn(
            'mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4',
            info.isWin && 'gold-gradient',
            info.isDraw && 'bg-muted',
            !info.isWin && !info.isDraw && 'bg-destructive/20'
          )}>
            <ResultIcon className={cn(
              'w-10 h-10',
              info.isWin && 'text-primary-foreground',
              info.isDraw && 'text-muted-foreground',
              !info.isWin && !info.isDraw && 'text-destructive'
            )} />
          </div>
          <DialogTitle className="text-2xl font-heading">
            {info.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {info.description}
          </DialogDescription>

          {pointsAwarded !== undefined && pointsAwarded > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">
                +{pointsAwarded} bonus points awarded!
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={onClose} className="w-full gold-gradient text-primary-foreground" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournament
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentGameOverModal;


