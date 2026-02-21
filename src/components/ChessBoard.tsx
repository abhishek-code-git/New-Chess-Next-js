"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PIECE_COMPONENTS, getPieceCode } from '@/lib/chess-pieces';
import { cn } from '@/lib/utils';
import { useChessSound } from '@/hooks/useChessSound';

interface ChessBoardProps {
  game: Chess;
  onMove: (move: Move) => void;
  playerColor?: 'w' | 'b';
  disabled?: boolean;
  flipBoard?: boolean;
  animatingMove?: { from: Square; to: Square } | null;
  hintSquares?: { from: Square; to: Square } | null;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  game, 
  onMove, 
  playerColor = 'w',
  disabled = false,
  flipBoard = true,
  animatingMove = null,
  hintSquares = null
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [animating, setAnimating] = useState<{ from: Square; to: Square; piece: any } | null>(null);
  const [animationType, setAnimationType] = useState<'move' | 'capture'>('move');
  const { playSound } = useChessSound();
  const boardRef = useRef<HTMLDivElement>(null);

  const isFlipped = flipBoard && playerColor === 'b';
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = isFlipped ? [...RANKS].reverse() : RANKS;

  // Handle external animation (AI moves)
  useEffect(() => {
    if (animatingMove) {
      const piece = game.get(animatingMove.from);
      const targetPiece = game.get(animatingMove.to);
      if (piece) {
        setAnimating({ ...animatingMove, piece });
        setAnimationType(targetPiece ? 'capture' : 'move');
      }
    } else {
      setAnimating(null);
    }
  }, [animatingMove, game]);

  const getSquarePosition = (square: Square) => {
    const file = square[0];
    const rank = square[1];
    const fileIndex = isFlipped ? 7 - FILES.indexOf(file) : FILES.indexOf(file);
    const rankIndex = isFlipped ? 7 - RANKS.indexOf(rank) : RANKS.indexOf(rank);
    return { x: fileIndex * 12.5, y: rankIndex * 12.5 };
  };

  const handleSquareClick = useCallback((square: Square) => {
    if (disabled) return;
    
    const piece = game.get(square);
    const isCurrentPlayerTurn = game.turn() === playerColor;
    
    if (selectedSquare) {
      // Try to make a move
      if (legalMoves.includes(square)) {
        try {
          // Check for promotion
          const movingPiece = game.get(selectedSquare);
          let promotion: 'q' | 'r' | 'b' | 'n' | undefined;
          
          if (movingPiece?.type === 'p') {
            const targetRank = square[1];
            if ((movingPiece.color === 'w' && targetRank === '8') || 
                (movingPiece.color === 'b' && targetRank === '1')) {
              promotion = 'q'; // Auto-promote to queen
            }
          }
          
          const targetPiece = game.get(square);
          
          const move = game.move({
            from: selectedSquare,
            to: square,
            promotion
          });
          
          if (move) {
            setLastMove({ from: selectedSquare, to: square });
            setAnimationType(targetPiece ? 'capture' : 'move');
            
            // Play appropriate sound
            if (game.isCheck()) {
              playSound('check');
            } else if (move.captured) {
              playSound('capture');
            } else if (move.flags.includes('k') || move.flags.includes('q')) {
              playSound('castle');
            } else {
              playSound('move');
            }
            
            onMove(move);
          }
        } catch (e) {
          console.log('Invalid move');
        }
      }
      setSelectedSquare(null);
      setLegalMoves([]);
    } else if (piece && piece.color === game.turn() && isCurrentPlayerTurn) {
      // Select piece
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to as Square));
    }
  }, [game, selectedSquare, legalMoves, onMove, playerColor, disabled, playSound]);

  const isSquareLight = (file: string, rank: string): boolean => {
    const fileIndex = FILES.indexOf(file);
    const rankIndex = RANKS.indexOf(rank);
    return (fileIndex + rankIndex) % 2 === 0;
  };

  const getSquareClasses = (square: Square, isLight: boolean): string => {
    const isSelected = selectedSquare === square;
    const isLegalMove = legalMoves.includes(square);
    const isLastMoveSquare = lastMove?.from === square || lastMove?.to === square;
    const isHintSquare = hintSquares?.from === square || hintSquares?.to === square;
    const piece = game.get(square);
    const isInCheck = piece?.type === 'k' && game.inCheck() && piece.color === game.turn();

    return cn(
      'relative aspect-square flex items-center justify-center transition-all duration-200',
      isLight ? 'bg-chess-light' : 'bg-chess-dark',
      isSelected && 'ring-2 sm:ring-4 ring-chess-selected ring-inset',
      isLastMoveSquare && 'bg-opacity-80',
      isHintSquare && 'ring-2 sm:ring-4 ring-amber-400 ring-inset animate-pulse',
      isInCheck && 'bg-chess-check',
      !disabled && 'cursor-pointer active:scale-95 sm:hover:brightness-110'
    );
  };

  // Update lastMove when external animation completes
  useEffect(() => {
    if (animatingMove) {
      const timer = setTimeout(() => {
        setLastMove(animatingMove);
        playSound('move');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animatingMove, playSound]);

  return (
    <div className="relative w-full max-w-[min(calc(100vw-1.5rem),28rem)] sm:max-w-[min(calc(100vw-2rem),32rem)] mx-auto">
      {/* Board frame */}
      <div className="p-1 sm:p-1.5 md:p-3 rounded-lg bg-gradient-to-br from-wood-light to-wood-dark shadow-xl sm:shadow-2xl">
        {/* Coordinate labels - top (hidden on very small screens) */}
        <div className="hidden xs:flex mb-0.5">
          <div className="w-3 sm:w-4 md:w-5" />
          {displayFiles.map(file => (
            <div key={file} className="flex-1 text-center text-[8px] sm:text-[10px] md:text-xs font-heading text-foreground/70">
              {file}
            </div>
          ))}
          <div className="w-3 sm:w-4 md:w-5" />
        </div>

        <div className="flex">
          {/* Coordinate labels - left (hidden on very small screens) */}
          <div className="hidden xs:flex flex-col justify-around w-3 sm:w-4 md:w-5">
            {displayRanks.map(rank => (
              <div key={rank} className="text-center text-[8px] sm:text-[10px] md:text-xs font-heading text-foreground/70">
                {rank}
              </div>
            ))}
          </div>

          {/* Board */}
          <div ref={boardRef} className="relative grid grid-cols-8 gap-0 rounded overflow-hidden shadow-inner flex-1 aspect-square touch-manipulation">
            {displayRanks.map(rank => 
              displayFiles.map(file => {
                const square = `${file}${rank}` as Square;
                const piece = game.get(square);
                const isLight = isSquareLight(file, rank);
                const isLegalMove = legalMoves.includes(square);
                const hasPiece = piece !== null;
                const isAnimatingFrom = animating?.from === square;
                const isLastMoveTo = lastMove?.to === square;

                return (
                  <div
                    key={square}
                    className={getSquareClasses(square, isLight)}
                    onClick={() => handleSquareClick(square)}
                  >
                    {/* Legal move indicator */}
                    {isLegalMove && (
                      <div className={cn(
                        'absolute inset-0 flex items-center justify-center z-10',
                        hasPiece ? 'pointer-events-none' : ''
                      )}>
                        {hasPiece ? (
                          <div className="absolute inset-1 sm:inset-0 border-2 sm:border-4 border-chess-highlight/60 rounded-full" />
                        ) : (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-chess-highlight/50" />
                        )}
                      </div>
                    )}
                    
                    {/* Piece - hide if animating from this square */}
                    {piece && !isAnimatingFrom && (
                      <div className={cn(
                        "chess-piece w-[75%] h-[75%] sm:w-[80%] sm:h-[80%] drop-shadow-md sm:drop-shadow-lg z-20",
                        isLastMoveTo && animationType === 'move' && "animate-piece-move",
                        isLastMoveTo && animationType === 'capture' && "animate-piece-capture"
                      )}>
                        {React.createElement(PIECE_COMPONENTS[getPieceCode(piece)])}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Animating piece overlay */}
            {animating && (
              <div 
                className="absolute z-30 w-[12.5%] h-[12.5%] pointer-events-none"
                style={{
                  left: `${getSquarePosition(animating.to).x}%`,
                  top: `${getSquarePosition(animating.to).y}%`,
                  animation: 'pieceSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                }}
              >
                <div className="chess-piece w-[75%] h-[75%] sm:w-[80%] sm:h-[80%] m-[10%] drop-shadow-lg">
                  {React.createElement(PIECE_COMPONENTS[getPieceCode(animating.piece)])}
                </div>
              </div>
            )}
          </div>

          {/* Coordinate labels - right (hidden on very small screens) */}
          <div className="hidden xs:flex flex-col justify-around w-3 sm:w-4 md:w-5">
            {displayRanks.map(rank => (
              <div key={rank} className="text-center text-[8px] sm:text-[10px] md:text-xs font-heading text-foreground/70">
                {rank}
              </div>
            ))}
          </div>
        </div>

        {/* Coordinate labels - bottom (hidden on very small screens) */}
        <div className="hidden xs:flex mt-0.5">
          <div className="w-3 sm:w-4 md:w-5" />
          {displayFiles.map(file => (
            <div key={file} className="flex-1 text-center text-[8px] sm:text-[10px] md:text-xs font-heading text-foreground/70">
              {file}
            </div>
          ))}
          <div className="w-3 sm:w-4 md:w-5" />
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;


