/**
 * Home Page TypeScript
 * Main entry point for the home page functionality
 */

import '../../shared/components/game-card.ts';

// Initialize the home page
class HomePage {
  private gameCards: NodeListOf<HTMLElement>;
  private instructionCards: NodeListOf<HTMLElement>;

  constructor() {
    this.gameCards = document.querySelectorAll('game-card');
    this.instructionCards = document.querySelectorAll('.instruction');
    this.init();
  }

  private init(): void {
    this.setupAnimations();
    this.setupKeyboardNavigation();
    this.setupAnalytics();
    console.log('🎮 ABC Games Home Page initialized');
  }

  private setupAnimations(): void {
    // Animate instructions cards on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe instruction cards
    this.instructionCards.forEach(card => {
      observer.observe(card);
    });

    // Add CSS for animation
    this.addAnimationStyles();
  }

  private addAnimationStyles(): void {
    if (document.getElementById('home-animations')) return;

    const style = document.createElement('style');
    style.id = 'home-animations';
    style.textContent = `
      .instruction {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
      }
      
      .instruction.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      .instruction:nth-child(1) { transition-delay: 0.1s; }
      .instruction:nth-child(2) { transition-delay: 0.2s; }
      .instruction:nth-child(3) { transition-delay: 0.3s; }
    `;
    document.head.appendChild(style);
  }

  private setupKeyboardNavigation(): void {
    // Add keyboard navigation for game cards
    this.gameCards.forEach((card, index) => {
      card.addEventListener('keydown', (event: Event) => {
        const keyEvent = event as KeyboardEvent;
        
        switch (keyEvent.key) {
          case 'ArrowRight':
            event.preventDefault();
            this.focusNextCard(index, 1);
            break;
          case 'ArrowLeft':
            event.preventDefault();
            this.focusNextCard(index, -1);
            break;
        }
      });
    });
  }

  private focusNextCard(currentIndex: number, direction: number): void {
    const nextIndex = (currentIndex + direction + this.gameCards.length) % this.gameCards.length;
    (this.gameCards[nextIndex] as HTMLElement).focus();
  }

  private setupAnalytics(): void {
    // Simple analytics for game card clicks
    this.gameCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const title = card.getAttribute('title') || 'Unknown Game';
        console.log(`🎯 Game selected: ${title} (Card ${index + 1})`);
        
        // You can add more sophisticated analytics here
        this.trackGameSelection(title);
      });
    });
  }

  private trackGameSelection(gameTitle: string): void {
    // Store in localStorage for simple analytics
    const analytics = JSON.parse(localStorage.getItem('abcGamesAnalytics') || '{}');
    analytics[gameTitle] = (analytics[gameTitle] || 0) + 1;
    analytics.lastPlayed = new Date().toISOString();
    localStorage.setItem('abcGamesAnalytics', JSON.stringify(analytics));
  }
}

// Enhanced page loading with error handling
document.addEventListener('DOMContentLoaded', () => {
  try {
    new HomePage();
  } catch (error) {
    console.error('❌ Error initializing home page:', error);
  }
});

// Add page visibility API for performance
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('👁️ Page became visible');
  } else {
    console.log('👁️ Page became hidden');
  }
});

// Add service worker registration placeholder for future PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Service worker registration can be added here in the future
    console.log('🔧 Service Worker API available');
  });
}

export default HomePage; 