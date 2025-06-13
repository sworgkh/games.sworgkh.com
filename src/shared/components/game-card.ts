/**
 * GameCard Web Component
 * Reusable card component for displaying games on the home page
 */

interface GameCardData {
  title: string;
  description: string;
  href: string;
  color: 'primary' | 'secondary' | 'accent' | 'warning';
  icon?: string;
}

export class GameCard extends HTMLElement {
  private data: GameCardData;

  constructor() {
    super();
    this.data = {
      title: '',
      description: '',
      href: '',
      color: 'primary'
    };
  }

  connectedCallback(): void {
    this.parseAttributes();
    this.render();
    this.attachEventListeners();
  }

  private parseAttributes(): void {
    this.data = {
      title: this.getAttribute('title') || '',
      description: this.getAttribute('description') || '',
      href: this.getAttribute('href') || '',
      color: (this.getAttribute('color') as any) || 'primary',
      icon: this.getAttribute('icon') || undefined
    };
  }

  private render(): void {
    this.innerHTML = `
      <div class="game-card card game-card--${this.data.color}">
        ${this.data.icon ? `<div class="game-card__icon">${this.data.icon}</div>` : ''}
        <div class="game-card__content">
          <h3 class="game-card__title">${this.data.title}</h3>
          <p class="game-card__description">${this.data.description}</p>
        </div>
        <div class="game-card__action">
          <span class="btn btn-${this.data.color}">Play Game</span>
        </div>
      </div>
    `;

    this.addStyles();
  }

  private addStyles(): void {
    if (document.getElementById('game-card-styles')) return;

    const style = document.createElement('style');
    style.id = 'game-card-styles';
    style.textContent = `
      .game-card {
        cursor: pointer;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-height: 240px;
        position: relative;
        overflow: hidden;
        transition: all var(--transition-normal);
        border: 2px solid transparent;
        width: 100%;
      }

      .game-card:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: var(--shadow-lg);
      }

      .game-card--primary {
        background: linear-gradient(135deg, var(--color-primary) 0%, rgba(255, 179, 230, 0.8) 100%);
      }

      .game-card--secondary {
        background: linear-gradient(135deg, var(--color-secondary) 0%, rgba(179, 229, 252, 0.8) 100%);
      }

      .game-card--accent {
        background: linear-gradient(135deg, var(--color-accent) 0%, rgba(200, 230, 201, 0.8) 100%);
      }

      .game-card--warning {
        background: linear-gradient(135deg, var(--color-warning) 0%, rgba(255, 204, 188, 0.8) 100%);
      }

      .game-card__icon {
        font-size: var(--font-size-3xl);
        margin-bottom: var(--spacing-sm);
        opacity: 0.9;
      }

      .game-card__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--spacing-sm);
        width: 100%;
      }

      .game-card__title {
        color: var(--color-text);
        margin-bottom: var(--spacing-xs);
        font-weight: 700;
      }

      .game-card__description {
        color: var(--color-text);
        opacity: 0.8;
        font-size: var(--font-size-sm);
        line-height: 1.4;
        margin: 0;
      }

      .game-card__action {
        margin-top: var(--spacing-sm);
        width: 100%;
      }

      .game-card .btn {
        font-size: var(--font-size-sm);
        padding: var(--spacing-xs) var(--spacing-md);
        background: rgba(255, 255, 255, 0.9);
        color: var(--color-text);
        border: 2px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(4px);
      }

      .game-card .btn:hover {
        background: rgba(255, 255, 255, 1);
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      @media (max-width: 768px) {
        .game-card {
          min-height: 200px;
        }
        
        .game-card__title {
          font-size: var(--font-size-lg);
        }
        
        .game-card__description {
          font-size: var(--font-size-sm);
        }
      }

      @media (max-width: 480px) {
        .game-card {
          min-height: 180px;
          padding: var(--spacing-sm);
        }
        
        .game-card__icon {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--spacing-xs);
        }
        
        .game-card__title {
          font-size: var(--font-size-base);
          margin-bottom: var(--spacing-xs);
        }
        
        .game-card__description {
          font-size: calc(var(--font-size-sm) - 0.1rem);
        }
        
        .game-card__action {
          margin-top: var(--spacing-xs);
        }
        
        .game-card .btn {
          padding: var(--spacing-xs) var(--spacing-sm);
        }
      }

      /* Screen rotation support */
      @media screen and (orientation: landscape) and (max-height: 600px) {
        .game-card {
          min-height: 150px;
          flex-direction: row;
          text-align: left;
          padding: var(--spacing-xs);
        }
        
        .game-card__icon {
          margin-bottom: 0;
          margin-right: var(--spacing-sm);
        }
        
        .game-card__content {
          align-items: flex-start;
          padding: var(--spacing-xs);
        }
        
        .game-card__action {
          display: flex;
          align-items: center;
          margin-top: 0;
          margin-left: var(--spacing-sm);
        }
      }
    `;
    document.head.appendChild(style);
  }

  private attachEventListeners(): void {
    this.addEventListener('click', this.handleClick.bind(this));
    this.addEventListener('keydown', this.handleKeydown.bind(this));
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'button');
    this.setAttribute('aria-label', `Play ${this.data.title}`);
  }

  private handleClick(): void {
    if (this.data.href) {
      window.location.href = this.data.href;
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick();
    }
  }
}

// Register the custom element
customElements.define('game-card', GameCard); 