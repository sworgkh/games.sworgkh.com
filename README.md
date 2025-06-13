# ABC Games

A collection of simple browser games built with HTML, CSS, and TypeScript.

## Project Structure

This project is structured as a static website with the following organization:

```
abc-game/
├── dist/              # Build output (generated)
│   ├── index.html     # Home page (at root level)
│   ├── tic-tac-toe.html
│   ├── five-in-row.html
│   ├── connect-four.html
│   ├── language-cards.html
│   └── assets/        # All assets organized by type
│       ├── css/       # CSS files
│       ├── js/        # JavaScript files
│       └── images/    # Image files
├── src/               # Source code
│   ├── pages/         # Game pages
│   ├── shared/        # Shared components and styles
│   └── assets/        # Source assets
└── ...                # Config files
```

## Development

To start the development server:

```bash
npm run dev
```

## Building for Production

To build the project for production:

```bash
npm run build
```

This will generate a `dist` directory with all files optimized and organized for deployment. The output structure is designed to be used directly as the root of a static website.

## Previewing the Production Build

To preview the production build locally:

```bash
npm run serve
```

## Deployment

The contents of the `dist` directory can be deployed directly to any static web hosting service:

1. Build the project: `npm run deploy`
2. Upload the contents of the `dist` directory to your web server

## Supported Browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest) 