"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet as WalletIcon, ArrowDown, Clock, CheckCircle, XCircle, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Withdrawal {
  id: string;
  amount: number;
  points_used: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at: string | null;
}

const Wallet: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { toast } = useToast();
  
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const { data: withdrawals, isLoading: withdrawalsLoading, refetch } = useQuery({
    queryKey: ['withdrawals', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Withdrawal[];
    },
    enabled: !!profile,
  });

  const handleWithdraw = async () => {
    if (!profile) return;
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount > Number(profile.wallet_balance)) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod || !paymentDetails) {
      toast({
        title: "Missing details",
        description: "Please provide payment method and details.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: profile.id,
          amount,
          points_used: 0,
          payment_method: paymentMethod,
          payment_details: { details: paymentDetails }
        });

      if (error) throw error;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: Number(profile.wallet_balance) - amount })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Withdrawal requested!",
        description: "Your withdrawal is pending admin approval.",
      });

      setWithdrawOpen(false);
      setWithdrawAmount('');
      setPaymentMethod('');
      setPaymentDetails('');
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Wallet - Manage Your Chess Earnings"
        description="View your wallet balance, request withdrawals, and track your earnings from playing chess on ChessMaster. Convert points to real money."
        canonical="https://chessmaster.app/wallet"
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Wallet Balance */}
          <Card className="glass-card p-8 animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center">
                <WalletIcon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-2xl">Your Wallet</h1>
                <p className="text-muted-foreground">Manage your earnings</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="text-muted-foreground text-sm mb-1">Available Balance</div>
                <div className="text-4xl font-heading text-green-400">
                  ₹{Number(profile.wallet_balance).toFixed(2)}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <div className="text-muted-foreground text-sm mb-1">Points</div>
                <div className="text-4xl font-heading text-primary flex items-center gap-2">
                  <Coins className="h-8 w-8" />
                  {profile.points}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {1000 - (profile.points % 1000)} to next ₹10
                </div>
              </div>
            </div>

            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full mt-6 gold-gradient text-primary-foreground"
                  disabled={Number(profile.wallet_balance) < 10}
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle className="font-heading">Request Withdrawal</DialogTitle>
                  <DialogDescription>
                    Minimum withdrawal amount is ₹10. Processing takes 1-3 business days.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      min="10"
                      max={Number(profile.wallet_balance)}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Input
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="e.g., UPI, Bank Transfer, PayPal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Details</Label>
                    <Input
                      value={paymentDetails}
                      onChange={(e) => setPaymentDetails(e.target.value)}
                      placeholder="e.g., UPI ID or account number"
                    />
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    className="w-full gold-gradient text-primary-foreground"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {Number(profile.wallet_balance) < 10 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Minimum balance of ₹10 required for withdrawal
              </p>
            )}
          </Card>

          {/* Withdrawal History */}
          <Card className="glass-card p-6">
            <h2 className="font-heading text-xl mb-4">Withdrawal History</h2>
            
            {withdrawalsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !withdrawals || withdrawals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <WalletIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No withdrawals yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div 
                    key={w.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">₹{w.amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(w.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {getStatusBadge(w.status)}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* How It Works */}
          <Card className="glass-card p-6">
            <h2 className="font-heading text-xl mb-4">How Points Work</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                <div>Win games against the computer to earn points</div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                <div>Easy = 5 pts, Medium = 10 pts, Hard = 15 pts per win</div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                <div>Every 1000 points automatically converts to ₹10</div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                <div>Withdraw your earnings anytime (min ₹10)</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;


