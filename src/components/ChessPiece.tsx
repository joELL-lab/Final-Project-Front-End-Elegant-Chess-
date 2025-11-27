
import React from 'react';
import { PieceType } from '@/types/chess';

interface ChessPieceProps {
  type: PieceType;
  color: 'white' | 'black';
  isSelected?: boolean;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, isSelected }) => {
  const pieceSymbols = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  };

  const symbol = pieceSymbols[color][type];
  
  return (
    <div className="relative">
      {/* Main Piece */}
      <div className={`
        select-none transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'scale-110 brightness-110' 
          : 'hover:scale-105'
        } 
        ${color === 'white' 
          ? 'text-white drop-shadow-lg filter' 
          : 'text-gray-900 drop-shadow-lg filter'
        }
        text-2xl md:text-4xl lg:text-5xl font-bold
      `}>
        <span className="filter drop-shadow-sm">
          {symbol}
        </span>
      </div>
    </div>
  );
};

export default ChessPiece;
