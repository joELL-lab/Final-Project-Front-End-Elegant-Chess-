
import { ChessPiece, Position, MoveResult, CapturedPieces } from '@/types/chess';

export const initializeBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Place other pieces
  const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] as const;
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }
  
  return board;
};

export const isValidMove = (
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  currentPlayer: string
): boolean => {
  if (from.row < 0 || from.row > 7 || from.col < 0 || from.col > 7) return false;
  if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) return false;
  
  const piece = board[from.row][from.col];
  if (!piece || piece.color !== currentPlayer) return false;
  
  const targetPiece = board[to.row][to.col];
  if (targetPiece && targetPiece.color === piece.color) return false;
  
  return isValidPieceMove(board, piece, from, to);
};

const isValidPieceMove = (
  board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position,
  to: Position
): boolean => {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);
  
  switch (piece.type) {
    case 'pawn':
      return isValidPawnMove(board, piece, from, to, rowDiff, colDiff);
    case 'rook':
      return (rowDiff === 0 || colDiff === 0) && isPathClear(board, from, to);
    case 'bishop':
      return absRowDiff === absColDiff && isPathClear(board, from, to);
    case 'queen':
      return (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) && isPathClear(board, from, to);
    case 'king':
      return absRowDiff <= 1 && absColDiff <= 1;
    case 'knight':
      return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
    default:
      return false;
  }
};

const isValidPawnMove = (
  board: (ChessPiece | null)[][],
  piece: ChessPiece,
  from: Position,
  to: Position,
  rowDiff: number,
  colDiff: number
): boolean => {
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  const targetPiece = board[to.row][to.col];
  
  // Forward move
  if (colDiff === 0) {
    if (targetPiece) return false; // Can't capture forward
    if (rowDiff === direction) return true; // One square forward
    if (from.row === startRow && rowDiff === 2 * direction) return true; // Two squares from start
  }
  
  // Diagonal capture
  if (Math.abs(colDiff) === 1 && rowDiff === direction) {
    return targetPiece !== null; // Must capture a piece
  }
  
  return false;
};

const isPathClear = (board: (ChessPiece | null)[][], from: Position, to: Position): boolean => {
  const rowStep = to.row === from.row ? 0 : (to.row - from.row) / Math.abs(to.row - from.row);
  const colStep = to.col === from.col ? 0 : (to.col - from.col) / Math.abs(to.col - from.col);
  
  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;
  
  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) return false;
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return true;
};

export const makeMove = (
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  currentPlayer: string,
  currentCapturedPieces: CapturedPieces
): MoveResult => {
  if (!isValidMove(board, from, to, currentPlayer)) {
    return { success: false, error: 'Invalid move' };
  }
  
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  const capturedPiece = newBoard[to.row][to.col];
  
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  // Mark piece as moved
  if (piece) {
    piece.hasMoved = true;
  }
  
  // Check if move puts own king in check
  if (wouldBeInCheck(newBoard, currentPlayer)) {
    return { success: false, error: 'Move would put king in check' };
  }
  
  // Update captured pieces
  let updatedCapturedPieces = { ...currentCapturedPieces };
  if (capturedPiece) {
    if (capturedPiece.color === 'white') {
      updatedCapturedPieces.white = [...updatedCapturedPieces.white, capturedPiece];
    } else {
      updatedCapturedPieces.black = [...updatedCapturedPieces.black, capturedPiece];
    }
  }
  
  return { 
    success: true, 
    newBoard, 
    capturedPieces: updatedCapturedPieces,
    capturedPiece: capturedPiece || undefined
  };
};

export const isInCheck = (board: (ChessPiece | null)[][], color: string): boolean => {
  const kingPosition = findKing(board, color);
  if (!kingPosition) return false;
  
  return isSquareAttacked(board, kingPosition, color === 'white' ? 'black' : 'white');
};

const wouldBeInCheck = (board: (ChessPiece | null)[][], color: string): boolean => {
  return isInCheck(board, color);
};

const findKing = (board: (ChessPiece | null)[][], color: string): Position | null => {
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

const isSquareAttacked = (board: (ChessPiece | null)[][], position: Position, attackerColor: string): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === attackerColor) {
        if (isValidPieceMove(board, piece, { row, col }, position)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const isCheckmate = (board: (ChessPiece | null)[][], color: string): boolean => {
  if (!isInCheck(board, color)) return false;
  return !hasValidMoves(board, color);
};

export const isStalemate = (board: (ChessPiece | null)[][], color: string): boolean => {
  if (isInCheck(board, color)) return false;
  return !hasValidMoves(board, color);
};

const hasValidMoves = (board: (ChessPiece | null)[][], color: string): boolean => {
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(board, { row: fromRow, col: fromCol }, { row: toRow, col: toCol }, color)) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
};
