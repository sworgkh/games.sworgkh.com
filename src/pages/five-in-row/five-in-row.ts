/**
 * Five in Row Game Logic
 * Advanced implementation with 15x15 board, undo functionality, and coordinates
 */

import { 
  createBoard, 
  getFiveInRowWinner, 
  isBoardFull, 
  GameState,
  Position 
} from '../../shared/utils/game-utils.ts';
import { 
  selectElement, 
  selectAllElements, 
  addClass, 
  removeClass, 
  addEventListener, 
  clearElement 
} from '../../shared/utils/dom-helpers.ts';

interface GameMove {
  row: number;
  col: number;
  player: 'X' | 'O';
  moveNumber: number;
}

interface GameScore {
  x: number;
  o: number;
  draws: number;
}

interface GameOptions {
  showCoordinates: boolean;
  highlightLastMove: boolean;
}

class FiveInRowGame {
  private board: string[][];
  private currentPlayer: 'X' | 'O';
  private gameState: GameState;
  private score: GameScore;
  private moveHistory: GameMove[];
  private moveCount: number;
  private options: GameOptions;
  
  // DOM elements
  private gameBoard!: HTMLElement;
  private currentPlayerElement!: HTMLElement;
  private gameMessageElement!: HTMLElement;
  private moveCountElement!: HTMLElement;
  private resetButton!: HTMLButtonElement;
  private undoButton!: HTMLButtonElement;
  private coordinatesCheckbox!: HTMLInputElement;
  private lastMoveCheckbox!: HTMLInputElement;
  private coordinatesElements!: {
    row: HTMLElement;
    col: HTMLElement;
  };
  private scoreElements!: {
    x: HTMLElement;
    o: HTMLElement;
    draws: HTMLElement;
  };

  constructor() {
    this.board = createBoard(15, 15, '');
    this.currentPlayer = 'X';
    this.gameState = 'waiting';
    this.score = { x: 0, o: 0, draws: 0 };
    this.moveHistory = [];
    this.moveCount = 1;
    this.options = {
      showCoordinates: true,
      highlightLastMove: true
    };
    
    this.initializeDOM();
    this.loadScore();
    this.loadOptions();
    this.initializeGame();
  }

  private initializeDOM(): void {
    this.gameBoard = selectElement('#gameBoard')!;
    this.currentPlayerElement = selectElement('#currentPlayer')!;
    this.gameMessageElement = selectElement('#gameMessage')!;
    this.moveCountElement = selectElement('#moveCount')!;
    this.resetButton = selectElement('#resetBtn') as HTMLButtonElement;
    this.undoButton = selectElement('#undoBtn') as HTMLButtonElement;
    this.coordinatesCheckbox = selectElement('#showCoordinates') as HTMLInputElement;
    this.lastMoveCheckbox = selectElement('#highlightLastMove') as HTMLInputElement;
    
    this.coordinatesElements = {
      row: selectElement('#coordinatesRow')!,
      col: selectElement('#coordinatesCol')!
    };
    
    this.scoreElements = {
      x: selectElement('#scoreX')!,
      o: selectElement('#scoreO')!,
      draws: selectElement('#scoreDraw')!
    };

    if (!this.gameBoard || !this.currentPlayerElement || !this.gameMessageElement ||
        !this.resetButton || !this.undoButton || !this.coordinatesCheckbox) {
      throw new Error('Required DOM elements not found');
    }
  }

  private initializeGame(): void {
    this.createBoardElements();
    this.createCoordinateLabels();
    this.attachEventListeners();
    this.updateUI();
    this.gameState = 'playing';
    console.log('🔥 Five in Row game initialized');
  }

  private createBoardElements(): void {
    clearElement(this.gameBoard);
    
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.row = row.toString();
        cell.dataset.col = col.toString();
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', `Cell ${this.getCoordinateLabel(row, col)}`);
        
        addEventListener(cell, 'click', () => this.handleCellClick(row, col));
        addEventListener(cell, 'keydown', (event) => this.handleCellKeydown(event, row, col));
        
        this.gameBoard.appendChild(cell);
      }
    }
  }

  private createCoordinateLabels(): void {
    // Row coordinates (1-15)
    clearElement(this.coordinatesElements.row);
    for (let i = 1; i <= 15; i++) {
      const label = document.createElement('span');
      label.textContent = i.toString();
      this.coordinatesElements.row.appendChild(label);
    }
    
    // Column coordinates (A-O)
    clearElement(this.coordinatesElements.col);
    for (let i = 0; i < 15; i++) {
      const label = document.createElement('span');
      label.textContent = String.fromCharCode(65 + i); // A-O
      this.coordinatesElements.col.appendChild(label);
    }
  }

  private getCoordinateLabel(row: number, col: number): string {
    const colLabel = String.fromCharCode(65 + col); // A-O
    const rowLabel = (row + 1).toString(); // 1-15
    return `${colLabel}${rowLabel}`;
  }

  private attachEventListeners(): void {
    addEventListener(this.resetButton, 'click', () => this.resetGame());
    addEventListener(this.undoButton, 'click', () => this.undoLastMove());
    addEventListener(this.coordinatesCheckbox, 'change', () => this.toggleCoordinates());
    addEventListener(this.lastMoveCheckbox, 'change', () => this.toggleLastMoveHighlight());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => this.handleGlobalKeydown(event));
  }

  private handleCellClick(row: number, col: number): void {
    if (this.gameState !== 'playing' || this.board[row][col] !== '') {
      return;
    }

    this.makeMove(row, col);
  }

  private handleCellKeydown(event: KeyboardEvent, row: number, col: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleCellClick(row, col);
    }
  }

  private handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) return;
    
    switch (event.key.toLowerCase()) {
      case 'r':
        event.preventDefault();
        this.resetGame();
        break;
      case 'u':
        event.preventDefault();
        this.undoLastMove();
        break;
      case 'c':
        event.preventDefault();
        this.coordinatesCheckbox.checked = !this.coordinatesCheckbox.checked;
        this.toggleCoordinates();
        break;
    }
  }

  private makeMove(row: number, col: number): void {
    // Record the move
    const move: GameMove = {
      row,
      col,
      player: this.currentPlayer,
      moveNumber: this.moveCount
    };
    this.moveHistory.push(move);
    
    // Update board state
    this.board[row][col] = this.currentPlayer;
    
    // Update UI
    this.updateCellUI(row, col);
    this.updateLastMoveHighlight();
    
    // Check for win
    const winner = getFiveInRowWinner(this.board);
    const isDraw = isBoardFull(this.board, '');
    
    if (winner) {
      this.handleWin(winner);
    } else if (isDraw) {
      this.handleDraw();
    } else {
      this.switchPlayer();
      this.moveCount++;
      this.updateUI();
    }
    
    // Enable undo button
    this.undoButton.disabled = false;
  }

  private updateCellUI(row: number, col: number): void {
    const cellIndex = row * 15 + col;
    const cell = this.gameBoard.children[cellIndex] as HTMLElement;
    
    if (!cell) return;
    
    cell.textContent = this.currentPlayer;
    addClass(cell, 'occupied', this.currentPlayer.toLowerCase());
    cell.setAttribute('aria-label', 
      `Cell ${this.getCoordinateLabel(row, col)}: ${this.currentPlayer}`);
  }

  private updateLastMoveHighlight(): void {
    if (!this.options.highlightLastMove) return;
    
    // Remove previous highlight
    const previousHighlight = selectElement('.board-cell.last-move');
    if (previousHighlight) {
      removeClass(previousHighlight, 'last-move');
    }
    
    // Highlight last move
    if (this.moveHistory.length > 0) {
      const lastMove = this.moveHistory[this.moveHistory.length - 1];
      const cellIndex = lastMove.row * 15 + lastMove.col;
      const cell = this.gameBoard.children[cellIndex] as HTMLElement;
      if (cell) {
        addClass(cell, 'last-move');
      }
    }
  }

  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
  }

  private handleWin(winner: string): void {
    this.gameState = 'finished';
    this.score[winner.toLowerCase() as 'x' | 'o']++;
    this.saveScore();
    
    this.highlightWinningCells();
    this.updateUI();
    this.celebrateWin(winner);
  }

  private handleDraw(): void {
    this.gameState = 'finished';
    this.score.draws++;
    this.saveScore();
    this.updateUI();
  }

  private highlightWinningCells(): void {
    const winner = this.currentPlayer;
    const directions = [
      { row: 0, col: 1 },   // horizontal
      { row: 1, col: 0 },   // vertical
      { row: 1, col: 1 },   // diagonal \
      { row: 1, col: -1 }   // diagonal /
    ];

    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        for (const direction of directions) {
          const winningPositions: Position[] = [];
          
          // Check if we can form a line of 5 from this position
          for (let i = 0; i < 5; i++) {
            const newRow = row + i * direction.row;
            const newCol = col + i * direction.col;
            
            if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) {
              break;
            }
            
            if (this.board[newRow][newCol] === winner) {
              winningPositions.push({ row: newRow, col: newCol });
            } else {
              break;
            }
          }
          
          // If we found 5 in a row, highlight them
          if (winningPositions.length === 5) {
            winningPositions.forEach(pos => {
              const cellIndex = pos.row * 15 + pos.col;
              const cell = this.gameBoard.children[cellIndex] as HTMLElement;
              if (cell) {
                addClass(cell, 'winning');
              }
            });
            return; // Found the winning line
          }
        }
      }
    }
  }

  private celebrateWin(winner: string): void {
    // Simple celebration effect
    const celebrationEmojis = ['🎉', '🎊', '🏆', '✨', '🌟', '🔥'];
    
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const emoji = document.createElement('div');
        emoji.textContent = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
        emoji.style.cssText = `
          position: fixed;
          top: ${Math.random() * 30}%;
          left: ${Math.random() * 100}%;
          font-size: 2rem;
          animation: celebration-fall 3s ease-out forwards;
          pointer-events: none;
          z-index: 1000;
        `;
        
        if (!document.getElementById('celebration-styles')) {
          const style = document.createElement('style');
          style.id = 'celebration-styles';
          style.textContent = `
            @keyframes celebration-fall {
              0% {
                opacity: 1;
                transform: translateY(-30px) rotate(0deg);
              }
              100% {
                opacity: 0;
                transform: translateY(150vh) rotate(720deg);
              }
            }
          `;
          document.head.appendChild(style);
        }
        
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 3000);
      }, i * 150);
    }
  }

  private undoLastMove(): void {
    if (this.moveHistory.length === 0 || this.gameState === 'finished') {
      return;
    }
    
    const lastMove = this.moveHistory.pop()!;
    
    // Revert board state
    this.board[lastMove.row][lastMove.col] = '';
    
    // Revert UI
    const cellIndex = lastMove.row * 15 + lastMove.col;
    const cell = this.gameBoard.children[cellIndex] as HTMLElement;
    if (cell) {
      cell.textContent = '';
      cell.className = 'board-cell';
      cell.setAttribute('aria-label', `Cell ${this.getCoordinateLabel(lastMove.row, lastMove.col)}`);
    }
    
    // Switch back to previous player
    this.currentPlayer = lastMove.player;
    this.moveCount = lastMove.moveNumber;
    
    // Update last move highlight
    this.updateLastMoveHighlight();
    
    // Disable undo if no more moves
    if (this.moveHistory.length === 0) {
      this.undoButton.disabled = true;
    }
    
    this.updateUI();
    console.log(`↶ Undid move at ${this.getCoordinateLabel(lastMove.row, lastMove.col)}`);
  }

  private resetGame(): void {
    this.board = createBoard(15, 15, '');
    this.currentPlayer = 'X';
    this.gameState = 'playing';
    this.moveHistory = [];
    this.moveCount = 1;
    
    // Clear board UI
    const cells = selectAllElements('.board-cell', this.gameBoard);
    cells.forEach((cell, index) => {
      const row = Math.floor(index / 15);
      const col = index % 15;
      cell.textContent = '';
      cell.className = 'board-cell';
      cell.setAttribute('aria-label', `Cell ${this.getCoordinateLabel(row, col)}`);
    });
    
    this.undoButton.disabled = true;
    this.updateUI();
    console.log('🔄 Game reset');
  }

  private toggleCoordinates(): void {
    this.options.showCoordinates = this.coordinatesCheckbox.checked;
    
    const coordinatesContainer = selectElement('.board-coordinates');
    if (coordinatesContainer) {
      if (this.options.showCoordinates) {
        removeClass(coordinatesContainer, 'hidden');
      } else {
        addClass(coordinatesContainer, 'hidden');
      }
    }
    
    this.saveOptions();
  }

  private toggleLastMoveHighlight(): void {
    this.options.highlightLastMove = this.lastMoveCheckbox.checked;
    
    if (!this.options.highlightLastMove) {
      const highlighted = selectElement('.board-cell.last-move');
      if (highlighted) {
        removeClass(highlighted, 'last-move');
      }
    } else {
      this.updateLastMoveHighlight();
    }
    
    this.saveOptions();
  }

  private updateUI(): void {
    // Update current player display
    this.currentPlayerElement.textContent = this.currentPlayer;
    this.currentPlayerElement.style.backgroundColor = 
      this.currentPlayer === 'X' ? 'var(--color-primary)' : 'var(--color-secondary)';
    
    // Update move count
    this.moveCountElement.textContent = this.moveCount.toString();
    
    // Update game message
    if (this.gameState === 'finished') {
      const winner = getFiveInRowWinner(this.board);
      if (winner) {
        this.gameMessageElement.textContent = `🏆 Player ${winner} wins! ${this.moveHistory.length} moves played.`;
      } else {
        this.gameMessageElement.textContent = '🤝 Game ended in a draw!';
      }
    } else {
      this.gameMessageElement.textContent = `Player ${this.currentPlayer}'s turn - Get 5 in a row!`;
    }
    
    // Update score display
    this.updateScoreDisplay();
  }

  private updateScoreDisplay(): void {
    this.scoreElements.x.textContent = this.score.x.toString();
    this.scoreElements.o.textContent = this.score.o.toString();
    this.scoreElements.draws.textContent = this.score.draws.toString();
  }

  private saveScore(): void {
    localStorage.setItem('fiveInRowScore', JSON.stringify(this.score));
  }

  private loadScore(): void {
    const savedScore = localStorage.getItem('fiveInRowScore');
    if (savedScore) {
      this.score = JSON.parse(savedScore);
    }
    this.updateScoreDisplay();
  }

  private saveOptions(): void {
    localStorage.setItem('fiveInRowOptions', JSON.stringify(this.options));
  }

  private loadOptions(): void {
    const savedOptions = localStorage.getItem('fiveInRowOptions');
    if (savedOptions) {
      this.options = { ...this.options, ...JSON.parse(savedOptions) };
    }
    
    // Apply loaded options to UI
    this.coordinatesCheckbox.checked = this.options.showCoordinates;
    this.lastMoveCheckbox.checked = this.options.highlightLastMove;
  }

  // Public method for debugging
  public getMoveHistory(): GameMove[] {
    return [...this.moveHistory];
  }

  public getCurrentGameState(): any {
    return {
      board: this.board.map(row => [...row]),
      currentPlayer: this.currentPlayer,
      moveCount: this.moveCount,
      gameState: this.gameState,
      score: { ...this.score }
    };
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new FiveInRowGame();
    
    // Expose game instance to global scope for debugging
    (window as any).fiveInRowGame = game;
  } catch (error) {
    console.error('❌ Error initializing Five in Row game:', error);
  }
});

export default FiveInRowGame; 