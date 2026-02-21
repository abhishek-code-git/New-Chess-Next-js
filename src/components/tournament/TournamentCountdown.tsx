"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TournamentCountdownProps {
  startDate: string;
  autoStart: boolean;
}

export function TournamentCountdown({ startDate, autoStart }: TournamentCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('Starting soon...');
        setIsStarting(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
      setIsStarting(false);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${isStarting ? 'bg-green-500/10 border border-green-500/30' : 'bg-primary/10 border border-primary/20'}`}>
      <Clock className={`h-5 w-5 ${isStarting ? 'text-green-500 animate-pulse' : 'text-primary'}`} />
      <div>
        <p className="text-sm font-medium">
          {isStarting ? 'Tournament starting...' : 'Starts in'}
        </p>
        <p className={`text-lg font-bold ${isStarting ? 'text-green-500' : 'text-primary'}`}>
          {timeLeft}
        </p>
      </div>
      {autoStart && (
        <Badge variant="outline" className="ml-auto text-xs">Auto-start</Badge>
      )}
    </div>
  );
}


