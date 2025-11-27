
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, AlertTriangle, Trophy, Timer, Target, Star } from 'lucide-react';
import { GameMode, CapturedPieces, ChessPiece } from '@/types/chess';

interface GameStatusProps {
  currentPlayer: 'white' | 'black';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  gameMode: GameMode;
  capturedPieces: CapturedPieces;
  recentCapture?: ChessPiece;
}

const GameStatus: React.FC<GameStatusProps> = ({
  currentPlayer,
  isCheck,
  isCheckmate,
  isStalemate,
  capturedPieces,
  recentCapture
}) => {
  const getStatusMessage = () => {
    if (isCheckmate) {
      const winner = currentPlayer === 'white' ? 'Black' : 'White';
      return { 
        message: `🎉 Checkmate! ${winner} wins!`, 
        color: 'text-emerald-400',
        icon: Trophy 
      };
    }
    if (isStalemate) {
      return { 
        message: '🤝 Stalemate! Draw game.', 
        color: 'text-yellow-400',
        icon: Target 
      };
    }
    if (isCheck) {
      return { 
        message: `⚠️ ${currentPlayer === 'white' ? 'White' : 'Black'} is in check!`, 
        color: 'text-red-400',
        icon: AlertTriangle 
      };
    }
    return { 
      message: `${currentPlayer === 'white' ? 'White' : 'Black'} to move`, 
      color: 'text-white',
      icon: Timer 
    };
  };

  const getPieceSymbol = (piece: ChessPiece) => {
    const symbols = {
      white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
      black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
    };
    return symbols[piece.color][piece.type];
  };

  const getPieceValue = (piece: ChessPiece) => {
    const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
    return values[piece.type];
  };

  const getTotalValue = (pieces: ChessPiece[]) => {
    return pieces.reduce((total, piece) => total + getPieceValue(piece), 0);
  };

  const status = getStatusMessage();
  const StatusIcon = status.icon;

  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/15 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-white text-lg md:text-xl">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg shadow-lg">
            <Crown className="w-5 h-5 text-white" />
          </div>
          Game Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Check Status */}
        <div className="flex items-center justify-center">
          {isCheck && (
            <Badge 
              variant="destructive" 
              className="flex items-center gap-2 bg-red-500/20 border-red-400 text-red-300 animate-pulse shadow-lg"
            >
              <AlertTriangle className="w-3 h-3" />
              Check
            </Badge>
          )}
        </div>

        {/* Status Message */}
        <div className={`
          text-center font-bold text-lg transition-all duration-500 p-4 rounded-xl
          ${status.color} 
          ${isCheckmate || isStalemate 
            ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/20 shadow-lg' 
            : 'bg-white/5'
          }
        `}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <StatusIcon className="w-5 h-5" />
            <span>{status.message}</span>
          </div>
        </div>

        {/* Current Player Indicator */}
        <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className={`
            w-6 h-6 rounded-full border-2 transition-all duration-300 shadow-lg
            ${currentPlayer === 'white' 
              ? 'bg-white border-gray-300 shadow-white/20' 
              : 'bg-gray-800 border-gray-600 shadow-gray-800/20'
            }
          `}></div>
          <span className="text-white text-sm font-medium">
            {currentPlayer === 'white' ? 'White' : 'Black'} turn
          </span>
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
        </div>

        {/* Recent Capture */}
        {recentCapture && (
          <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
            <div className="text-white text-sm font-semibold flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-purple-400" />
              Recent Capture
            </div>
            <div className="flex items-center gap-3 p-2 bg-white/10 rounded-lg">
              <span className="text-2xl">{getPieceSymbol(recentCapture)}</span>
              <div className="text-white">
                <div className="font-medium capitalize">{recentCapture.color} {recentCapture.type}</div>
                <div className="text-sm text-white/70">Value: {getPieceValue(recentCapture)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Captured Pieces Summary */}
        {(capturedPieces.white.length > 0 || capturedPieces.black.length > 0) && (
          <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-white text-sm font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Captured Pieces
            </div>
            
            {/* White Captured */}
            {capturedPieces.white.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                    <span className="text-white font-medium text-sm">White Pieces</span>
                  </div>
                  <span className="text-white/70 text-xs">Total: {getTotalValue(capturedPieces.white)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {capturedPieces.white.map((piece, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-white border border-white/20 text-xs">
                      <span className="text-sm">{getPieceSymbol(piece)}</span>
                      <span>{piece.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Black Captured */}
            {capturedPieces.black.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-800 rounded-full border border-gray-600 shadow-sm"></div>
                    <span className="text-white font-medium text-sm">Black Pieces</span>
                  </div>
                  <span className="text-white/70 text-xs">Total: {getTotalValue(capturedPieces.black)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {capturedPieces.black.map((piece, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-white border border-white/20 text-xs">
                      <span className="text-sm">{getPieceSymbol(piece)}</span>
                      <span>{piece.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Material Advantage */}
            {(capturedPieces.white.length > 0 || capturedPieces.black.length > 0) && (
              <div className="pt-2 border-t border-white/10">
                <div className="text-center">
                  {getTotalValue(capturedPieces.white) > getTotalValue(capturedPieces.black) ? (
                    <span className="text-emerald-400 text-sm font-medium">
                      Black leads by {getTotalValue(capturedPieces.white) - getTotalValue(capturedPieces.black)} points
                    </span>
                  ) : getTotalValue(capturedPieces.black) > getTotalValue(capturedPieces.white) ? (
                    <span className="text-emerald-400 text-sm font-medium">
                      White leads by {getTotalValue(capturedPieces.black) - getTotalValue(capturedPieces.white)} points
                    </span>
                  ) : (
                    <span className="text-white/70 text-sm">Material is equal</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameStatus;
