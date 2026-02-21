"use client";

import React from 'react';
import { Chess } from 'chess.js';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Swords, Flag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameStatusProps {
  game: Chess;
  playerColor: 'w' | 'b';
  difficulty?: string;
  gameMode: 'vs_computer' | 'local' | 'online' | 'tournament';
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  game, 
  playerColor, 
  difficulty,
  gameMode 
}) => {
  const isGameOver = game.isGameOver();
  const isCheck = game.inCheck();
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();
  const currentTurn = game.turn();

  const getStatusMessage = () => {
    if (isCheckmate) {
      const winner = currentTurn === 'w' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins!`;
    }
    if (isStalemate) return 'Stalemate! Draw';
    if (isDraw) return 'Draw!';
    if (isCheck) return `${currentTurn === 'w' ? 'White' : 'Black'} is in check!`;
    return `${currentTurn === 'w' ? 'White' : 'Black'}'s turn`;
  };

  const getPlayerLabel = (color: 'w' | 'b') => {
    if (gameMode === 'vs_computer') {
      return color === playerColor ? 'You' : 'Computer';
    }
    if (gameMode === 'local') {
      return color === 'w' ? 'White Player' : 'Black Player';
    }
    return color === 'w' ? 'White' : 'Black';
  };

  return (
    <Card className="glass-card p-4 space-y-4">
      {/* Game Mode Badge */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-primary border-primary">
          {gameMode === 'vs_computer' && `vs Computer (${difficulty})`}
          {gameMode === 'local' && 'Local Game'}
          {gameMode === 'online' && 'Online Match'}
          {gameMode === 'tournament' && 'Tournament Match'}
        </Badge>
        {isGameOver && (
          <Badge className="gold-gradient text-primary-foreground">
            Game Over
          </Badge>
        )}
      </div>

      {/* Status Message */}
      <div className={cn(
        'text-center py-3 rounded-lg font-heading text-lg',
        isCheck && !isCheckmate && 'bg-chess-check/20 text-chess-check',
        isCheckmate && 'gold-gradient text-primary-foreground',
        isStalemate || isDraw ? 'bg-muted text-muted-foreground' : '',
        !isGameOver && !isCheck && 'bg-secondary text-secondary-foreground'
      )}>
        {isCheckmate && <Crown className="inline mr-2 h-5 w-5" />}
        {(isStalemate || isDraw) && <Flag className="inline mr-2 h-5 w-5" />}
        {isCheck && !isCheckmate && <Swords className="inline mr-2 h-5 w-5" />}
        {getStatusMessage()}
      </div>

      {/* Players */}
      <div className="space-y-2">
        {(['w', 'b'] as const).map(color => (
          <div 
            key={color}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg transition-colors',
              currentTurn === color && !isGameOver 
                ? 'bg-primary/20 border border-primary/50' 
                : 'bg-muted/50'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-4 h-4 rounded-full border-2',
                color === 'w' ? 'bg-white border-gray-300' : 'bg-gray-900 border-gray-700'
              )} />
              <span className="font-medium">{getPlayerLabel(color)}</span>
            </div>
            {currentTurn === color && !isGameOver && (
              <Clock className="h-4 w-4 text-primary animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Move History Summary */}
      <div className="text-sm text-muted-foreground text-center">
        Move {Math.ceil(game.history().length / 2)}
      </div>
    </Card>
  );
};

export default GameStatus;


