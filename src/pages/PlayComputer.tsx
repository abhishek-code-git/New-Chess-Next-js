"use client";

import React, { useState, useCallback, useEffect } from 'react';
import AdSlot from '@/components/AdSlot';
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
import { Helmet } from "react-helmet-async";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getBestMove } from '@/lib/chess-ai';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Bot, Crown, Swords, AlertTriangle } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';
type PlayerColor = 'w' | 'b' | 'random';

const PlayComputer: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateStats } = useProfile();
  const { toast } = useToast();

  const [gameStarted, setGameStarted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('w');
  const [isThinking, setIsThinking] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [animatingMove, setAnimatingMove] = useState<{ from: Square; to: Square } | null>(null);
  const [resigned, setResigned] = useState<'w' | 'b' | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  const handleStartClick = () => {
    if (!user) {
      setShowLoginWarning(true);
    } else {
      startGame();
    }
  };

  const startGame = () => {
    setShowLoginWarning(false);
    const newGame = new Chess();
    let color: 'w' | 'b' = selectedColor === 'random' 
      ? (Math.random() > 0.5 ? 'w' : 'b') 
      : selectedColor;
    
    setPlayerColor(color);
    setGame(newGame);
    setGameStarted(true);
    setGameEnded(false);
    setAnimatingMove(null);
    setResigned(null);
    setShowGameOver(false);
    setPointsEarned(0);

    // Notify ad manager that gameplay is active (pause ad refresh)
    if (window.ChessAdManager?.setGameplayActive) {
      window.ChessAdManager.setGameplayActive(true);
    }

    // If player is black, make computer move first
    if (color === 'b') {
      setTimeout(() => makeComputerMove(newGame), 50);
    }
  };

  const makeComputerMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver()) return;
    
    setIsThinking(true);
    
    // Let the UI paint the "thinking" state before compute (keeps it feeling instant)
    setTimeout(() => {
      const bestMove = getBestMove(currentGame, difficulty);
      if (bestMove) {
        // Start animation
        setAnimatingMove({ from: bestMove.from as Square, to: bestMove.to as Square });

        // Quick animation for snappy feel
        setTimeout(() => {
          currentGame.move(bestMove);
          setGame(new Chess(currentGame.fen()));
          setAnimatingMove(null);
          setIsThinking(false);
        }, 80);
      } else {
        setIsThinking(false);
      }
    }, 0);
  }, [difficulty]);

  const handlePlayerMove = useCallback((move: Move) => {
    // ChessBoard already applied the move via game.move(), just sync state
    const newGame = new Chess(game.fen());
    setGame(newGame);
    
    // Check if game is over after player's move
    if (!newGame.isGameOver()) {
      setTimeout(() => makeComputerMove(newGame), 50);
    }
  }, [game, makeComputerMove]);

  // Handle game end
  useEffect(() => {
    if ((game.isGameOver() || resigned) && !gameEnded && gameStarted) {
      setGameEnded(true);
      
      const isPlayerWhite = playerColor === 'w';
      const isCheckmate = game.isCheckmate();
      const isDraw = game.isDraw();
      
      let earnedPoints = 0;
      
      if (resigned === playerColor) {
        // Player resigned - loss
        if (user && profile) {
          updateStats.mutate({ won: false, pointsEarned: 0 });
        }
      } else if (resigned) {
        // Computer resigned (not implemented but for completeness)
        earnedPoints = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
        if (user && profile) {
          updateStats.mutate({ won: true, pointsEarned: earnedPoints });
        }
      } else if (isDraw) {
        earnedPoints = 5;
        if (user && profile) {
          updateStats.mutate({ won: false, draw: true, pointsEarned: earnedPoints });
        }
      } else if (isCheckmate) {
        const whiteWins = game.turn() === 'b';
        const playerWon = (isPlayerWhite && whiteWins) || (!isPlayerWhite && !whiteWins);
        
        if (playerWon) {
          earnedPoints = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
          if (user && profile) {
            updateStats.mutate({ won: true, pointsEarned: earnedPoints });
          }
        } else {
          if (user && profile) {
            updateStats.mutate({ won: false, pointsEarned: 0 });
          }
        }
      }
      
      setPointsEarned(earnedPoints);
      setTimeout(() => setShowGameOver(true), 500);
    }
  }, [game, gameEnded, gameStarted, playerColor, difficulty, user, profile, updateStats, resigned]);

  const handleUndo = () => {
    // Undo both player and computer moves
    game.undo();
    game.undo();
    setGame(new Chess(game.fen()));
  };

  const handleResign = () => {
    setResigned(playerColor);
  };

  const handleNewGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setGame(new Chess());
    setAnimatingMove(null);
    setResigned(null);
    setShowGameOver(false);
    setPointsEarned(0);

    // Notify ad manager that gameplay ended (resume ad refresh)
    if (window.ChessAdManager?.setGameplayActive) {
      window.ChessAdManager.setGameplayActive(false);
    }
  };

  const handlePlayAgain = () => {
    setShowGameOver(false);
    startGame();
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Free Chess Game vs Computer | Play Online – Chess Masters"
          description="Play a free chess game vs computer online. Practice against AI with easy, medium, and hard levels. No signup required."
          canonical="https://chessmasterss.vercel.app/play/computer"
          

        />
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
          <div className="max-w-md mx-auto">
            <Card className="glass-card p-5 sm:p-8 animate-slide-up">
            <div className="sr-only">

              {/* For SEO Content*/ }
            
               <h2>Play Chess Online Against Computer</h2>
                   <p>
                      Play chess online for free against a smart computer AI. 
                      Choose easy, medium, or hard difficulty and improve your chess skills.
                      This online chess game works directly in your browser with no download.
                  </p>
                    <p>
                Chess Masters lets you play chess vs computer, practice openings,
                improve tactics, and enjoy fast gameplay on mobile and desktop.
              </p>
            </div>

              <div className="text-center mb-6 sm:mb-8">
                <Bot className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-3 sm:mb-4" />
                <h1 className="font-heading text-2xl sm:text-3xl mb-2">Play vs Computer</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Challenge our AI and earn points!
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (5 points)</SelectItem>
                      <SelectItem value="medium">Medium (10 points)</SelectItem>
                      <SelectItem value="hard">Hard (15 points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Play as</Label>
                  <Select value={selectedColor} onValueChange={(v) => setSelectedColor(v as PlayerColor)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="w">White</SelectItem>
                      <SelectItem value="b">Black</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleStartClick}
                  className="w-full gold-gradient text-primary-foreground text-base sm:text-lg py-5 sm:py-6 h-auto"
                >
                  <Swords className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Game
                </Button>

                {!user && (
                  <p className="text-center text-xs sm:text-sm text-muted-foreground">
                    <button 
                      onClick={() => router.push('/auth')}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </button>
                    {' '}to earn and save points!
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Login Warning Dialog */}
        <AlertDialog open={showLoginWarning} onOpenChange={setShowLoginWarning}>
          <AlertDialogContent className="glass-card border-primary/20 mx-4 max-w-[calc(100vw-2rem)] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-500 text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Points Won't Be Saved
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm sm:text-base">
                You're not logged in. Any points you earn from this game will <strong>not be saved</strong> to your account.
                <br /><br />
                Would you like to sign in first to track your progress and earn rewards?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel 
                onClick={() => router.push('/auth')}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                Sign In
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={startGame}
                className="w-full sm:w-auto gold-gradient h-11 sm:h-10"
              >
                Play Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Play Chess vs Computer - AI Chess Game"
        description="Challenge our chess AI with adjustable difficulty levels. Play as white or black, earn points for victories!"
        canonical="https://chessmasterss.vercel.app/play/computer"

      />
      <Navbar />
      <div className="container mx-auto px-2 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-12">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start justify-center">
          {/* Board */}
          <div className="w-full max-w-[min(100vw-1rem,28rem)] sm:max-w-lg lg:max-w-xl mx-auto lg:mx-0">
            {isThinking && (
              <div className="text-center mb-2 text-muted-foreground animate-pulse text-sm sm:text-base">
                <Bot className="inline mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Computer is thinking...
              </div>
            )}
            <ChessBoard
              game={game}
              onMove={handlePlayerMove}
              playerColor={playerColor}
              disabled={game.turn() !== playerColor || game.isGameOver() || isThinking}
              animatingMove={animatingMove}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-3 sm:space-y-4 px-1 sm:px-0">
            <GameStatus
              game={game}
              playerColor={playerColor}
              difficulty={difficulty}
              gameMode="vs_computer"
            />
            
            <GameControls
              onNewGame={handleNewGame}
              onResign={handleResign}
              onUndo={handleUndo}
              onGoHome={() => router.push('/')}
              canUndo={game.history().length >= 2}
              isGameOver={game.isGameOver()}
            />
            
            <MoveHistory history={game.history()} />

            {user && profile && (
              <Card className="glass-card p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm sm:text-base">Your Points</span>
                  <span className="font-heading text-lg sm:text-xl text-primary">
                    <Crown className="inline mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {profile.points}
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <GameOverModal
        game={game}
        isOpen={showGameOver}
        playerColor={playerColor}
        gameMode="vs_computer"
        resigned={resigned}
        onPlayAgain={handlePlayAgain}
        pointsEarned={pointsEarned}
      />
      {/* Ad slot */}
      <AdSlot className="mt-4" />
    </div>
  );
};

export default PlayComputer;


