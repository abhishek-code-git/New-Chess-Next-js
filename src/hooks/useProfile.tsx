"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const updateStats = useMutation({
    mutationFn: async ({ 
      won, 
      draw = false,
      pointsEarned = 0 
    }: { 
      won: boolean; 
      draw?: boolean;
      pointsEarned?: number;
    }) => {
      if (!profile) throw new Error('No profile');

      const updates: Partial<Profile> = {
        total_games: profile.total_games + 1,
        points: profile.points + pointsEarned,
      };

      if (draw) {
        updates.draws = profile.draws + 1;
      } else if (won) {
        updates.wins = profile.wins + 1;
      } else {
        updates.losses = profile.losses + 1;
      }

      // Check if points reached 1000 for wallet conversion
      const newPoints = profile.points + pointsEarned;
      if (newPoints >= 1000) {
        const earnedMoney = Math.floor(newPoints / 1000) * 10;
        const remainingPoints = newPoints % 1000;
        updates.points = remainingPoints;
        updates.wallet_balance = Number(profile.wallet_balance) + earnedMoney;
        
        toast({
          title: "Congratulations! 🎉",
          description: `You've earned ₹${earnedMoney}! Check your wallet.`,
        });
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return { profile, isLoading, updateStats };
};


