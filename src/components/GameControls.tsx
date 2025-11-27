
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameMode } from '@/types/chess';
import { Users, RotateCcw, Settings } from 'lucide-react';

interface GameControlsProps {
  gameMode: GameMode;
  onResetGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  onResetGame
}) => {
  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/15 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-white text-lg md:text-xl">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          Game Controls
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Game Mode Display */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-medium">Two Player Mode</span>
          </div>
        </div>

        {/* New Game Button */}
        <Button
          onClick={onResetGame}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/reset border-0"
        >
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 group-hover/reset:animate-spin transition-transform duration-500" />
            <span className="font-medium">New Game</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default GameControls;
