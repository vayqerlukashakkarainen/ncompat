# Agent Guidelines for npm node updater

## Project Overview
This is an empty Node.js project directory for npm node updating functionality.

## Build/Test/Lint Commands
```bash
# No package.json found - initialize with:
npm init -y

# Standard Node.js commands (once initialized):
npm test                    # Run all tests
npm run test -- --testNamePattern="specific test"  # Run single test
npm run build              # Build project
npm run lint               # Lint code
npm run dev                # Development server
```

## Code Style Guidelines
- Use ES6+ modern JavaScript syntax
- Prefer `const` over `let`, avoid `var`
- Use async/await over Promises where possible
- Import style: `import { specific } from 'module'` (ES modules) or `const { specific } = require('module')` (CommonJS)
- Use camelCase for variables and functions, PascalCase for classes
- Add JSDoc comments for public functions
- Handle errors with try/catch blocks, don't ignore errors
- Use meaningful variable names, avoid abbreviations
- Keep functions small and focused on single responsibility

## Notes
- Project directory is currently empty - needs initialization
- No existing code style rules or configuration files found