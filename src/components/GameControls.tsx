"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Flag, Home, Undo, Lightbulb } from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onResign: () => void;
  onUndo?: () => void;
  onGoHome: () => void;
  onHint?: () => void;
  canUndo: boolean;
  isGameOver: boolean;
  showHint?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onResign,
  onUndo,
  onGoHome,
  onHint,
  canUndo,
  isGameOver,
  showHint = false
}) => {
  return (
    <Card className="glass-card p-4">
      <div className="grid grid-cols-2 gap-3">
        {onUndo && (
          <Button
            variant="outline"
            onClick={onUndo}
            disabled={!canUndo || isGameOver}
            className="flex items-center gap-2"
          >
            <Undo className="h-4 w-4" />
            Undo
          </Button>
        )}
        
        {showHint && onHint && (
          <Button
            variant="outline"
            onClick={onHint}
            disabled={isGameOver}
            className="flex items-center gap-2 text-amber-500 border-amber-500/50 hover:bg-amber-500/10"
          >
            <Lightbulb className="h-4 w-4" />
            Hint
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={onNewGame}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          New Game
        </Button>
        
        <Button
          variant="destructive"
          onClick={onResign}
          disabled={isGameOver}
          className="flex items-center gap-2"
        >
          <Flag className="h-4 w-4" />
          Resign
        </Button>
        
        <Button
          variant="secondary"
          onClick={onGoHome}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Menu
        </Button>
      </div>
    </Card>
  );
};

export default GameControls;


