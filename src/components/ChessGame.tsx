
import React, { useState, useCallback, useEffect } from 'react';
import ChessBoard from './ChessBoard';
import GameControls from './GameControls';
import GameStatus from './GameStatus';
import { ChessGameState, GameMode } from '@/types/chess';
import { initializeBoard, makeMove, isValidMove, isInCheck, isCheckmate, isStalemate } from '@/utils/chessLogic';
import { useToast } from '@/hooks/use-toast';
import { Crown, Sparkles } from 'lucide-react';

const ChessGame = () => {
  const [gameState, setGameState] = useState<ChessGameState>(() => ({
    board: initializeBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    validMoves: [],
    capturedPieces: { white: [], black: [] },
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    gameMode: 'two-player',
    moveHistory: [],
    recentCapture: undefined
  }));
  const [activeGameId, setActiveGameId] = useState<number | null>(null);

  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

  // autosave helper (POST to create new game or PUT to update existing)
  const saveGame = useCallback(async (stateToSave: ChessGameState) => {
    try {
      const payload = {
        title: 'Saved Game',
        createdAt: new Date().toISOString(),
        players: { whitePlayerId: 1, blackPlayerId: 2 },
        gameMode: stateToSave.gameMode,
        currentPlayer: stateToSave.currentPlayer,
        board: stateToSave.board,
        selectedSquare: stateToSave.selectedSquare,
        validMoves: stateToSave.validMoves,
        capturedPieces: stateToSave.capturedPieces,
        isCheck: stateToSave.isCheck,
        isCheckmate: stateToSave.isCheckmate,
        isStalemate: stateToSave.isStalemate,
        moveHistory: stateToSave.moveHistory,
        recentCapture: stateToSave.recentCapture
      } as any;

      if (activeGameId) {
        const res = await fetch(`${API_BASE}/games/${activeGameId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: activeGameId })
        });
        if (!res.ok) throw new Error('Failed to update game');
        toast({ title: 'Game saved', description: 'Autosaved current game.', variant: 'default' });
      } else {
        const res = await fetch(`${API_BASE}/games`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create game');
        const saved = await res.json();
        if (saved && saved.id) {
          setActiveGameId(saved.id);
        }
        toast({ title: 'Game created', description: 'Autosaved new game.', variant: 'default' });
      }
    } catch (err: any) {
      console.error('Error saving game:', err);
      toast({ title: 'Save failed', description: err?.message || 'Failed to autosave game.', variant: 'destructive' });
      throw err;
    }
  }, [API_BASE, activeGameId, toast]);
  

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameState.isCheckmate || gameState.isStalemate) return;

    const clickedSquare = { row, col };
    const piece = gameState.board[row][col];

    if (!gameState.selectedSquare) {
      if (piece && piece.color === gameState.currentPlayer) {
        const validMoves = getValidMovesForPiece(gameState.board, clickedSquare, gameState.currentPlayer);
        setGameState(prev => ({
          ...prev,
          selectedSquare: clickedSquare,
          validMoves
        }));
      }
      return;
    }

    if (gameState.selectedSquare.row === row && gameState.selectedSquare.col === col) {
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: []
      }));
      return;
    }

    if (piece && piece.color === gameState.currentPlayer) {
      const validMoves = getValidMovesForPiece(gameState.board, clickedSquare, gameState.currentPlayer);
      setGameState(prev => ({
        ...prev,
        selectedSquare: clickedSquare,
        validMoves
      }));
      return;
    }

    const isValid = gameState.validMoves.some(move => move.row === row && move.col === col);
    if (isValid) {
      executeMove(gameState.selectedSquare, clickedSquare);
    } else {
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: []
      }));
    }
  }, [gameState]);

  const executeMove = useCallback((from: { row: number; col: number }, to: { row: number; col: number }) => {
    const result = makeMove(gameState.board, from, to, gameState.currentPlayer, gameState.capturedPieces);
    
    if (!result.success) {
      toast({
        title: "Invalid Move",
        description: result.error,
        variant: "destructive"
      });
      return;
    }

    const newBoard = result.newBoard!;
    const nextPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    
    const inCheck = isInCheck(newBoard, nextPlayer);
    const checkmate = isCheckmate(newBoard, nextPlayer);
    const stalemate = isStalemate(newBoard, nextPlayer);

    const newGameState: ChessGameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedSquare: null,
      validMoves: [],
      capturedPieces: result.capturedPieces || gameState.capturedPieces,
      isCheck: inCheck,
      isCheckmate: checkmate,
      isStalemate: stalemate,
      moveHistory: [...gameState.moveHistory, { 
        from, 
        to, 
        piece: gameState.board[from.row][from.col]!,
        capturedPiece: result.capturedPiece
      }],
      recentCapture: result.capturedPiece
    };

    setGameState(newGameState);

    // Autosave the game state after every move
    saveGame(newGameState).catch(err => {
      // Failed autosave will display a toast already in saveGame; swallow here
    });

    if (checkmate) {
      toast({
        title: "🎉 Checkmate!",
        description: `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} wins!`,
      });
    } else if (stalemate) {
      toast({
        title: "🤝 Stalemate!",
        description: "The game is a draw.",
      });
    } else if (inCheck) {
      toast({
        title: "⚠️ Check!",
        description: `${nextPlayer === 'white' ? 'White' : 'Black'} king is in check.`,
      });
    } else if (result.capturedPiece) {
      toast({
        title: "📦 Piece Captured!",
        description: `${result.capturedPiece.color} ${result.capturedPiece.type} has been captured.`,
      });
    }
  }, [gameState, toast, saveGame]);

  

  const getValidMovesForPiece = (board: any[][], position: { row: number; col: number }, player: string) => {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(board, position, { row, col }, player)) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  };

  const resetGame = useCallback(() => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      validMoves: [],
      capturedPieces: { white: [], black: [] },
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      gameMode: 'two-player',
      moveHistory: [],
      recentCapture: undefined
    });
    setActiveGameId(null);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Modern Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='5' cy='5' r='1'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Elegant Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 bg-clip-text text-transparent">
                Royal Chess
              </h1>
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
            </div>
            <p className="text-slate-400 text-lg md:text-xl font-light">
              Experience the elegance of strategic gameplay
            </p>
          </div>

          {/* Game Layout - Vertical Stack */}
          <div className="flex flex-col items-center gap-6 lg:gap-8">
            {/* Game Controls - Always Above */}
            <div className="w-full max-w-2xl">
              <GameControls
                gameMode={gameState.gameMode}
                onResetGame={resetGame}
              />
            </div>

            {/* Chess Board - Center */}
            <div className="flex justify-center">
              <ChessBoard
                board={gameState.board}
                selectedSquare={gameState.selectedSquare}
                validMoves={gameState.validMoves}
                onSquareClick={handleSquareClick}
                currentPlayer={gameState.currentPlayer}
                isCheck={gameState.isCheck}
              />
            </div>

            {/* Game Status - Always Below */}
            <div className="w-full max-w-2xl">
              <GameStatus
                currentPlayer={gameState.currentPlayer}
                isCheck={gameState.isCheck}
                isCheckmate={gameState.isCheckmate}
                isStalemate={gameState.isStalemate}
                gameMode={gameState.gameMode}
                capturedPieces={gameState.capturedPieces}
                recentCapture={gameState.recentCapture}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
