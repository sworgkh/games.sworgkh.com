/**
 * Tic Tac Toe Game Logic
 * Complete implementation of the classic tic-tac-toe game
 */

import { 
  createBoard, 
  getTicTacToeWinner, 
  isTicTacToeDraw, 
  GameState 
} from '../../shared/utils/game-utils.ts';
import { 
  selectElement, 
  selectAllElements, 
  addClass, 
  removeClass, 
  addEventListener 
} from '../../shared/utils/dom-helpers.ts';

interface GameScore {
  x: number;
  o: number;
  draws: number;
}

class TicTacToeGame {
  private board: string[][];
  private currentPlayer: 'X' | 'O';
  private gameState: GameState;
  private score: GameScore;
  
  // DOM elements
  private gameBoard!: HTMLElement;
  private currentPlayerElement!: HTMLElement;
  private gameMessageElement!: HTMLElement;
  private resetButton!: HTMLElement;
  private scoreElements!: {
    x: HTMLElement;
    o: HTMLElement;
    draws: HTMLElement;
  };

  constructor() {
    this.board = createBoard(3, 3, '');
    this.currentPlayer = 'X';
    this.gameState = 'waiting';
    this.score = { x: 0, o: 0, draws: 0 };
    
    this.initializeDOM();
    this.loadScore();
    this.initializeGame();
  }

  private initializeDOM(): void {
    this.gameBoard = selectElement('#gameBoard')!;
    this.currentPlayerElement = selectElement('#currentPlayer')!;
    this.gameMessageElement = selectElement('#gameMessage')!;
    this.resetButton = selectElement('#resetBtn')!;
    
    this.scoreElements = {
      x: selectElement('#scoreX')!,
      o: selectElement('#scoreO')!,
      draws: selectElement('#scoreDraw')!
    };

    if (!this.gameBoard || !this.currentPlayerElement || !this.gameMessageElement || !this.resetButton) {
      throw new Error('Required DOM elements not found');
    }
  }

  private initializeGame(): void {
    this.createBoardElements();
    this.attachEventListeners();
    this.updateUI();
    this.gameState = 'playing';
    console.log('🎮 Tic Tac Toe game initialized');
  }

  private createBoardElements(): void {
    this.gameBoard.innerHTML = '';
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.row = row.toString();
        cell.dataset.col = col.toString();
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', `Cell ${row + 1}, ${col + 1}`);
        
        addEventListener(cell, 'click', () => this.handleCellClick(row, col));
        addEventListener(cell, 'keydown', (event) => this.handleCellKeydown(event, row, col));
        
        this.gameBoard.appendChild(cell);
      }
    }
  }

  private attachEventListeners(): void {
    addEventListener(this.resetButton, 'click', () => this.resetGame());
    
    // Add keyboard navigation for the board
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
    if (event.key === 'r' || event.key === 'R') {
      if (event.ctrlKey || event.metaKey) return; // Don't interfere with browser refresh
      this.resetGame();
    }
  }

  private makeMove(row: number, col: number): void {
    // Update board state
    this.board[row][col] = this.currentPlayer;
    
    // Update UI
    this.updateCellUI(row, col);
    
    // Check for win or draw
    const winner = getTicTacToeWinner(this.board);
    const isDraw = isTicTacToeDraw(this.board);
    
    if (winner) {
      this.handleWin(winner);
    } else if (isDraw) {
      this.handleDraw();
    } else {
      this.switchPlayer();
      this.updateUI();
    }
  }

  private updateCellUI(row: number, col: number): void {
    const cellIndex = row * 3 + col;
    const cell = this.gameBoard.children[cellIndex] as HTMLElement;
    
    if (!cell) return;
    
    cell.textContent = this.currentPlayer;
    addClass(cell, 'occupied', this.currentPlayer.toLowerCase());
    cell.setAttribute('aria-label', `Cell ${row + 1}, ${col + 1}: ${this.currentPlayer}`);
    
    // Add animation
    cell.style.animation = 'none';
    cell.offsetHeight; // Trigger reflow
    cell.style.animation = 'slideIn 0.3s ease-out';
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
    const winningCombinations = [
      // Rows
      [[0,0], [0,1], [0,2]],
      [[1,0], [1,1], [1,2]],
      [[2,0], [2,1], [2,2]],
      // Columns
      [[0,0], [1,0], [2,0]],
      [[0,1], [1,1], [2,1]],
      [[0,2], [1,2], [2,2]],
      // Diagonals
      [[0,0], [1,1], [2,2]],
      [[0,2], [1,1], [2,0]]
    ];

    for (const combination of winningCombinations) {
      const [pos1, pos2, pos3] = combination;
      if (
        this.board[pos1[0]][pos1[1]] === this.currentPlayer &&
        this.board[pos2[0]][pos2[1]] === this.currentPlayer &&
        this.board[pos3[0]][pos3[1]] === this.currentPlayer
      ) {
        // Highlight winning cells
        combination.forEach(([row, col]) => {
          const cellIndex = row * 3 + col;
          const cell = this.gameBoard.children[cellIndex] as HTMLElement;
          addClass(cell, 'winning');
        });
        break;
      }
    }
  }

  private celebrateWin(winner: string): void {
    // Add celebration animation
    const gameContainer = selectElement('.app');
    if (gameContainer) {
      addClass(gameContainer, 'game-won');
      setTimeout(() => removeClass(gameContainer, 'game-won'), 3000);
    }

    // Show confetti-like effect (simple emoji animation)
    this.showCelebration();
  }

  private showCelebration(): void {
    const celebrationEmojis = ['🎉', '🎊', '🏆', '✨', '🌟'];
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const emoji = document.createElement('div');
        emoji.textContent = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
        emoji.style.cssText = `
          position: fixed;
          top: ${Math.random() * 20}%;
          left: ${Math.random() * 100}%;
          font-size: 2rem;
          animation: celebration-fall 2s ease-out forwards;
          pointer-events: none;
          z-index: 1000;
        `;
        
        // Add celebration animation
        if (!document.getElementById('celebration-styles')) {
          const style = document.createElement('style');
          style.id = 'celebration-styles';
          style.textContent = `
            @keyframes celebration-fall {
              0% {
                opacity: 1;
                transform: translateY(-20px) rotate(0deg);
              }
              100% {
                opacity: 0;
                transform: translateY(100vh) rotate(360deg);
              }
            }
          `;
          document.head.appendChild(style);
        }
        
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 2000);
      }, i * 200);
    }
  }

  private resetGame(): void {
    this.board = createBoard(3, 3, '');
    this.currentPlayer = 'X';
    this.gameState = 'playing';
    
    // Clear board UI
    const cells = selectAllElements('.board-cell', this.gameBoard);
    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'board-cell';
      cell.setAttribute('aria-label', cell.getAttribute('aria-label')?.split(':')[0] || '');
    });
    
    // Remove game won state
    const gameContainer = selectElement('.app');
    if (gameContainer) {
      removeClass(gameContainer, 'game-won');
    }
    
    this.updateUI();
    console.log('🔄 Game reset');
  }

  private updateUI(): void {
    // Update current player display
    this.currentPlayerElement.textContent = this.currentPlayer;
    this.currentPlayerElement.style.backgroundColor = 
      this.currentPlayer === 'X' ? 'var(--color-primary)' : 'var(--color-secondary)';
    
    // Update game message
    if (this.gameState === 'finished') {
      const winner = getTicTacToeWinner(this.board);
      if (winner) {
        this.gameMessageElement.textContent = `🏆 Player ${winner} wins!`;
      } else {
        this.gameMessageElement.textContent = '🤝 It\'s a draw!';
      }
    } else {
      this.gameMessageElement.textContent = `Player ${this.currentPlayer}'s turn`;
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
    localStorage.setItem('ticTacToeScore', JSON.stringify(this.score));
  }

  private loadScore(): void {
    const savedScore = localStorage.getItem('ticTacToeScore');
    if (savedScore) {
      this.score = JSON.parse(savedScore);
    }
    this.updateScoreDisplay();
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    new TicTacToeGame();
  } catch (error) {
    console.error('❌ Error initializing Tic Tac Toe game:', error);
  }
});

export default TicTacToeGame; 