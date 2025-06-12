# ABC Games - Project Plan

## 📋 Project Overview
Static HTML/TypeScript game website with 3 simple games, built with Vite bundler and plain CSS styling.

## 🏗️ Project Structure
```
abc-game/
├── src/
│   ├── pages/
│   │   ├── home/
│   │   │   ├── index.html
│   │   │   ├── home.ts
│   │   │   └── home.css
│   │   ├── tic-tac-toe/
│   │   │   ├── index.html
│   │   │   ├── tic-tac-toe.ts
│   │   │   └── tic-tac-toe.css
│   │   ├── five-in-row/
│   │   │   ├── index.html
│   │   │   ├── five-in-row.ts
│   │   │   └── five-in-row.css
│   │   └── language-cards/
│   │       ├── index.html
│   │       ├── language-cards.ts
│   │       └── language-cards.css
│   ├── shared/
│   │   ├── styles/
│   │   │   ├── theme.css (color palette & common styles)
│   │   │   └── reset.css
│   │   ├── utils/
│   │   │   ├── dom-helpers.ts
│   │   │   └── game-utils.ts
│   │   └── components/
│   │       ├── game-card.ts (web component)
│   │       └── navigation.ts
│   └── assets/
│       └── icons/ (if needed)
├── dist/ (build output)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Design System - Pastel Theme
- **Primary**: `#FFB3E6` (soft pink)
- **Secondary**: `#B3E5FC` (light blue) 
- **Accent**: `#C8E6C9` (mint green)
- **Warning**: `#FFCCBC` (peach)
- **Background**: `#FAFAFA` (off-white)
- **Text**: `#424242` (dark gray)
- **Cards**: `#FFFFFF` with soft shadows

## 🛠️ Technology Stack
- **Bundler**: Vite
- **Language**: TypeScript
- **Styling**: Plain CSS with CSS custom properties
- **Build**: npm scripts
- **Components**: Native Web Components (when needed)

## 📱 Pages & Features

### 1. Home Page (`/`)
- **Features**: 3 game cards in a responsive grid
- **Navigation**: Simple header with title
- **Cards**: Each card shows game preview, title, description
- **Interactions**: Hover effects, smooth transitions

### 2. Tic Tac Toe (`/tic-tac-toe/`)
- **Features**: 3x3 grid, turn indicator, win detection, reset
- **Logic**: Player vs Player mode
- **UI**: Clean grid with X/O animations
- **State**: Game state management in TypeScript

### 3. Five in Row (`/five-in-row/`)
- **Features**: 15x15 grid, win detection (5 consecutive)
- **Logic**: Player vs Player mode
- **UI**: Smaller cells, scroll if needed on mobile
- **State**: Efficient win checking algorithm

### 4. Language Cards (`/language-cards/`)
- **Features**: 3 columns displaying letters/alphabets
  - **Column 1**: English letters (A-Z)
  - **Column 2**: Hebrew letters (א-ת) 
  - **Column 3**: Russian letters (А-Я)
- **Current**: Simple display of alphabets in organized columns
- **Future-ready**: Structure prepared for matching sounds game
- **UI**: Clean card layout for each letter, responsive columns
- **Data**: Simple arrays of letters for each language
- **Technical**: Proper Unicode handling for Hebrew (RTL) and Cyrillic

## 🔧 Technical Implementation

### Build System
- **Dev**: `npm run dev` (Vite dev server)
- **Build**: `npm run build` (TypeScript compilation + bundling)
- **Preview**: `npm run preview` (serve built files)

### File Size Management
- Keep each file under 300 lines
- Split large files into modules
- Use dynamic imports if needed

### Web Components Strategy
- `GameCard` component for reusable game cards
- `GameBoard` component for shared board logic (if applicable)
- Keep components simple and focused

## 🎯 Development Phases

**Phase 1**: Project setup & build system
- Initialize npm project
- Configure Vite + TypeScript
- Set up folder structure
- Create theme CSS

**Phase 2**: Home page
- Create main layout
- Implement game cards
- Add navigation
- Apply theme styling

**Phase 3**: Individual games
- Tic Tac Toe (simplest)
- Language Cards (data-driven)
- Five in Row (most complex)

**Phase 4**: Polish & optimization
- Responsive design
- Performance optimization
- Cross-browser testing

## 📋 Progress Tracking
- [x] Project scaffolding ✅
- [x] Build system setup ✅
- [x] Theme & design system ✅
- [x] Home page layout ✅
- [x] Game card component ✅
- [x] Tic Tac Toe game ✅
- [x] Language Cards page ✅
- [x] Five in Row game ✅
- [x] Responsive design ✅
- [x] Final polish ✅

## 🎉 Project Completed!

All games are fully implemented with:
- **Home Page**: Beautiful landing page with game cards
- **Tic Tac Toe**: Classic 3x3 game with score tracking
- **Language Cards**: English, Hebrew, and Russian alphabets with phonetics
- **Five in Row**: Advanced 15x15 game with undo and coordinates
- **Shared Systems**: Reusable utilities, theme, and components
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Full keyboard navigation and screen reader support

## 📝 Implementation Notes
- Each page has its own CSS file for maintainability
- Shared utilities in common folder
- Pastel color theme throughout
- Mobile-responsive design
- Clean, simple code structure 