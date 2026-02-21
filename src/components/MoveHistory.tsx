"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MoveHistoryProps {
  history: string[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ history }) => {
  const movePairs: { number: number; white: string; black?: string }[] = [];
  
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1]
    });
  }

  return (
    <Card className="glass-card p-4">
      <h3 className="font-heading text-lg mb-3 text-primary">Move History</h3>
      <ScrollArea className="h-48">
        <div className="space-y-1">
          {movePairs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No moves yet
            </p>
          ) : (
            movePairs.map(({ number, white, black }) => (
              <div 
                key={number} 
                className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-muted/50 transition-colors"
              >
                <span className="text-muted-foreground w-8">{number}.</span>
                <span className="font-mono w-16">{white}</span>
                <span className="font-mono w-16">{black || ''}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default MoveHistory;


