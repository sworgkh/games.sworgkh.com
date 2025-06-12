/**
 * Language Cards Game Logic
 * Display alphabets from English, Hebrew, and Russian languages
 */

import { ALPHABETS, shuffleArray } from '../../shared/utils/game-utils.ts';
import { 
  selectElement, 
  selectAllElements, 
  addClass, 
  removeClass, 
  addEventListener, 
  clearElement 
} from '../../shared/utils/dom-helpers.ts';

interface LetterData {
  letter: string;
  phonetic?: string;
  index: number;
}

interface PhoneticMaps {
  english: Record<string, string>;
  hebrew: Record<string, string>;
  russian: Record<string, string>;
}

class LanguageCardsGame {
  private containers!: {
    english: HTMLElement;
    hebrew: HTMLElement;
    russian: HTMLElement;
  };
  
  private shuffleBtn!: HTMLElement;
  private resetBtn!: HTMLElement;
  private phoneticCheckbox!: HTMLInputElement;
  
  private originalOrder!: {
    english: LetterData[];
    hebrew: LetterData[];
    russian: LetterData[];
  };
  
  private currentOrder!: {
    english: LetterData[];
    hebrew: LetterData[];
    russian: LetterData[];
  };
  
  private showPhonetics: boolean = false;
  
  // Phonetic pronunciation guides
  private phoneticMaps: PhoneticMaps = {
    english: {
      'A': 'ay', 'B': 'bee', 'C': 'see', 'D': 'dee', 'E': 'ee',
      'F': 'eff', 'G': 'jee', 'H': 'aych', 'I': 'ai', 'J': 'jay',
      'K': 'kay', 'L': 'ell', 'M': 'em', 'N': 'en', 'O': 'oh',
      'P': 'pee', 'Q': 'kyoo', 'R': 'arr', 'S': 'ess', 'T': 'tee',
      'U': 'yoo', 'V': 'vee', 'W': 'double-yoo', 'X': 'eks', 'Y': 'wai', 'Z': 'zee'
    },
    hebrew: {
      'א': 'aleph', 'ב': 'bet', 'ג': 'gimel', 'ד': 'dalet', 'ה': 'hey',
      'ו': 'vav', 'ז': 'zayin', 'ח': 'chet', 'ט': 'tet', 'י': 'yod',
      'כ': 'kaf', 'ל': 'lamed', 'מ': 'mem', 'ן': 'nun sofit', 'נ': 'nun',
      'ס': 'samech', 'ע': 'ayin', 'פ': 'pey', 'ף': 'pey sofit', 'צ': 'tzadi',
      'ץ': 'tzadi sofit', 'ק': 'quf', 'ר': 'resh', 'ש': 'shin', 'ת': 'tav'
    },
    russian: {
      'А': 'ah', 'Б': 'beh', 'В': 'veh', 'Г': 'geh', 'Д': 'deh',
      'Е': 'yeh', 'Ё': 'yo', 'Ж': 'zheh', 'З': 'zeh', 'И': 'ee',
      'Й': 'ee kratkoye', 'К': 'kah', 'Л': 'el', 'М': 'em', 'Н': 'en',
      'О': 'oh', 'П': 'peh', 'Р': 'er', 'С': 'es', 'Т': 'teh',
      'У': 'oo', 'Ф': 'ef', 'Х': 'khah', 'Ц': 'tseh', 'Ч': 'cheh',
      'Ш': 'shah', 'Щ': 'shchah', 'Ъ': 'tvyordiy znak', 'Ы': 'ih', 'Ь': 'myagkiy znak',
      'Э': 'eh', 'Ю': 'yoo', 'Я': 'yah'
    }
  };

  constructor() {
    this.initializeDOM();
    this.initializeData();
    this.renderAllLanguages();
    this.attachEventListeners();
    console.log('📚 Language Cards game initialized');
  }

  private initializeDOM(): void {
    this.containers = {
      english: selectElement('#englishLetters')!,
      hebrew: selectElement('#hebrewLetters')!,
      russian: selectElement('#russianLetters')!
    };
    
    this.shuffleBtn = selectElement('#shuffleBtn')!;
    this.resetBtn = selectElement('#resetBtn')!;
    this.phoneticCheckbox = selectElement('#showPhonetics') as HTMLInputElement;

    if (!this.containers.english || !this.containers.hebrew || !this.containers.russian ||
        !this.shuffleBtn || !this.resetBtn || !this.phoneticCheckbox) {
      throw new Error('Required DOM elements not found');
    }
  }

  private initializeData(): void {
    // Create letter data arrays with indices
    this.originalOrder = {
      english: ALPHABETS.english.map((letter, index) => ({
        letter,
        phonetic: this.phoneticMaps.english[letter],
        index
      })),
      hebrew: ALPHABETS.hebrew.map((letter, index) => ({
        letter,
        phonetic: this.phoneticMaps.hebrew[letter],
        index
      })),
      russian: ALPHABETS.russian.map((letter, index) => ({
        letter,
        phonetic: this.phoneticMaps.russian[letter],
        index
      }))
    };

    // Initialize current order with original order
    this.currentOrder = {
      english: [...this.originalOrder.english],
      hebrew: [...this.originalOrder.hebrew],
      russian: [...this.originalOrder.russian]
    };
  }

  private attachEventListeners(): void {
    addEventListener(this.shuffleBtn, 'click', () => this.shuffleLetters());
    addEventListener(this.resetBtn, 'click', () => this.resetOrder());
    addEventListener(this.phoneticCheckbox, 'change', () => this.togglePhonetics());
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => this.handleKeyboard(event));
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) return;
    
    switch (event.key.toLowerCase()) {
      case 's':
        event.preventDefault();
        this.shuffleLetters();
        break;
      case 'r':
        event.preventDefault();
        this.resetOrder();
        break;
      case 'p':
        event.preventDefault();
        this.phoneticCheckbox.checked = !this.phoneticCheckbox.checked;
        this.togglePhonetics();
        break;
    }
  }

  private renderAllLanguages(): void {
    this.renderLanguage('english', this.containers.english);
    this.renderLanguage('hebrew', this.containers.hebrew);
    this.renderLanguage('russian', this.containers.russian);
  }

  private renderLanguage(language: keyof typeof this.currentOrder, container: HTMLElement): void {
    clearElement(container);
    
    this.currentOrder[language].forEach((letterData, displayIndex) => {
      const letterCard = this.createLetterCard(letterData, language, displayIndex);
      container.appendChild(letterCard);
    });
  }

  private createLetterCard(letterData: LetterData, language: string, displayIndex: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'letter-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-language', language);
    card.setAttribute('data-letter', letterData.letter);
    
    // Add staggered animation delay
    card.style.animationDelay = `${displayIndex * 0.05}s`;
    
    const letterMain = document.createElement('div');
    letterMain.className = 'letter-main';
    letterMain.textContent = letterData.letter;
    
    const letterPhonetic = document.createElement('div');
    letterPhonetic.className = `letter-phonetic ${this.showPhonetics ? 'show' : ''}`;
    letterPhonetic.textContent = letterData.phonetic || '';
    
    card.appendChild(letterMain);
    card.appendChild(letterPhonetic);
    
    // Add event listeners
    addEventListener(card, 'click', () => this.handleLetterClick(card, letterData));
    addEventListener(card, 'keydown', (event) => this.handleLetterKeydown(event, card, letterData));
    
    // Add accessibility attributes
    card.setAttribute('aria-label', 
      `Letter ${letterData.letter}${letterData.phonetic ? `, pronounced ${letterData.phonetic}` : ''}`);
    
    return card;
  }

  private handleLetterClick(card: HTMLElement, letterData: LetterData): void {
    // Add click animation
    addClass(card, 'clicked');
    setTimeout(() => removeClass(card, 'clicked'), 300);
    
    // Log interaction for future sound integration
    console.log(`🔤 Letter clicked: ${letterData.letter} (${letterData.phonetic || 'no phonetic'})`);
    
    // Future: Play pronunciation sound
    // this.playLetterSound(letterData);
    
    // Add simple feedback
    this.showLetterFeedback(letterData);
  }

  private handleLetterKeydown(event: KeyboardEvent, card: HTMLElement, letterData: LetterData): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleLetterClick(card, letterData);
    }
  }

  private showLetterFeedback(letterData: LetterData): void {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = letterData.phonetic || letterData.letter;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-accent);
      color: var(--color-text);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      font-weight: 600;
      z-index: 1000;
      animation: feedback-appear 2s ease-out forwards;
    `;
    
    // Add feedback animation styles if not present
    if (!document.getElementById('feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'feedback-styles';
      style.textContent = `
        @keyframes feedback-appear {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          20%, 80% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  private shuffleLetters(): void {
    this.currentOrder = {
      english: shuffleArray([...this.currentOrder.english]),
      hebrew: shuffleArray([...this.currentOrder.hebrew]),
      russian: shuffleArray([...this.currentOrder.russian])
    };
    
    this.renderAllLanguages();
    console.log('🔀 Letters shuffled');
  }

  private resetOrder(): void {
    this.currentOrder = {
      english: [...this.originalOrder.english],
      hebrew: [...this.originalOrder.hebrew],
      russian: [...this.originalOrder.russian]
    };
    
    this.renderAllLanguages();
    console.log('🔄 Order reset to original');
  }

  private togglePhonetics(): void {
    this.showPhonetics = this.phoneticCheckbox.checked;
    
    const phoneticElements = selectAllElements('.letter-phonetic');
    phoneticElements.forEach(element => {
      if (this.showPhonetics) {
        addClass(element, 'show');
      } else {
        removeClass(element, 'show');
      }
    });
    
    // Save preference
    localStorage.setItem('languageCardsShowPhonetics', this.showPhonetics.toString());
    
    console.log(`📝 Phonetics ${this.showPhonetics ? 'shown' : 'hidden'}`);
  }

  private loadPreferences(): void {
    // Load phonetic preference
    const savedPhonetics = localStorage.getItem('languageCardsShowPhonetics');
    if (savedPhonetics !== null) {
      this.showPhonetics = savedPhonetics === 'true';
      this.phoneticCheckbox.checked = this.showPhonetics;
    }
  }

  // Future enhancement: Letter statistics
  private getLanguageStats(): Record<string, any> {
    return {
      english: {
        total: this.originalOrder.english.length,
        vowels: this.originalOrder.english.filter(l => 'AEIOU'.includes(l.letter)).length,
        consonants: this.originalOrder.english.filter(l => !'AEIOU'.includes(l.letter)).length
      },
      hebrew: {
        total: this.originalOrder.hebrew.length,
        // Hebrew doesn't traditionally mark vowels in the alphabet
      },
      russian: {
        total: this.originalOrder.russian.length,
        vowels: this.originalOrder.russian.filter(l => 'АЕЁИОУЫЭЮЯ'.includes(l.letter)).length,
        consonants: this.originalOrder.russian.filter(l => !'АЕЁИОУЫЭЮЯ'.includes(l.letter) && !'ЪЬ'.includes(l.letter)).length,
        signs: this.originalOrder.russian.filter(l => 'ЪЬ'.includes(l.letter)).length
      }
    };
  }

  // Public method to get stats (for debugging or future features)
  public getStats(): void {
    console.table(this.getLanguageStats());
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new LanguageCardsGame();
    
    // Load saved preferences
    game['loadPreferences']();
    
    // Expose game instance to global scope for debugging
    (window as any).languageCardsGame = game;
  } catch (error) {
    console.error('❌ Error initializing Language Cards game:', error);
  }
});

export default LanguageCardsGame; 