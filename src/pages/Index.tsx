"use client";

import React from 'react';
import AdSlot from '@/components/AdSlot';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { 
  Crown, 
  Users, 
  Bot, 
  Monitor,
  Trophy,
  Coins,
  Shield,
  ArrowRight,
  Swords,
  Star,
  Zap,
  Target,
  Award,
  Clock,
  Globe,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const router = useRouter();
  const { user } = useAuth();

  const gameModes = [
    {
      icon: Bot,
      title: 'AI Chess Game Online',
      description: 'Play AI chess game online with 5 difficulty levels - perfect chess game for beginners to grandmasters',
      action: () => router.push('/play/computer'),
      color: 'from-blue-500 to-cyan-500',
      keywords: 'AI chess game online, chess game for beginners'
    },
    {
      icon: Monitor,
      title: 'Browser Chess Game Free',
      description: 'Free chess game without login - play chess online with friends on same device instantly',
      action: () => router.push('/play/local'),
      color: 'from-green-500 to-emerald-500',
      keywords: 'browser chess game free, free chess game without login'
    },
    {
      icon: Users,
      title: 'Play Chess Online with Friends',
      description: 'Chess game online no download - challenge friends worldwide in real-time multiplayer',
      action: () => router.push('/play/online'),
      color: 'from-purple-500 to-pink-500',
      keywords: 'play chess online with friends, chess game online no download'
    },
    {
      icon: Swords,
      title: 'Chess Tournaments Free',
      description: 'Join chess game online free tournaments, win real prizes and climb global rankings',
      action: () => router.push('/tournaments'),
      color: 'from-orange-500 to-red-500',
      keywords: 'chess game online free, chess tournaments'
    }
  ];

  const features = [
    {
      icon: Trophy,
      title: 'Compete & Rank',
      description: 'Climb the global chess leaderboard, earn ELO ratings, and prove your chess mastery'
    },
    {
      icon: Coins,
      title: 'Earn Real Money',
      description: 'Win chess matches, earn points, and convert them to real cash rewards instantly'
    },
    {
      icon: Shield,
      title: '100% Secure & Fair',
      description: 'Advanced anti-cheat protection ensures fair play with secure withdrawals'
    },
    {
      icon: Zap,
      title: 'Instant Matchmaking',
      description: 'Find opponents in seconds with our smart matchmaking system'
    },
    {
      icon: Target,
      title: 'All Skill Levels',
      description: 'From complete beginners to chess grandmasters - everyone can play and improve'
    },
    {
      icon: Globe,
      title: 'Play Anywhere',
      description: 'Mobile-optimized gameplay - play chess on any device, anytime, anywhere'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Players', icon: Users },
    { value: '1M+', label: 'Games Played', icon: Trophy },
    { value: '₹50K+', label: 'Rewards Paid', icon: Coins },
    { value: '4.9★', label: 'Player Rating', icon: Star }
  ];

  const testimonials = [
    {
      name: 'Rahul S.',
      rating: 5,
      text: 'Best free chess game online! I\'ve improved my rating by 300 points and earned real money playing.',
      location: 'Mumbai, India'
    },
    {
      name: 'Priya K.',
      rating: 5,
      text: 'Love the tournament system! Finally a chess platform where I can compete and win rewards.',
      location: 'Delhi, India'
    },
    {
      name: 'Arjun M.',
      rating: 5,
      text: 'The AI difficulty levels are perfect for practice. Smooth gameplay and instant withdrawals!',
      location: 'Bangalore, India'
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <h1 className="sr-only">
        Free Online Chess Game – Play Chess Instantly Without Download
      </h1>

      <SEO 
          title="Free Online Chess Game | Play Chess Without Download – Chess Masters"
          description="Play free online chess game against computer or friends. No download required. Enjoy instant chess gameplay with tournaments and rewards on Chess Masters."
          canonical="https://chessmasterss.vercel.app/"
      />
      <Navbar />
      
      {/* Hero Section - SEO Optimized for Target Keywords */}
      <section className="relative pt-14 pb-8 sm:pt-20 sm:pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 overflow-hidden">
        

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 md:w-72 lg:w-96 h-32 sm:h-48 md:h-72 lg:h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-48 md:w-72 lg:w-96 h-32 sm:h-48 md:h-72 lg:h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-slide-up">
            <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
              <Crown className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 text-primary animate-float" />
            </div>
            
            <h1 className="font-heading text-responsive-hero mb-3 sm:mb-4 md:mb-6 leading-tight px-1">
              <span className="text-gradient-gold">Play Chess Online Free</span>
              <br className="hidden sm:block" />
              <span className="text-foreground text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"> No Download Required</span>
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-2 sm:mb-3 md:mb-4 max-w-2xl mx-auto px-2">
              Challenge AI, play with friends, or join tournaments. 
              <span className="hidden sm:inline"> Free chess game without login - start playing instantly!</span>
            </p>

            <p className="text-[10px] sm:text-xs text-muted-foreground mb-4 sm:mb-6 md:mb-8 flex flex-wrap justify-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 px-2">
              <span>✓ Free</span>
              <span>•</span>
              <span>✓ No Download</span>
              <span>•</span>
              <span>✓ Beginners Welcome</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2 sm:px-0">
              <Button 
                size="lg" 
                onClick={() => router.push('/play/computer')}
                className="gold-gradient text-primary-foreground text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 glow-gold animate-pulse-gold w-full sm:w-auto"
              >
                <Crown className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Play Chess Now
                <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/auth?mode=signup')}
                  className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 w-full sm:w-auto"
                >
                  <Award className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Sign Up Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Compact on mobile */}
      <section className="py-4 sm:py-6 md:py-8 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center p-1.5 sm:p-2 md:p-4">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary mx-auto mb-1 sm:mb-1.5 md:mb-2" />
                <div className="text-base sm:text-lg md:text-2xl lg:text-3xl font-heading text-gradient-gold">{value}</div>
                <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-muted-foreground leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes Section - Target Keywords */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-5 sm:mb-8 md:mb-12">
            <h2 className="font-heading text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-2 sm:mb-3 md:mb-4">
              <span className="text-gradient-gold">Choose Your Game</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 hidden sm:block">
              Play chess online - no download, no login required
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-6xl mx-auto">
            {gameModes.map(({ icon: Icon, title, description, action, color }) => (
              <Card 
                key={title}
                className="glass-card p-2.5 sm:p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:glow-gold"
                onClick={action}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2 sm:mb-3 md:mb-4`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-heading text-xs sm:text-sm md:text-base lg:text-xl mb-1 sm:mb-1.5 md:mb-2 leading-tight">{title}</h3>
                <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm line-clamp-2 sm:line-clamp-none">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Simplified for mobile */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-5 sm:mb-8 md:mb-12">
            <h2 className="font-heading text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-2 sm:mb-3 md:mb-4">
              Why <span className="text-gradient-gold">ChessMaster</span>?
            </h2>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center p-1 sm:p-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:w-16 lg:w-20 lg:h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg mb-0.5 sm:mb-1 md:mb-2 leading-tight">{title}</h3>
                <p className="text-muted-foreground text-[8px] sm:text-[10px] md:text-xs lg:text-sm hidden sm:block">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-heading text-responsive-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
              How to <span className="text-gradient-gold">Earn Money Playing Chess</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
              Simple steps to start earning real money while playing chess online
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { step: 1, title: 'Create Free Account', desc: 'Sign up in 30 seconds' },
              { step: 2, title: 'Play Chess Games', desc: 'vs AI or real players' },
              { step: 3, title: 'Win & Earn Points', desc: '10 points per victory' },
              { step: 4, title: 'Withdraw Cash', desc: '1000 points = ₹10' }
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary-foreground font-heading text-lg sm:text-xl">
                  {step}
                </div>
                <h3 className="font-heading text-sm sm:text-base lg:text-lg mb-1">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-10 sm:py-16 md:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-heading text-responsive-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
              What <span className="text-gradient-gold">Players Say</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">Join thousands of satisfied chess players</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {testimonials.map(({ name, rating, text, location }) => (
              <Card key={name} className="glass-card p-4 sm:p-6">
                <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">&quot;{text}&quot;</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-heading text-primary text-sm sm:text-base">{name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reward System Info */}
      <section className="py-10 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="glass-card p-5 sm:p-8 md:p-10 lg:p-12 max-w-4xl mx-auto text-center">
            <Coins className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary mx-auto mb-4 sm:mb-6 animate-float" />
            <h2 className="font-heading text-responsive-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
              Start Earning Money Playing Chess Today
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Win chess matches against the computer and earn 10 points per victory. 
              Collect 1000 points and convert them to ₹10 in your wallet. 
              No limits on earnings - withdraw anytime!
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-muted px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-heading text-primary">10</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Points per win</div>
              </div>
              <div className="bg-muted px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-heading text-primary">1000</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Points = ₹10</div>
              </div>
              <div className="bg-muted px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-heading text-primary">∞</div>
                <div className="text-xs sm:text-sm text-muted-foreground">No earning limit</div>
              </div>
            </div>
            <Button 
              size="lg"
              onClick={() => router.push(user ? '/play/computer' : '/auth?mode=signup')}
              className="gold-gradient text-primary-foreground w-full sm:w-auto"
            >
              {user ? 'Start Playing Now' : 'Create Free Account & Play'}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Card>
        </div>
      </section>

      {/* FAQ Section for SEO - Target Keywords */}
      <section className="py-10 sm:py-16 md:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-heading text-responsive-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
              <span className="text-gradient-gold">Chess Game Online Free</span> - FAQ
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
            {[
              {
                q: 'Is this a free chess game without login?',
                a: 'Yes! ChessMaster is a 100% free chess game without login required. You can play chess online with friends or AI instantly - no signup needed for basic play!'
              },
              {
                q: 'Can I play chess online with friends for free?',
                a: 'Absolutely! Play chess online with friends by creating a private room and sharing the code. Our browser chess game free lets you challenge friends worldwide with no download required.'
              },
              {
                q: 'Is this a chess game online no download?',
                a: 'Yes! ChessMaster is a complete chess game online no download needed. Play directly in your browser - works on mobile, tablet, and desktop instantly.'
              },
              {
                q: 'Is this AI chess game online good for beginners?',
                a: 'Perfect! Our AI chess game online has 5 difficulty levels making it the ideal chess game for beginners. Start at Beginner (ELO 800) and progress to Grandmaster (ELO 2400+).'
              },
              {
                q: 'What makes this the best browser chess game free?',
                a: 'ChessMaster offers the best browser chess game free experience with: no download, no login required, AI opponents, multiplayer, tournaments, and real money rewards!'
              },
              {
                q: 'Is this chess game for beginners friendly?',
                a: 'Yes! This is the perfect chess game for beginners with easy AI levels, tutorials, and a supportive community. Learn chess online free at your own pace.'
              }
            ].map(({ q, a }) => (
              <Card key={q} className="p-4 sm:p-5 md:p-6">
                <h3 className="font-heading text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2">{q}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-responsive-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
            Ready to <span className="text-gradient-gold">Play Chess</span>?
          </h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base px-2">
            Join over 10,000 chess players already winning and earning on ChessMaster
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/play/computer')}
            className="gold-gradient text-primary-foreground text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 w-full sm:w-auto"
          >
            <Crown className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            Play Free Chess Now
            <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
                    <p className="mt-4 text-sm">
            Want a challenge?{" "}
            <a href="/play/computer" className="text-primary underline">
              Play chess vs computer free
            </a>{" "}
            or try{" "}
            <a href="/play/local" className="text-primary underline">
              local multiplayer chess
            </a>.
          </p>

        </div>
      </section>

      <Footer />
       <section className="max-w-4xl mx-auto px-4 py-10 text-sm text-muted-foreground">
          {/* SEO Content */}
            <h2 className="text-xl font-semibold mb-3">
              How to Play Chess Online Free Beginners Guide
            </h2>

            <p>
             How to play chess online free. Best chess beginner apps, free chess puzzles for all levels & simple chess tricks.
            </p>
            <h2>
              How to Play Chess Online Free

            </h2>
            <p className="mt-3">
             How to play chess online free ? If you are new to chess and want to learn how to play chess online free. Chess is one of the oldest and most popular games of the world. Whether you want to play against friends or the computer or play online chess puzzles, this guide will teach you how to play chess online step by step.

You can play a game of chess online on any device and it is very simple and fun. With the help of the best chess beginner apps, online chess puzzles and simple tricks, you can easily master the game.
            </p>
            <h2>
               Best Chess Apps for Beginners
            </h2>
            <p className="mt-3">
              f you are looking to learn Chess online for the first time you must start with the best Chess Apps for beginners:

Chess.com App - Provides tutorials, chess puzzles, and online games for beginners to advanced level

Lichess - Free, ad-free chess site with practice puzzles and computer opponents

ChessKid - great ChessApp specifically for kids and beginners

This app will allow you to play chess


            </p>

            <h2>
              Chess Game for Kids and Beginners

            </h2>
            <p>
              
Kids or Beginners must start with very simple chess concepts. What you need to learn is:

The rules of every piece (pawn, knight, bishop, rook, queen, king)

Simple chess openings that control the center of board

Simple chess tactics for beginners (e.g. forks, pins, skewers)

It is critical to start small and build up confidence and ease.

            </p>

            <h2>
              Free Chess Puzzles Online
            </h2>

            <p>
              Playing free chess puzzles online is one of the fastest ways to improve your chess skills. Chess puzzles train your brain to recognize patterns and predict moves. Try to do at least 5–10 puzzles a day over sites such as Chess.com or Lichess.
            </p>

            <h2>
              Basic Chess Openings for Beginners
            </h2>
                
            <p>
              earning some basic chess openings is essential to getting a good start in a chess game. Basic chess openings for beginners are:

Italian Game– It is about developing your pieces quickly.

Queen’s Gambit– A classic, “favorite” opening for the center of the board.

Pawn Opening– Critical to learning good pawn structure.

Knowing these basic openings will increase your confidence in online games.

H2: Simple Chess Strategy Tips

Here are some simple chess strategy tips for beginners:

Control the center of the board

Protect your king by castling early

Don’t move the same piece multiple times in the opening

Look for tactics like forks and pins

Practice chess endgame basics

            </p>

            <h2>
              Where to Play Chess Without Registration
            </h2>

            <p>
              Some platforms allow you to play chess without registration, which is perfect if you want to quickly start a game:

Lichess.org – Play instantly without signing up

Chess.com Guest Mode – Limited access but fast

Online Chess Puzzles Sites – Practice tactics freely

H2: Learn Chess Online Step by Step

To become a better player:

Start with beginner-friendly chess apps

Solve free online chess puzzles daily

Practice easy chess tactics for beginners

Gradually learn chess strategy and openings

Play multiplayer chess games online to test your skills

With regular practice, even beginners can play confidently and enjoy the game.

Conclusion

Learning how to play chess online free has never been easier. By using beginner-friendly chess apps, solving free puzzles, and practicing simple strategies, you can improve your skills fast. Start your chess journey today, challenge friends, or play multiplayer chess games online for free and enjoy the endless fun and learning!
            </p>
          </section>

          {/* Ad slot */}
          <AdSlot className="my-6" />
    </div>
   
   
  );
};

export default Index;


