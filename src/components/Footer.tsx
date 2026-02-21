"use client";

import Link from 'next/link';
import { Crown } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 safe-padding-bottom">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
                <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="font-heading text-base sm:text-lg text-gradient-gold">ChessMaster</span>
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Play chess online, improve your skills, and earn real rewards.
            </p>
          </div>

          {/* Play */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Play</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/play/computer" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  Play vs Computer
                </Link>
              </li>
              <li>
                <Link href="/play-chess-online.html" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/play/local" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  Play Local
                </Link>
              </li>
              <li>
                <Link href="/play/online" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  Play Online
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/how-to-play" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  How to Play
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2 text-xs sm:text-sm flex flex-row sm:flex-col gap-4 sm:gap-0">
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors py-1 block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} ChessMaster. All rights reserved.</p>
        </div>

        {/* Ad Section - Bottom of Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          {/* Desktop Leaderboard Ad (728x90) */}
          <div 
            id="ad-slot-footer-desktop" 
            className="hidden md:flex justify-center items-center min-h-[90px]"
          />
          {/* Mobile Banner Ad (320x50) */}
          <div 
            id="ad-slot-footer-mobile" 
            className="flex md:hidden justify-center items-center min-h-[50px]"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;


