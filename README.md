# Veterinary Signup Application

A modern, client-side rendered Nuxt 3 application for veterinary product signups, built with the NordHealth Design System VET theme.

## Features

- ✅ Client-side only rendering (SPA mode)
- ✅ TypeScript throughout the application
- ✅ NordHealth Design System VET theme integration
- ✅ Comprehensive form validation with configurable password complexity
- ✅ Password visibility toggle
- ✅ User profile page with avatar navigation
- ✅ Route guards for protected pages
- ✅ Unit tests with Vitest
- ✅ End-to-end testing with Playwright
- ✅ Responsive design with header/footer layout
- ✅ Accessible components
- ✅ Session-based authentication simulation
- ✅ LocalStorage persistence for user preferences

## Tech Stack

- **Framework**: Nuxt 3 (SPA mode)
- **Language**: TypeScript
- **UI Components**: NordHealth Design System
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Styling**: CSS with NordHealth theme variables

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd veterinary-signup-app

2. **Install dependencies**

```bash
npm install
```

3. **Start development server**

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Configuration

Password validation rules are configurable in `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    passwordConfig: {
      minLength: 12,              // Minimum password length
      requireUppercase: true,     // Require uppercase letters
      requireLowercase: true,     // Require lowercase letters
      requireNumbers: true,       // Require numbers
      requireSpecialChars: true,  // Require special characters
      minSpecialChars: 2         // Minimum special characters required
    }
  }
}
```

## Available Scripts

- npm run dev - Start development server
- npm run build - Build for production
- npm run generate - Generate static files
- npm run preview - Preview production build
- npm run test - Run unit tests
- npm run test:e2e - Run end-to-end tests
- npm run test:e2e:ui - Run e2e tests with UI

## Project structure

```bash
├── composables/           # Vue composables
│   ├── usePasswordValidation.ts
│   └── useFormValidation.ts
├── layouts/              # Nuxt layouts
│   └── default.vue      # Main layout with header/footer
├── middleware/           # Route middleware
│   ├── auth.ts          # Profile authentication guard
│   └── signup.ts        # Success page guard
├── pages/               # Application pages
│   ├── index.vue       # Signup form
│   ├── profile.vue     # User profile page
│   └── success.vue     # Success page
├── plugins/             # Nuxt plugins
│   └── nordhealth.client.ts
├── tests/               # Test files
│   ├── components/      # Unit tests
│   └── e2e/            # End-to-end tests
├── types/               # TypeScript type definitions
│   └── index.ts
├── nuxt.config.ts      # Nuxt configuration
├── package.json        # Dependencies and scripts
├── playwright.config.ts # Playwright configuration
└── vitest.config.ts    # Vitest configuration
```

## Application Flow

1. Landing Page (/): Users see the signup form with:

    - Email field (required, validated)
    - Password field (required, complex validation, toggle visibility)
    - Optional updates checkbox
    - Real-time password strength indicator

2. Form Validation:

    - Client-side validation with immediate feedback
    - Configurable password complexity requirements
    - Error messages using NordHealth components

3. Success Page (/success):

    - Protected by route guard
    - Shows confirmation details
    - Options to continue or sign up again

## Testing

**Unit Tests
Run with `npm run test`. Tests cover:

- Password validation logic
- Form validation composables
- Component behavior

**End-to-End Tests
Run with `npm run test:e2e`. Tests include:

- Complete signup flow
- Form validation scenarios
- Password visibility toggle
- Route protection

**Design System Integration
The application uses the NordHealth Design System VET theme:

- Components are loaded via the client plugin
- Theme CSS is imported globally
- All UI follows veterinary design patterns
- Responsive and accessible by default

**Security Considerations

- Client-side only (no server-side data storage)
- Strong password requirements
- Form validation prevents XSS
- Route guards protect sensitive pages
- Session storage for temporary data

**Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Contributing

1. Follow TypeScript strict mode
2. Write tests for new features
3. Use NordHealth components exclusively
4. Maintain accessibility standards
5. Update documentation for changes

License
created by Oliver Schafeld <info@schafeld.com> 2025,
CC, attribution required.
