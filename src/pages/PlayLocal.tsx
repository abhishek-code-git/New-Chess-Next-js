"use client";

import React, { useState, useCallback } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { useRouter } from 'next/navigation';
import ChessBoard from '@/components/ChessBoard';
import GameStatus from '@/components/GameStatus';
import GameControls from '@/components/GameControls';
import MoveHistory from '@/components/MoveHistory';
import GameOverModal from '@/components/GameOverModal';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Monitor, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHintMove } from '@/lib/chess-ai';
import { useToast } from '@/hooks/use-toast';

const PlayLocal: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [resigned, setResigned] = useState<'w' | 'b' | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [hintSquares, setHintSquares] = useState<{ from: Square; to: Square } | null>(null);

  const isGameOver = game.isGameOver() || resigned !== null;

  const startGame = () => {
    setGame(new Chess());
    setGameStarted(true);
    setResigned(null);
    setShowGameOver(false);
    setHintSquares(null);

    // Notify ad manager that gameplay is active
    if (window.ChessAdManager?.setGameplayActive) {
      window.ChessAdManager.setGameplayActive(true);
    }
  };

  const handleMove = useCallback((move: Move) => {
    setGame(new Chess(game.fen()));
    setHintSquares(null);
  }, [game]);

  const handleUndo = () => {
    game.undo();
    setGame(new Chess(game.fen()));
    setHintSquares(null);
  };

  const handleNewGame = () => {
    setGame(new Chess());
    setResigned(null);
    setShowGameOver(false);
    setHintSquares(null);

    // Notify ad manager gameplay ended
    if (window.ChessAdManager?.setGameplayActive) {
      window.ChessAdManager.setGameplayActive(false);
    }
  };

  const handleHint = () => {
    const hintMove = getHintMove(game);
    if (hintMove) {
      setHintSquares({ from: hintMove.from as Square, to: hintMove.to as Square });
      toast({
        title: "Hint",
        description: `Try moving from ${hintMove.from} to ${hintMove.to}`,
      });
    }
  };

  const handleResign = () => {
    setResigned(game.turn());
    setShowGameOver(true);
  };

  const handlePlayAgain = () => {
    setShowGameOver(false);
    startGame();
  };

  // Show game over modal when game ends
  React.useEffect(() => {
    if (game.isGameOver() && gameStarted && !showGameOver) {
      setTimeout(() => setShowGameOver(true), 500);
    }
  }, [game, gameStarted, showGameOver]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Local Chess Game - Play 2 Player Chess on Same Device"
          description="Play chess with a friend on the same device. Free local 2-player chess game with no sign-up required."
          canonical="https://chessmaster.app/play/local"
        />
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-md mx-auto">
            <Card className="glass-card p-8 animate-slide-up">
              <div className="text-center mb-8">
                <Monitor className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="font-heading text-3xl mb-2">Local Game</h1>
                <p className="text-muted-foreground">
                  Play with a friend on the same device
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    White moves first. Take turns making moves on the same screen.
                  </p>
                </div>

                <Button 
                  onClick={startGame}
                  className="w-full gold-gradient text-primary-foreground text-lg py-6"
                >
                  <Swords className="mr-2 h-5 w-5" />
                  Start Game
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Local Chess Game - Play 2 Player Chess"
        description="Play chess with a friend on the same device. Free local 2-player chess game."
        canonical="https://chessmaster.app/play/local"
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Board - never flip for local play */}
          <div className="w-full max-w-lg lg:max-w-xl">
            <div className="text-center mb-2">
              <span className={cn(
                "inline-block px-3 py-1 rounded-full text-sm font-medium",
                game.turn() === 'w' ? "bg-white text-black" : "bg-gray-800 text-white"
              )}>
                {game.turn() === 'w' ? 'White' : 'Black'}&apos;s turn
              </span>
            </div>
            <ChessBoard
              game={game}
              onMove={handleMove}
              playerColor={game.turn()}
              flipBoard={false}
              disabled={isGameOver}
              hintSquares={hintSquares}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            <GameStatus
              game={game}
              playerColor="w"
              gameMode="local"
            />
            
            <GameControls
              onNewGame={handleNewGame}
              onResign={handleResign}
              onUndo={handleUndo}
              onGoHome={() => router.push('/')}
              onHint={handleHint}
              canUndo={game.history().length > 0}
              isGameOver={isGameOver}
              showHint={true}
            />
            
            <MoveHistory history={game.history()} />
          </div>
        </div>
      </div>

      <GameOverModal
        game={game}
        isOpen={showGameOver}
        playerColor="w"
        gameMode="local"
        resigned={resigned}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
};

export default PlayLocal;


