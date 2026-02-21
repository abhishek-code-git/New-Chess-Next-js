"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Trophy, 
  Wallet, 
  User, 
  LogOut,
  Menu,
  X,
  Swords,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Crown },
    { to: '/tournaments', label: 'Tournaments', icon: Swords },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/how-to-play', label: 'How to Play', icon: Trophy },
  ];

  const authLinks = user ? [
    { to: '/dashboard', label: 'Dashboard', icon: User },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    ...(isAdmin ? [{ to: '/admin/tournaments', label: 'Admin', icon: Shield }] : []),
  ] : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 safe-padding-top">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
          {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            <span className="font-heading text-sm sm:text-base md:text-xl text-gradient-gold truncate">
              ChessMaster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {[...navLinks, ...authLinks].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                href={to}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm xl:text-base whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {user ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:inline">Sign Out</span>
                <span className="xl:hidden">Out</span>
              </Button>
            ) : (
              <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/auth')}
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push('/auth?mode=signup')}
                className="gold-gradient"
              >
                Sign Up
              </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-1.5 sm:p-2 touch-target flex items-center justify-center rounded-md hover:bg-muted/50 active:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-card/98 backdrop-blur-lg',
          mobileMenuOpen ? 'max-h-[70vh] pb-3 sm:pb-4 border-t border-border/50' : 'max-h-0'
        )}>
          <div className="flex flex-col gap-0.5 pt-2 max-h-[60vh] overflow-y-auto">
            {[...navLinks, ...authLinks].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                href={to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-muted/50 transition-colors touch-target active:bg-muted"
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base">{label}</span>
              </Link>
            ))}
            
            <div className="border-t border-border my-2 mx-3 sm:mx-4" />
            
            {user ? (
              <Button 
                variant="outline"
                onClick={handleSignOut}
                className="mx-3 sm:mx-4 h-10 sm:h-11 text-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <div className="flex gap-2 px-3 sm:px-4">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-10 sm:h-11 text-sm"
                  onClick={() => {
                    router.push('/auth');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  className="flex-1 h-10 sm:h-11 gold-gradient text-sm"
                  onClick={() => {
                    router.push('/auth?mode=signup');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


