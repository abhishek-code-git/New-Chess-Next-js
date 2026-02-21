"use client";

import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';
import { Trophy, Users, Target, Shield } from 'lucide-react';

const About = () => {
  return (
    <>
      <SEO 
        title="About Us - ChessMaster"
        description="Learn about ChessMaster, the premier online chess platform where you can play chess, improve your skills, and earn real rewards."
        canonical="https://chessmasterss.vercel.app/about"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <article>
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                About ChessMaster
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your ultimate destination for playing chess online, improving your skills, and earning real rewards.
              </p>
            </header>

            <section className="max-w-4xl mx-auto mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                At ChessMaster, we believe that chess is more than just a game – it's a journey of strategic thinking, 
                personal growth, and endless learning. Our mission is to make chess accessible to everyone while 
                rewarding players for their dedication and skill.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We've built a platform that combines the timeless appeal of chess with modern technology, 
                creating an engaging experience for players of all skill levels.
              </p>
            </section>

            <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Earn Rewards</h3>
                <p className="text-muted-foreground">
                  Win games and earn points that can be converted to real money.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Play Anyone</h3>
                <p className="text-muted-foreground">
                  Challenge players worldwide or practice against our smart AI.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Improve Skills</h3>
                <p className="text-muted-foreground">
                  Track your progress and climb the leaderboard rankings.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  Your data and earnings are protected with top-tier security.
                </p>
              </div>
            </section>

            <section className="max-w-4xl mx-auto mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Why Choose ChessMaster?</h2>
              <ul className="space-y-4 text-muted-foreground text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Free to Play:</strong> Start playing immediately without any upfront costs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Multiple Game Modes:</strong> Play online, locally with friends, or against AI.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Real Rewards:</strong> Convert your points to real money through our wallet system.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong className="text-foreground">Fair Play:</strong> Our anti-cheat systems ensure a level playing field.</span>
                </li>
              </ul>
            </section>

            <section className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Us</h2>
              <p className="text-muted-foreground text-lg mb-4">
                Have questions or feedback? We'd love to hear from you!
              </p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:support@chessmaster.app" className="text-primary hover:underline">support@chessmaster.app</a>
              </p>
            </section>
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

export default About;


