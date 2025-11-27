
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';
export type GameMode = 'two-player';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
}

export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

export interface ChessGameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  selectedSquare: Position | null;
  validMoves: Position[];
  capturedPieces: CapturedPieces;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  gameMode: GameMode;
  moveHistory: Move[];
  recentCapture?: ChessPiece;
}

export interface MoveResult {
  success: boolean;
  newBoard?: (ChessPiece | null)[][];
  capturedPieces?: CapturedPieces;
  capturedPiece?: ChessPiece;
  error?: string;
}
