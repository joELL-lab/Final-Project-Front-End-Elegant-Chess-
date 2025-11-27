
import React from 'react';
import ChessSquare from './ChessSquare';
import { ChessPiece } from '@/types/chess';

interface ChessBoardProps {
  board: (ChessPiece | null)[][];
  selectedSquare: { row: number; col: number } | null;
  validMoves: { row: number; col: number }[];
  onSquareClick: (row: number, col: number) => void;
  currentPlayer: 'white' | 'black';
  isCheck: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  validMoves,
  onSquareClick,
  currentPlayer,
  isCheck
}) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const findKingPosition = (color: 'white' | 'black') => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  };

  const kingPosition = isCheck ? findKingPosition(currentPlayer) : null;

  return (
    <div className="relative">
      {/* Elegant Container */}
      <div className="relative p-6 md:p-8 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 shadow-xl">
        {/* Subtle Border Enhancement */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none"></div>

        {/* Rank Labels (Left) */}
        <div className="absolute left-2 md:left-3 top-6 md:top-8 flex flex-col justify-around h-[320px] md:h-[480px] lg:h-[560px] text-white/70 font-medium text-xs md:text-sm">
          {ranks.map(rank => (
            <div key={rank} className="h-10 md:h-[60px] lg:h-[70px] flex items-center">
              <span className="bg-black/10 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                {rank}
              </span>
            </div>
          ))}
        </div>

        {/* File Labels (Bottom) */}
        <div className="absolute bottom-2 md:bottom-3 left-6 md:left-8 flex justify-around w-[320px] md:w-[480px] lg:w-[560px] text-white/70 font-medium text-xs md:text-sm">
          {files.map(file => (
            <div key={file} className="w-10 md:w-[60px] lg:w-[70px] flex justify-center">
              <span className="bg-black/10 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                {file}
              </span>
            </div>
          ))}
        </div>

        {/* Chess Board */}
        <div className="relative">
          <div className="grid grid-cols-8 gap-0 w-[320px] md:w-[480px] lg:w-[560px] h-[320px] md:h-[480px] lg:h-[560px] rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
                const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
                const isKingInCheck = kingPosition?.row === rowIndex && kingPosition?.col === colIndex;
                const isLight = (rowIndex + colIndex) % 2 === 0;

                return (
                  <ChessSquare
                    key={`${rowIndex}-${colIndex}`}
                    piece={piece}
                    isLight={isLight}
                    isSelected={isSelected}
                    isValidMove={isValidMove}
                    isKingInCheck={isKingInCheck}
                    onClick={() => onSquareClick(rowIndex, colIndex)}
                  />
                );
              })
            )}
          </div>
          
          {/* Subtle Inner Shadow */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10 rounded-xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
