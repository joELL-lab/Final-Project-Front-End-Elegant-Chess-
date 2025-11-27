
import React from 'react';
import ChessPieceComponent from './ChessPiece';
import { ChessPiece } from '@/types/chess';

interface ChessSquareProps {
  piece: ChessPiece | null;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isKingInCheck: boolean;
  onClick: () => void;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  piece,
  isLight,
  isSelected,
  isValidMove,
  isKingInCheck,
  onClick
}) => {
  const baseClasses = "relative flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110";
  
  let backgroundClasses = "";
  let effectClasses = "";
  
  if (isKingInCheck) {
    backgroundClasses = "bg-red-500";
    effectClasses = "shadow-md animate-pulse";
  } else if (isSelected) {
    backgroundClasses = isLight 
      ? "bg-amber-300" 
      : "bg-amber-600";
    effectClasses = "shadow-md";
  } else if (isValidMove) {
    if (piece) {
      backgroundClasses = isLight 
        ? "bg-red-300" 
        : "bg-red-600";
    } else {
      backgroundClasses = isLight 
        ? "bg-emerald-200" 
        : "bg-emerald-500";
    }
    effectClasses = "shadow-sm";
  } else {
    if (isLight) {
      backgroundClasses = "bg-amber-50 hover:bg-amber-100";
    } else {
      backgroundClasses = "bg-amber-800 hover:bg-amber-700";
    }
  }

  return (
    <div 
      className={`${baseClasses} ${backgroundClasses} ${effectClasses}`}
      onClick={onClick}
    >
      {/* Valid Move Indicators */}
      {isValidMove && !piece && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 md:w-4 h-3 md:h-4 bg-emerald-600 rounded-full opacity-70"></div>
        </div>
      )}
      
      {/* Capture Indicator */}
      {isValidMove && piece && (
        <div className="absolute inset-1 border-2 border-red-600 rounded opacity-80"></div>
      )}
      
      {/* Chess Piece */}
      {piece && (
        <div className="relative z-10 transition-transform duration-150 hover:scale-105">
          <ChessPieceComponent 
            type={piece.type} 
            color={piece.color}
            isSelected={isSelected}
          />
        </div>
      )}
    </div>
  );
};

export default ChessSquare;
