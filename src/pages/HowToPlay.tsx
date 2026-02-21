"use client";

import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';
import { ChevronRight } from 'lucide-react';

const HowToPlay = () => {
  return (
    <>
      <SEO 
        title="How to Play Chess - Complete Guide | ChessMaster"
        description="Learn how to play chess with our comprehensive guide. Master the rules, piece movements, strategies, and tips to become a better chess player."
        canonical="https://chessmasterss.vercel.app/how-to-play"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <article>
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                How to Play Chess
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A complete beginner's guide to understanding and mastering the game of chess.
              </p>
            </header>

            <div className="max-w-4xl mx-auto space-y-12">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">The Basics</h2>
                <p className="text-muted-foreground text-lg mb-4">
                  Chess is a two-player strategy board game played on a checkered 8×8 grid. 
                  Each player starts with 16 pieces: one king, one queen, two rooks, two knights, 
                  two bishops, and eight pawns.
                </p>
                <p className="text-muted-foreground text-lg">
                  The objective is to checkmate your opponent's king – putting it under attack 
                  with no way to escape.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">How Each Piece Moves</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">♔ King</h3>
                    <p className="text-muted-foreground">
                      Moves one square in any direction. The most important piece – if checkmated, you lose.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">♕ Queen</h3>
                    <p className="text-muted-foreground">
                      The most powerful piece. Moves any number of squares horizontally, vertically, or diagonally.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">♖ Rook</h3>
                    <p className="text-muted-foreground">
                      Moves any number of squares horizontally or vertically. Great for controlling files and ranks.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">♗ Bishop</h3>
                    <p className="text-muted-foreground">
                      Moves diagonally any number of squares. Each bishop stays on its starting color.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">♘ Knight</h3>
                    <p className="text-muted-foreground">
                      Moves in an "L" shape: two squares in one direction, then one square perpendicular. Can jump over pieces.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">♙ Pawn</h3>
                    <p className="text-muted-foreground">
                      Moves forward one square (or two from starting position). Captures diagonally. Can promote to any piece upon reaching the opposite end.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Special Moves</h2>
                <ul className="space-y-4 text-muted-foreground text-lg">
                  <li className="flex items-start gap-3">
                    <ChevronRight className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span><strong className="text-foreground">Castling:</strong> A special move where the king and rook move simultaneously for king safety.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ChevronRight className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span><strong className="text-foreground">En Passant:</strong> A special pawn capture that can occur immediately after an opponent moves a pawn two squares.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ChevronRight className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span><strong className="text-foreground">Promotion:</strong> When a pawn reaches the opposite end, it can be promoted to a queen, rook, bishop, or knight.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Winning Tips</h2>
                <ol className="space-y-4 text-muted-foreground text-lg list-decimal list-inside">
                  <li><strong className="text-foreground">Control the center:</strong> The four central squares are key to controlling the board.</li>
                  <li><strong className="text-foreground">Develop your pieces:</strong> Move your knights and bishops out early.</li>
                  <li><strong className="text-foreground">Protect your king:</strong> Castle early to keep your king safe.</li>
                  <li><strong className="text-foreground">Think ahead:</strong> Always consider your opponent's possible responses.</li>
                  <li><strong className="text-foreground">Practice regularly:</strong> The more you play, the better you'll become.</li>
                </ol>
              </section>

              <section className="bg-primary/10 border border-primary/20 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Play?</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Put your knowledge to the test! Play against our AI or challenge players online.
                </p>
                <a 
                  href="/play/computer" 
                  className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Start Playing Now
                </a>
              </section>
            </div>
          </article>
        </main>

        <footer className="border-t border-border py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ChessMaster. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HowToPlay;


