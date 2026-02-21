"use client";

import ChessBoard from "@/components/ChessBoard";
import GameStatus from "@/components/GameStatus";
import MoveHistory from "@/components/MoveHistory";
import TournamentGameOverModal from "@/components/TournamentGameOverModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Zap } from "lucide-react";
import type { Tournament, TournamentMatch, TournamentRegistration } from "@/types/tournament";
import { useTournamentMatch } from "@/hooks/useTournamentMatch";

interface ArenaMatchViewProps {
  match: TournamentMatch;
  tournament: Tournament;
  myRegistration: TournamentRegistration;
}

export function ArenaMatchView({ match, tournament, myRegistration }: ArenaMatchViewProps) {
  const {
    game, moveHistory, isWhite, playerColor, opponentName, isMyTurn,
    handleMove, handleResign, gameResult, showGameOver, dismissGameOver, bonusPointsAwarded,
  } = useTournamentMatch({ match, tournament, myRegistrationId: myRegistration.id, scoringMode: 'arena' });

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {tournament.name} - Arena Match
          </h1>
          <p className="text-muted-foreground">
            {tournament.time_control} • Score: {myRegistration.arena_score} pts
          </p>
        </div>
        <Badge variant={isMyTurn ? 'default' : 'secondary'} className="text-sm">
          {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${isWhite ? 'bg-gray-800' : 'bg-white border'}`} />
                  <span className="font-medium">{opponentName}</span>
                </div>
              </div>
              
              <ChessBoard
                game={game}
                onMove={handleMove}
                playerColor={playerColor}
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${isWhite ? 'bg-white border' : 'bg-gray-800'}`} />
                  <span className="font-medium">You ({myRegistration.arena_score} pts)</span>
                </div>
                {myRegistration.current_streak >= 2 && (
                  <Badge variant="outline" className="text-xs">
                    🔥 {myRegistration.current_streak} streak
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {!gameResult && (
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleResign}>
                <Flag className="mr-2 h-4 w-4" />
                Resign
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Game Status</CardTitle>
            </CardHeader>
            <CardContent>
              <GameStatus game={game} playerColor={playerColor} gameMode="tournament" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Move History</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              <MoveHistory history={moveHistory} />
            </CardContent>
          </Card>
        </div>
      </div>

      <TournamentGameOverModal
        game={game}
        isOpen={showGameOver}
        playerColor={playerColor}
        result={gameResult}
        onClose={dismissGameOver}
        pointsAwarded={bonusPointsAwarded}
        opponentName={opponentName}
      />
    </main>
  );
}


