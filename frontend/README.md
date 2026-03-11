# GST Banking Credit Lifecycle — Frontend

Mobile-first React + TypeScript web application for the GST Banking Credit Lifecycle System. Provides borrowers with a complete interface to manage KYC onboarding, invoice submissions, loan offers, and EMI repayments.

## Tech Stack

- **React 19** — UI framework
- **TypeScript 5** — Type-safe JavaScript
- **Vite 7** — Fast build tool with HMR
- **Tailwind CSS 4** — Utility-first styling
- **React Router DOM 7** — Client-side routing
- **Axios** — HTTP client for API communication
- **Framer Motion** — Animations
- **Lucide React** — Icon library

## Quick Start

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`. Requires the backend API to be running at `http://localhost:8000`.

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/how-to-use` | Step-by-step tutorial |
| `/about` | About the project |
| `/login` | OTP-based authentication |
| `/onboarding` | KYC form (Aadhaar, PAN, GST) |
| `/app/dashboard` | Credit score overview and stats |
| `/app/invoices` | Invoice list and upload |
| `/app/loans` | Loan offers and sanction flow |
| `/app/repayments` | EMI schedule and payment |
| `/app/credit-score` | Detailed credit score breakdown |
| `/app/profile` | User profile |

## Project Structure

```
src/
├── pages/          # Route-level page components
│   ├── auth/       # Login, Profile
│   ├── onboarding/ # KYC onboarding
│   ├── home/       # Dashboard
│   ├── action/     # Invoices, Repayments
│   └── credit/     # Loans, Credit Score
├── services/       # Axios-based API client services
├── layouts/        # MobileLayout (bottom nav + responsive grid)
├── components/     # Reusable UI components
├── context/        # Global app state (AppContext)
├── App.tsx         # Route configuration
└── main.tsx        # React entry point
```

## Deployment

The frontend is configured for deployment on Vercel (`vercel.json`). All routes redirect to `index.html` for client-side routing support.

## ESLint Configuration

For production applications, you can expand the ESLint config to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
