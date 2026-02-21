import { Chess, Move } from 'chess.js';

type Difficulty = 'easy' | 'medium' | 'hard';

// Optimized chess AI - faster with better pruning and engaging gameplay

// Piece values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Combined position tables for all pieces
const POSITION_TABLES: Record<string, number[]> = {
  p: [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 27, 27, 10,  5,  5,
    0,  0,  0, 25, 25,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-25,-25, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ],
  r: [
    0,  0,  0,  5,  5,  0,  0,  0,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    5, 10, 10, 10, 10, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  5,  0,-10,
    -10,  0,  5,  5,  5,  5,  5,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    -5,  0,  5,  5,  5,  5,  0, -5,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
  ]
};

// King endgame table - encourage centralization
const KING_ENDGAME_TABLE = [
  -50,-30,-30,-30,-30,-30,-30,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50
];

// Cache for transposition table
const transpositionTable = new Map<
  string,
  { depth: number; score: number; flag: 'exact' | 'lower' | 'upper' }
>();
const MAX_TABLE_SIZE = 50000;

// Soft time limit for search (set per getBestMove call)
let searchDeadline = 0;
function isTimeUp() {
  return searchDeadline !== 0 && Date.now() >= searchDeadline;
}

function getMoveKey(move: Move) {
  return `${move.from}${move.to}${move.promotion ?? ''}`;
}
function getPositionBonus(piece: string, index: number, isWhite: boolean, isEndgame: boolean): number {
  let table = POSITION_TABLES[piece];
  if (!table) return 0;
  
  // Use endgame table for king
  if (piece === 'k' && isEndgame) {
    table = KING_ENDGAME_TABLE;
  }
  
  const adjustedIndex = isWhite ? 63 - index : index;
  return table[adjustedIndex] || 0;
}

function isEndgame(game: Chess): boolean {
  const board = game.board();
  let queens = 0;
  let minorPieces = 0;
  
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        if (piece.type === 'q') queens++;
        if (piece.type === 'n' || piece.type === 'b') minorPieces++;
      }
    }
  }
  
  return queens === 0 || (queens === 2 && minorPieces <= 2);
}

function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  
  if (game.isDraw()) return 0;

  const endgame = isEndgame(game);
  let score = 0;
  const board = game.board();
  
  // Material and position
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const materialValue = PIECE_VALUES[piece.type];
        const positionBonus = getPositionBonus(piece.type, i * 8 + j, piece.color === 'w', endgame);
        const totalValue = materialValue + positionBonus;
        
        score += piece.color === 'w' ? totalValue : -totalValue;
      }
    }
  }
  
  // Mobility bonus (lighter calculation)
  const moves = game.moves().length;
  score += game.turn() === 'w' ? moves * 3 : -moves * 3;
  
  // Check pressure
  if (game.inCheck()) {
    score += game.turn() === 'w' ? -25 : 25;
  }
  
  return score;
}

// Quick move scoring for ordering
function scoreMove(move: Move, game: Chess): number {
  let score = 0;
  
  // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
  if (move.captured) {
    score += PIECE_VALUES[move.captured] * 10 - PIECE_VALUES[move.piece];
  }
  
  // Promotion bonus
  if (move.promotion) {
    score += PIECE_VALUES[move.promotion] * 8;
  }
  
  // Check bonus
  if (move.san.includes('+')) {
    score += 50;
  }
  
  // Checkmate is best
  if (move.san.includes('#')) {
    score += 10000;
  }
  
  // Center control in opening
  if ((move.to === 'd4' || move.to === 'd5' || move.to === 'e4' || move.to === 'e5') && 
      (move.piece === 'p' || move.piece === 'n')) {
    score += 20;
  }
  
  return score;
}

function negamax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  color: number
): number {
  const alphaOrig = alpha;
  const key = game.fen();

  // Transposition table lookup
  const cached = transpositionTable.get(key);
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'exact') return cached.score;
    if (cached.flag === 'lower') alpha = Math.max(alpha, cached.score);
    else if (cached.flag === 'upper') beta = Math.min(beta, cached.score);
    if (alpha >= beta) return cached.score;
  }

  // Time budget reached: return static evaluation (keeps UI responsive)
  if (isTimeUp()) {
    return color * evaluateBoard(game);
  }

  if (depth === 0 || game.isGameOver()) {
    return color * evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  // Move ordering
  moves.sort((a, b) => scoreMove(b, game) - scoreMove(a, game));

  let bestScore = -Infinity;

  for (const move of moves) {
    if (isTimeUp()) break;

    game.move(move);
    const score = -negamax(game, depth - 1, -beta, -alpha, -color);
    game.undo();

    bestScore = Math.max(bestScore, score);
    alpha = Math.max(alpha, score);

    if (alpha >= beta) break; // Beta cutoff
  }
  // Store in transposition table
  if (transpositionTable.size > MAX_TABLE_SIZE) {
    transpositionTable.clear();
  }
  
  let flag: 'exact' | 'lower' | 'upper' = 'exact';
  if (bestScore <= alphaOrig) flag = 'upper';
  else if (bestScore >= beta) flag = 'lower';
  
  transpositionTable.set(key, { depth, score: bestScore, flag });
  
  return bestScore;
}

// Opening book for common positions
const OPENING_BOOK: Record<string, string[]> = {
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR': ['e2e4', 'd2d4', 'c2c4', 'g1f3'],
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR': ['e7e5', 'c7c5', 'e7e6', 'c7c6'],
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR': ['g1f3', 'f1c4', 'b1c3'],
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR': ['d7d5', 'g8f6', 'e7e6'],
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R': ['b8c6', 'g8f6', 'd7d6'],
};

function getOpeningMove(game: Chess): Move | null {
  const fen = game.fen().split(' ')[0];
  const bookMoves = OPENING_BOOK[fen];
  
  if (bookMoves && bookMoves.length > 0) {
    const moveStr = bookMoves[Math.floor(Math.random() * bookMoves.length)];
    const from = moveStr.slice(0, 2);
    const to = moveStr.slice(2, 4);
    
    const moves = game.moves({ verbose: true });
    const move = moves.find(m => m.from === from && m.to === to);
    if (move) return move;
  }
  
  return null;
}

export function getBestMove(game: Chess, difficulty: 'easy' | 'medium' | 'hard'): Move | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Try opening book first (makes game feel more natural)
  if (game.history().length < 10) {
    const bookMove = getOpeningMove(game);
    if (bookMove) return bookMove;
  }

  // Faster defaults (mobile-friendly) + time budget.
  // Iterative deepening will still try to reach the target depth when possible.
  const depths: Record<Difficulty, number> = {
    easy: 2,
    medium: 3,
    hard: 4,
  };

  const timeLimitsMs: Record<Difficulty, number> = {
    easy: 120,
    medium: 220,
    hard: 420,
  };

  const depthTarget = depths[difficulty];
  const color = game.turn() === 'w' ? 1 : -1;

  // Root move ordering
  moves.sort((a, b) => scoreMove(b, game) - scoreMove(a, game));

  searchDeadline = Date.now() + timeLimitsMs[difficulty];

  let bestMove: Move | null = null;
  let bestScore = -Infinity;
  let lastRootScores = new Map<string, number>();

  for (let depth = 1; depth <= depthTarget; depth++) {
    if (isTimeUp()) break;

    let iterationBestMove: Move | null = null;
    let iterationBestScore = -Infinity;
    const rootScores = new Map<string, number>();

    for (const move of moves) {
      if (isTimeUp()) break;

      game.move(move);
      const score = -negamax(game, depth - 1, -Infinity, Infinity, -color);
      game.undo();

      rootScores.set(getMoveKey(move), score);

      if (score > iterationBestScore) {
        iterationBestScore = score;
        iterationBestMove = move;
      }
    }

    // Only accept this iteration if we actually got a result
    if (iterationBestMove) {
      bestMove = iterationBestMove;
      bestScore = iterationBestScore;
      lastRootScores = rootScores;
    }
  }

  // Reset deadline so other calls don't inherit it
  searchDeadline = 0;

  // Small controlled randomness without extra search (keeps speed high)
  if (bestMove && lastRootScores.size > 0) {
    const ranked = moves
      .map((m) => ({ move: m, score: lastRootScores.get(getMoveKey(m)) ?? -Infinity }))
      .sort((a, b) => b.score - a.score);

    if (difficulty === 'easy' && Math.random() < 0.1) {
      const pickFrom = ranked.slice(0, 3).filter((r) => r.score !== -Infinity);
      if (pickFrom.length > 0) return pickFrom[Math.floor(Math.random() * pickFrom.length)].move;
    }

    if (difficulty === 'medium' && Math.random() < 0.05) {
      const pickFrom = ranked.slice(0, 2).filter((r) => r.score !== -Infinity);
      if (pickFrom.length > 0) return pickFrom[Math.floor(Math.random() * pickFrom.length)].move;
    }
  }

  return bestMove ?? moves[0];
}

// Get a hint for the player - returns the best move for current position
export function getHintMove(game: Chess): Move | null {
  return getBestMove(game, 'hard');
}
