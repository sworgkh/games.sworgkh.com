/**
 * Game Utilities
 * Common functions for game logic across different games
 */

export type GameState = 'waiting' | 'playing' | 'finished';
export type Player = 'X' | 'O' | 1 | 2;

// Generic game board utilities
export function createBoard<T>(rows: number, cols: number, initialValue: T): T[][] {
  return Array(rows).fill(null).map(() => Array(cols).fill(initialValue));
}

export function isBoardFull<T>(board: T[][], emptyValue: T): boolean {
  return board.every(row => row.every(cell => cell !== emptyValue));
}

export function getBoardDimensions<T>(board: T[][]): { rows: number; cols: number } {
  return {
    rows: board.length,
    cols: board[0]?.length || 0
  };
}

export function copyBoard<T>(board: T[][]): T[][] {
  return board.map(row => [...row]);
}

// Position utilities
export interface Position {
  row: number;
  col: number;
}

export function isValidPosition(pos: Position, rows: number, cols: number): boolean {
  return pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols;
}

export function getNeighbors(pos: Position, rows: number, cols: number): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newPos = { row: pos.row + dr, col: pos.col + dc };
    if (isValidPosition(newPos, rows, cols)) {
      neighbors.push(newPos);
    }
  }

  return neighbors;
}

// Line checking utilities (for tic-tac-toe and five-in-row)
export function checkLine<T>(
  board: T[][],
  start: Position,
  direction: Position,
  length: number,
  target: T
): boolean {
  for (let i = 0; i < length; i++) {
    const pos = {
      row: start.row + i * direction.row,
      col: start.col + i * direction.col
    };
    
    if (!isValidPosition(pos, board.length, board[0].length) ||
        board[pos.row][pos.col] !== target) {
      return false;
    }
  }
  return true;
}

export function checkWinCondition<T>(
  board: T[][],
  target: T,
  winLength: number
): boolean {
  const directions = [
    { row: 0, col: 1 },   // horizontal
    { row: 1, col: 0 },   // vertical
    { row: 1, col: 1 },   // diagonal \
    { row: 1, col: -1 }   // diagonal /
  ];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      for (const direction of directions) {
        if (checkLine(board, { row, col }, direction, winLength, target)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Tic-tac-toe specific utilities
export function checkTicTacToeWin(board: string[][], player: string): boolean {
  return checkWinCondition(board, player, 3);
}

export function getTicTacToeWinner(board: string[][]): string | null {
  if (checkTicTacToeWin(board, 'X')) return 'X';
  if (checkTicTacToeWin(board, 'O')) return 'O';
  return null;
}

export function isTicTacToeDraw(board: string[][]): boolean {
  return isBoardFull(board, '') && !getTicTacToeWinner(board);
}

// Five-in-row specific utilities
export function checkFiveInRowWin(board: string[][], player: string): boolean {
  return checkWinCondition(board, player, 5);
}

export function getFiveInRowWinner(board: string[][]): string | null {
  if (checkFiveInRowWin(board, 'X')) return 'X';
  if (checkFiveInRowWin(board, 'O')) return 'O';
  return null;
}

// Language card utilities
export interface LanguageData {
  english: string[];
  hebrew: string[];
  russian: string[];
}

export const ALPHABETS: LanguageData = {
  english: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  hebrew: 'אבגדהוזחטיכלמנסעפצקרשת'.split(''),
  russian: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')
};

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// General utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}

export function formatGameTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
} 