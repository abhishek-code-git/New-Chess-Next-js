"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { useRouter } from 'next/navigation';
import ChessBoard from '@/components/ChessBoard';
import GameStatus from '@/components/GameStatus';
import GameControls from '@/components/GameControls';
import MoveHistory from '@/components/MoveHistory';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getHintMove } from '@/lib/chess-ai';
import { 
  Users, 
  Swords, 
  Copy, 
  Check, 
  Loader2,
  Globe,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

type GameState = 'lobby' | 'waiting' | 'playing' | 'ended';

interface OnlineGame {
  id: string;
  playerWhite: string;
  playerBlack: string | null;
  fen: string;
  pgn: string;
  status: 'waiting' | 'playing' | 'ended';
  turn: 'w' | 'b';
  result: string | null;
}

interface ActiveRoom {
  code: string;
  creatorId: string;
  creatorUsername: string;
  creatorWins: number;
  creatorTotalGames: number;
  createdAt: Date;
}

const PlayOnline: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<GameState>('lobby');
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animatingMove, setAnimatingMove] = useState<{ from: Square; to: Square } | null>(null);
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [hintSquares, setHintSquares] = useState<{ from: Square; to: Square } | null>(null);

  // Generate a room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Listen for active rooms
  useEffect(() => {
    if (gameState !== 'lobby') return;

    const channel = supabase
      .channel('active-rooms')
      .on('broadcast', { event: 'room-created' }, (payload) => {
        const { code, creatorId, creatorUsername, creatorWins, creatorTotalGames, createdAt } = payload.payload;
        setActiveRooms(prev => {
          if (prev.find(r => r.code === code)) return prev;
          return [...prev, { 
            code, 
            creatorId, 
            creatorUsername, 
            creatorWins: creatorWins || 0, 
            creatorTotalGames: creatorTotalGames || 0, 
            createdAt: new Date(createdAt) 
          }];
        });
      })
      .on('broadcast', { event: 'room-closed' }, (payload) => {
        const { code } = payload.payload;
        setActiveRooms(prev => prev.filter(r => r.code !== code));
      })
      .on('broadcast', { event: 'room-joined' }, (payload) => {
        const { code } = payload.payload;
        setActiveRooms(prev => prev.filter(r => r.code !== code));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameState]);

  // Create a new game room
  const createRoom = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to play online.",
        variant: "destructive",
      });
      router.push('/auth');
      return;
    }

    setIsLoading(true);
    
    // Fetch user profile for username and stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, wins, total_games')
      .eq('user_id', user.id)
      .maybeSingle();

    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);
    setPlayerColor('w');
    setGameState('waiting');
    setGame(new Chess());
    setGameId(newRoomCode);
    setIsLoading(false);

    // Broadcast room creation with profile info
    supabase.channel('active-rooms').send({
      type: 'broadcast',
      event: 'room-created',
      payload: { 
        code: newRoomCode, 
        creatorId: user.id,
        creatorUsername: profile?.username || 'Player',
        creatorWins: profile?.wins || 0,
        creatorTotalGames: profile?.total_games || 0,
        createdAt: new Date().toISOString() 
      },
    });

    toast({
      title: "Room created!",
      description: "Share the room code with your friend.",
    });
  };

  // Join an existing room
  const joinRoom = async (code?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to play online.",
        variant: "destructive",
      });
      router.push('/auth');
      return;
    }

    const codeToJoin = code || roomCode;
    if (!codeToJoin.trim()) {
      toast({
        title: "Enter room code",
        description: "Please enter a valid room code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPlayerColor('b');
    setRoomCode(codeToJoin.toUpperCase());
    setGameId(codeToJoin.toUpperCase());
    setGameState('playing');
    setOpponentConnected(true);
    setIsLoading(false);

    // Notify ad manager that gameplay is active
    if (window.ChessAdManager?.setGameplayActive) {
      window.ChessAdManager.setGameplayActive(true);
    }

    // Broadcast room joined
    supabase.channel('active-rooms').send({
      type: 'broadcast',
      event: 'room-joined',
      payload: { code: codeToJoin.toUpperCase() },
    });

    toast({
      title: "Joined room!",
      description: "Game is starting...",
    });
  };

  // Copy room code to clipboard
  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Realtime subscription for game updates
  useEffect(() => {
    if (!gameId || gameState === 'lobby') return;

    const channel = supabase
      .channel(`game-${gameId}`)
      .on('broadcast', { event: 'move' }, (payload) => {
        const { from, to, fen } = payload.payload;
        
        if (from && to) {
          // Animate the opponent's move
          setAnimatingMove({ from: from as Square, to: to as Square });
          
          setTimeout(() => {
            setGame(new Chess(fen));
            setAnimatingMove(null);
          }, 350);
        }
      })
      .on('broadcast', { event: 'player-joined' }, () => {
        setOpponentConnected(true);
        setGameState('playing');
        
        // Notify ad manager that gameplay is active
        if (window.ChessAdManager?.setGameplayActive) {
          window.ChessAdManager.setGameplayActive(true);
        }
        
        toast({
          title: "Opponent joined!",
          description: "The game is starting.",
        });
      })
      .on('broadcast', { event: 'resign' }, () => {
        toast({
          title: "Opponent resigned!",
          description: "You win!",
        });
        setGameState('ended');
      })
      .subscribe();

    // Notify room that we joined
    if (playerColor === 'b') {
      channel.send({
        type: 'broadcast',
        event: 'player-joined',
        payload: { playerId: user?.id },
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, gameState, playerColor, user, toast]);

  // Handle player move
  const handleMove = useCallback((move: Move) => {
    const newGame = new Chess(game.fen());
    setGame(newGame);
    setHintSquares(null);

    // Broadcast move to opponent
    if (gameId) {
      supabase.channel(`game-${gameId}`).send({
        type: 'broadcast',
        event: 'move',
        payload: {
          from: move.from,
          to: move.to,
          fen: newGame.fen(),
        },
      });
    }

    // Check for game end
    if (newGame.isGameOver()) {
      setGameState('ended');
    }
  }, [game, gameId]);

  const handleHint = () => {
    if (game.turn() !== playerColor) return;
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
    if (gameId) {
      supabase.channel(`game-${gameId}`).send({
        type: 'broadcast',
        event: 'resign',
        payload: { playerId: user?.id },
      });
    }
    
    toast({
      title: "You resigned",
      description: "Your opponent wins.",
      variant: "destructive",
    });
    setGameState('ended');
  };

  const handleNewGame = () => {
    // Broadcast room closed if we were the creator
    if (gameId && playerColor === 'w') {
      supabase.channel('active-rooms').send({
        type: 'broadcast',
        event: 'room-closed',
        payload: { code: gameId },
      });
    }
    
    // Notify ad manager gameplay ended
    if (window.ChessAdManager?.setGameplayActive) {
      window.ChessAdManager.setGameplayActive(false);
    }
    
    setGameState('lobby');
    setGame(new Chess());
    setGameId(null);
    setRoomCode('');
    setOpponentConnected(false);
    setAnimatingMove(null);
  };

  // Lobby screen
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Play Chess Online - Multiplayer Chess Game"
          description="Play chess online with friends in real-time. Create a room or join an existing game. Free online multiplayer chess!"
          canonical="https://chessmaster.app/play/online"
        />
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-md mx-auto">
            <Card className="glass-card p-8 animate-slide-up">
              <div className="text-center mb-8">
                <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="font-heading text-3xl mb-2">Online Match</h1>
                <p className="text-muted-foreground">
                  Play with friends online
                </p>
              </div>

              <div className="space-y-6">
                {/* Create Room */}
                <div className="space-y-3">
                  <Button 
                    onClick={createRoom}
                    disabled={isLoading}
                    className="w-full gold-gradient text-primary-foreground text-lg py-6"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-5 w-5" />
                    )}
                    Create Room
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or join existing
                    </span>
                  </div>
                </div>

                {/* Join Room */}
                <div className="space-y-3">
                  <Label>Room Code</Label>
                  <Input
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="text-center text-lg uppercase tracking-widest"
                    maxLength={6}
                  />
                  <Button 
                    onClick={() => joinRoom()}
                    disabled={isLoading || !roomCode.trim()}
                    variant="outline"
                    className="w-full text-lg py-6"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Users className="mr-2 h-5 w-5" />
                    )}
                    Join Room
                  </Button>
                </div>

                {!user && (
                  <p className="text-center text-sm text-muted-foreground">
                    <button 
                      onClick={() => router.push('/auth')}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </button>
                    {' '}to play online matches!
                  </p>
                )}

                {/* Active Rooms */}
                {activeRooms.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Active Rooms
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {activeRooms.map((room) => (
                        <div 
                          key={room.code}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary">{room.code}</span>
                              <span className="text-sm font-medium truncate">{room.creatorUsername}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {room.creatorWins}W / {room.creatorTotalGames} games
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => joinRoom(room.code)}
                            disabled={isLoading}
                          >
                            Join
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for opponent
  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Play Chess Online - Waiting for Opponent"
          description="Your chess room is ready. Share the code with a friend to start playing!"
          canonical="https://chessmaster.app/play/online"
        />
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-md mx-auto">
            <Card className="glass-card p-8 animate-slide-up text-center">
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
              <h1 className="font-heading text-2xl mb-4">Waiting for opponent...</h1>
              <p className="text-muted-foreground mb-6">
                Share this room code with your friend:
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="font-mono text-3xl tracking-widest text-primary font-bold">
                  {roomCode}
                </div>
              </div>

              <Button 
                onClick={copyRoomCode}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Room Code
                  </>
                )}
              </Button>

              <Button 
                onClick={handleNewGame}
                variant="ghost"
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Play Chess Online - Live Game"
        description="Play chess online in real-time against your opponent!"
        canonical="https://chessmaster.app/play/online"
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Board */}
          <div className="w-full max-w-lg lg:max-w-xl">
            <div className="text-center mb-2">
              <span className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                game.turn() === playerColor 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {game.turn() === playerColor ? (
                  <>
                    <Swords className="h-4 w-4" />
                    Your turn
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opponent's turn
                  </>
                )}
              </span>
            </div>
            <ChessBoard
              game={game}
              onMove={handleMove}
              playerColor={playerColor}
              disabled={game.turn() !== playerColor || game.isGameOver()}
              animatingMove={animatingMove}
              hintSquares={hintSquares}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            <Card className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Room Code</span>
                <span className="font-mono font-bold text-primary">{gameId}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  opponentConnected ? "bg-green-500" : "bg-yellow-500"
                )} />
                <span className="text-sm">
                  {opponentConnected ? "Opponent connected" : "Waiting..."}
                </span>
              </div>
            </Card>

            <GameStatus
              game={game}
              playerColor={playerColor}
              gameMode="online"
            />
            
            <GameControls
              onNewGame={handleNewGame}
              onResign={handleResign}
              onGoHome={() => router.push('/')}
              onHint={handleHint}
              canUndo={false}
              isGameOver={game.isGameOver()}
              showHint={game.turn() === playerColor}
            />
            
            <MoveHistory history={game.history()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayOnline;


