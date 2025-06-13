/**
 * Connect Four Game Logic
 * Classic Connect Four with gravity-based coin dropping and 4-in-a-row win detection
 */

import { 
  createBoard, 
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
  player: 'red' | 'yellow';
  moveNumber: number;
}

interface GameScore {
  red: number;
  yellow: number;
  draws: number;
}

interface GameOptions {
  showColumnNumbers: boolean;
  animateDrops: boolean;
}

class ConnectFourGame {
  private board: string[][];
  private currentPlayer: 'red' | 'yellow';
  private gameState: GameState;
  private score: GameScore;
  private moveHistory: GameMove[];
  private moveCount: number;
  private options: GameOptions;
  
  // DOM elements
  private gameBoard!: HTMLElement;
  private dropZone!: HTMLElement;
  private currentPlayerCoin!: HTMLElement;
  private gameMessageElement!: HTMLElement;
  private moveCountElement!: HTMLElement;
  private resetButton!: HTMLButtonElement;
  private undoButton!: HTMLButtonElement;
  private columnNumbersCheckbox!: HTMLInputElement;
  private animateDropsCheckbox!: HTMLInputElement;
  private scoreElements!: {
    red: HTMLElement;
    yellow: HTMLElement;
    draws: HTMLElement;
  };

  constructor() {
    this.board = createBoard(6, 7, ''); // 6 rows, 7 columns for Connect Four
    this.currentPlayer = 'red';
    this.gameState = 'waiting';
    this.score = { red: 0, yellow: 0, draws: 0 };
    this.moveHistory = [];
    this.moveCount = 1;
    this.options = {
      showColumnNumbers: true,
      animateDrops: true
    };
    
    this.initializeDOM();
    this.loadScore();
    this.loadOptions();
    this.initializeGame();
  }

  private initializeDOM(): void {
    this.gameBoard = selectElement('#gameBoard')!;
    this.dropZone = selectElement('#dropZone')!;
    this.currentPlayerCoin = selectElement('#currentPlayerCoin')!;
    this.gameMessageElement = selectElement('#gameMessage')!;
    this.moveCountElement = selectElement('#moveCount')!;
    this.resetButton = selectElement('#resetBtn') as HTMLButtonElement;
    this.undoButton = selectElement('#undoBtn') as HTMLButtonElement;
    this.columnNumbersCheckbox = selectElement('#showColumnNumbers') as HTMLInputElement;
    this.animateDropsCheckbox = selectElement('#animateDrops') as HTMLInputElement;
    
    this.scoreElements = {
      red: selectElement('#scoreRed')!,
      yellow: selectElement('#scoreYellow')!,
      draws: selectElement('#scoreDraw')!
    };

    if (!this.gameBoard || !this.dropZone || !this.currentPlayerCoin ||
        !this.resetButton || !this.undoButton) {
      throw new Error('Required DOM elements not found');
    }
  }

  private initializeGame(): void {
    this.createBoardElements();
    this.createDropZone();
    this.attachEventListeners();
    this.updateUI();
    this.gameState = 'playing';
    console.log('🪙 Connect Four game initialized');
  }

  private createBoardElements(): void {
    clearElement(this.gameBoard);
    
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.row = row.toString();
        cell.dataset.col = col.toString();
        cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);
        
        this.gameBoard.appendChild(cell);
      }
    }
  }

  private createDropZone(): void {
    clearElement(this.dropZone);
    
    for (let col = 0; col < 7; col++) {
      const dropButton = document.createElement('button');
      dropButton.className = 'drop-button';
      dropButton.dataset.col = col.toString();
      
      // Add column number as a separate element inside the button
      const columnNumber = document.createElement('span');
      columnNumber.className = 'column-number';
      // columnNumber.textContent = (col + 1).toString();
      // dropButton.appendChild(columnNumber);
      
      // Add coin preview element
      const coinPreview = document.createElement('div');
      coinPreview.className = 'coin-preview';
      dropButton.appendChild(coinPreview);
      
      // Set the button's aria label
      dropButton.setAttribute('aria-label', `Drop coin in column ${col + 1}`);
      
      // Add hover effect
      addEventListener(dropButton, 'mouseenter', () => {
        if (this.gameState === 'playing') {
          addClass(coinPreview, this.currentPlayer);
        }
      });
      
      addEventListener(dropButton, 'mouseleave', () => {
        removeClass(coinPreview, 'red');
        removeClass(coinPreview, 'yellow');
      });
      
      addEventListener(dropButton, 'click', () => this.handleColumnClick(col));
      
      this.dropZone.appendChild(dropButton);
    }
  }

  private attachEventListeners(): void {
    addEventListener(this.resetButton, 'click', () => this.resetGame());
    addEventListener(this.undoButton, 'click', () => this.undoLastMove());
    addEventListener(this.columnNumbersCheckbox, 'change', () => this.toggleColumnNumbers());
    addEventListener(this.animateDropsCheckbox, 'change', () => this.toggleAnimations());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => this.handleGlobalKeydown(event));
  }

  private handleColumnClick(col: number): void {
    if (this.gameState !== 'playing') {
      return;
    }

    // Find the lowest available row in this column
    const targetRow = this.findLowestRow(col);
    if (targetRow === -1) {
      // Column is full
      this.showColumnFullMessage(col);
      return;
    }

    this.makeMove(targetRow, col);
  }

  private findLowestRow(col: number): number {
    for (let row = 5; row >= 0; row--) { // Start from bottom
      if (this.board[row][col] === '') {
        return row;
      }
    }
    return -1; // Column is full
  }

  private showColumnFullMessage(col: number): void {
    const dropButton = this.dropZone.children[col] as HTMLElement;
    addClass(dropButton, 'column-full');
    setTimeout(() => removeClass(dropButton, 'column-full'), 1000);
  }

  private handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) return;
    
    switch (event.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
        event.preventDefault();
        const col = parseInt(event.key) - 1;
        this.handleColumnClick(col);
        break;
      case 'r':
        event.preventDefault();
        this.resetGame();
        break;
      case 'u':
        event.preventDefault();
        this.undoLastMove();
        break;
    }
  }

  private async makeMove(row: number, col: number): Promise<void> {
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
    
    // Animate the coin drop or update immediately
    if (this.options.animateDrops) {
      await this.animateCoinDrop(row, col);
    } else {
      this.updateCellUI(row, col);
    }
    
    // Update column availability
    this.updateColumnAvailability(col);
    
    // Check for win
    const winner = this.checkConnectFourWin(this.board, this.currentPlayer);
    const isDraw = this.checkDraw();
    
    if (winner) {
      this.handleWin(this.currentPlayer);
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

  private async animateCoinDrop(targetRow: number, targetCol: number): Promise<void> {
    return new Promise((resolve) => {
      // Create a falling coin element
      const fallingCoin = document.createElement('div');
      fallingCoin.className = `falling-coin coin ${this.currentPlayer}`;
      
      // Position it at the top of the target column
      const cellSize = 60; // Approximate cell size
      const leftPosition = targetCol * cellSize + (cellSize / 2) - 16; // Center the coin
      const dropDistance = (targetRow + 1) * cellSize + 60; // Distance to fall
      
      fallingCoin.style.left = `${leftPosition}px`;
      fallingCoin.style.setProperty('--drop-distance', `${dropDistance}px`);
      
      this.gameBoard.appendChild(fallingCoin);
      
      // Start the animation
      setTimeout(() => {
        addClass(fallingCoin, 'animate');
        
        // Remove the falling coin and update the board cell when animation completes
        setTimeout(() => {
          fallingCoin.remove();
          this.updateCellUI(targetRow, targetCol);
          resolve();
        }, 800); // Match animation duration
      }, 50);
    });
  }

  private updateCellUI(row: number, col: number): void {
    const cellIndex = row * 7 + col;
    const cell = this.gameBoard.children[cellIndex] as HTMLElement;
    
    if (!cell) return;
    
    // Create coin element
    const coin = document.createElement('div');
    coin.className = `coin ${this.currentPlayer}`;
    
    cell.appendChild(coin);
    addClass(cell, 'occupied');
    cell.setAttribute('aria-label', 
      `Row ${row + 1}, Column ${col + 1}: ${this.currentPlayer} coin`);
  }

  private updateColumnAvailability(col: number): void {
    const dropButton = this.dropZone.children[col] as HTMLButtonElement;
    const isColumnFull = this.findLowestRow(col) === -1;
    
    if (isColumnFull) {
      dropButton.disabled = true;
      addClass(dropButton, 'column-full');
    }
  }

  private checkConnectFourWin(board: string[][], player: string): boolean {
    const directions = [
      { row: 0, col: 1 },   // horizontal
      { row: 1, col: 0 },   // vertical
      { row: 1, col: 1 },   // diagonal \
      { row: 1, col: -1 }   // diagonal /
    ];

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] !== player) continue;
        
        for (const direction of directions) {
          let count = 1;
          
          // Check in positive direction
          let newRow = row + direction.row;
          let newCol = col + direction.col;
          while (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
                 board[newRow][newCol] === player) {
            count++;
            newRow += direction.row;
            newCol += direction.col;
          }
          
          // Check in negative direction
          newRow = row - direction.row;
          newCol = col - direction.col;
          while (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
                 board[newRow][newCol] === player) {
            count++;
            newRow -= direction.row;
            newCol -= direction.col;
          }
          
          if (count >= 4) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private checkDraw(): boolean {
    // Game is a draw if top row is full and no winner
    for (let col = 0; col < 7; col++) {
      if (this.board[0][col] === '') {
        return false; // Still has empty spaces
      }
    }
    return true;
  }

  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
  }

  private handleWin(winner: string): void {
    this.gameState = 'finished';
    this.score[winner as 'red' | 'yellow']++;
    this.saveScore();
    
    this.highlightWinningCoins();
    this.updateUI();
    this.celebrateWin();
  }

  private handleDraw(): void {
    this.gameState = 'finished';
    this.score.draws++;
    this.saveScore();
    this.updateUI();
  }

  private highlightWinningCoins(): void {
    const directions = [
      { row: 0, col: 1 },   // horizontal
      { row: 1, col: 0 },   // vertical
      { row: 1, col: 1 },   // diagonal \
      { row: 1, col: -1 }   // diagonal /
    ];

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (this.board[row][col] !== this.currentPlayer) continue;
        
        for (const direction of directions) {
          const winningPositions: Position[] = [];
          
          // Collect positions in positive direction
          let currentRow = row;
          let currentCol = col;
          while (currentRow >= 0 && currentRow < 6 && currentCol >= 0 && currentCol < 7 && 
                 this.board[currentRow][currentCol] === this.currentPlayer) {
            winningPositions.push({ row: currentRow, col: currentCol });
            currentRow += direction.row;
            currentCol += direction.col;
          }
          
          // Collect positions in negative direction
          currentRow = row - direction.row;
          currentCol = col - direction.col;
          while (currentRow >= 0 && currentRow < 6 && currentCol >= 0 && currentCol < 7 && 
                 this.board[currentRow][currentCol] === this.currentPlayer) {
            winningPositions.push({ row: currentRow, col: currentCol });
            currentRow -= direction.row;
            currentCol -= direction.col;
          }
          
          // If we found 4 or more in a row, highlight them
          if (winningPositions.length >= 4) {
            winningPositions.forEach(pos => {
              const cellIndex = pos.row * 7 + pos.col;
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

  private celebrateWin(): void {
    // Coin celebration effect
    const celebrationCoins = ['🪙', '💰', '🏆', '✨', '🌟'];
    
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const coin = document.createElement('div');
        coin.textContent = celebrationCoins[Math.floor(Math.random() * celebrationCoins.length)];
        coin.style.cssText = `
          position: fixed;
          top: ${Math.random() * 20}%;
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
        
        document.body.appendChild(coin);
        setTimeout(() => coin.remove(), 3000);
      }, i * 100);
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
    const cellIndex = lastMove.row * 7 + lastMove.col;
    const cell = this.gameBoard.children[cellIndex] as HTMLElement;
    if (cell) {
      clearElement(cell);
      cell.className = 'board-cell';
      cell.setAttribute('aria-label', `Row ${lastMove.row + 1}, Column ${lastMove.col + 1}`);
    }
    
    // Re-enable column if it was full
    const dropButton = this.dropZone.children[lastMove.col] as HTMLButtonElement;
    dropButton.disabled = false;
    removeClass(dropButton, 'column-full');
    
    // Switch back to previous player
    this.currentPlayer = lastMove.player;
    this.moveCount = lastMove.moveNumber;
    
    // Disable undo if no more moves
    if (this.moveHistory.length === 0) {
      this.undoButton.disabled = true;
    }
    
    this.updateUI();
    console.log(`↶ Undid move in column ${lastMove.col + 1}`);
  }

  private resetGame(): void {
    this.board = createBoard(6, 7, '');
    this.currentPlayer = 'red';
    this.gameState = 'playing';
    this.moveHistory = [];
    this.moveCount = 1;
    
    // Clear board UI
    const cells = selectAllElements('.board-cell', this.gameBoard);
    cells.forEach((cell, index) => {
      const row = Math.floor(index / 7);
      const col = index % 7;
      clearElement(cell);
      cell.className = 'board-cell';
      cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);
    });
    
    // Re-enable all drop buttons
    const dropButtons = selectAllElements('.drop-button', this.dropZone);
    dropButtons.forEach(button => {
      (button as HTMLButtonElement).disabled = false;
      removeClass(button, 'column-full');
      removeClass(button, 'red');
      removeClass(button, 'yellow');
    });
    
    this.undoButton.disabled = true;
    this.updateUI();
    console.log('🔄 Game reset');
  }

  private toggleColumnNumbers(): void {
    this.options.showColumnNumbers = this.columnNumbersCheckbox.checked;
    
    const dropButtons = selectAllElements('.drop-button', this.dropZone);
    dropButtons.forEach((button, index) => {
      const columnNumber = button.querySelector('.column-number') as HTMLElement;
      if (columnNumber) {
        columnNumber.textContent = this.options.showColumnNumbers ? (index + 1).toString() : '';
        columnNumber.style.display = this.options.showColumnNumbers ? 'block' : 'none';
      }
    });
    
    this.saveOptions();
  }

  private toggleAnimations(): void {
    this.options.animateDrops = this.animateDropsCheckbox.checked;
    this.saveOptions();
  }

  private updateUI(): void {
    // Update current player display
    const coinElement = this.currentPlayerCoin.querySelector('.coin');
    if (coinElement) {
      coinElement.className = `coin ${this.currentPlayer}`;
    }
    
    // Update drop buttons to match current player color
    const dropButtons = selectAllElements('.drop-button', this.dropZone);
    dropButtons.forEach(button => {
      // Remove any previous player classes
      removeClass(button, 'red');
      removeClass(button, 'yellow');
      
      // Add current player class if game is still playing
      if (this.gameState === 'playing') {
        addClass(button, this.currentPlayer);
      }
    });
    
    // Update move count
    this.moveCountElement.textContent = this.moveCount.toString();
    
    // Update game message
    if (this.gameState === 'finished') {
      if (this.checkConnectFourWin(this.board, 'red') || this.checkConnectFourWin(this.board, 'yellow')) {
        const winner = this.currentPlayer;
        this.gameMessageElement.textContent = `🏆 ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins! ${this.moveHistory.length} moves played.`;
      } else {
        this.gameMessageElement.textContent = '🤝 Game ended in a draw!';
      }
    } else {
      this.gameMessageElement.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s turn - Drop a coin!`;
    }
    
    // Update score display
    this.updateScoreDisplay();
  }

  private updateScoreDisplay(): void {
    this.scoreElements.red.textContent = this.score.red.toString();
    this.scoreElements.yellow.textContent = this.score.yellow.toString();
    this.scoreElements.draws.textContent = this.score.draws.toString();
  }

  private saveScore(): void {
    localStorage.setItem('connectFourScore', JSON.stringify(this.score));
  }

  private loadScore(): void {
    const savedScore = localStorage.getItem('connectFourScore');
    if (savedScore) {
      this.score = JSON.parse(savedScore);
    }
    this.updateScoreDisplay();
  }

  private saveOptions(): void {
    localStorage.setItem('connectFourOptions', JSON.stringify(this.options));
  }

  private loadOptions(): void {
    const savedOptions = localStorage.getItem('connectFourOptions');
    if (savedOptions) {
      try {
        const parsedOptions = JSON.parse(savedOptions);
        this.options = { ...this.options, ...parsedOptions };
      } catch (e) {
        console.error('Failed to parse saved options', e);
      }
    }
    
    // Update checkbox states
    this.columnNumbersCheckbox.checked = this.options.showColumnNumbers;
    this.animateDropsCheckbox.checked = this.options.animateDrops;
    
    // Initialize column numbers visibility
    setTimeout(() => {
      const dropButtons = selectAllElements('.drop-button', this.dropZone);
      dropButtons.forEach((button, index) => {
        const columnNumber = button.querySelector('.column-number') as HTMLElement;
        if (columnNumber) {
          columnNumber.textContent = this.options.showColumnNumbers ? (index + 1).toString() : '';
          columnNumber.style.display = this.options.showColumnNumbers ? 'block' : 'none';
        }
      });
    }, 0);
  }

  // Public methods for debugging
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
    const game = new ConnectFourGame();
    
    // Expose game instance to global scope for debugging
    (window as any).connectFourGame = game;
  } catch (error) {
    console.error('❌ Error initializing Connect Four game:', error);
  }
});

export default ConnectFourGame; 