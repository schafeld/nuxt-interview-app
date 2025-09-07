# Claude.md - Project Specifications and Implementation Guide

**Location**: `/Claude.md` (root directory)

## Project Overview

This is a client-side rendered Nuxt 3 application for veterinary product signups, implemented with the NordHealth Design System VET theme. The application demonstrates modern web development practices with comprehensive testing and validation.

## Architecture Decisions

### 1. Framework Choice: Nuxt 3 (SPA Mode)
- **Rationale**: Client-side only requirement mandates SPA mode
- **Configuration**: `ssr: false` in nuxt.config.ts
- **Benefits**: Fast navigation, reduced server load, better UX for form interactions

### 2. Design System Integration: NordHealth VET Theme
- **Implementation**: Web Components via `@nordhealth/components`
- **Loading Strategy**: Client-side plugin to avoid SSR issues
- **Theming**: VET theme CSS imported globally
- **Component Usage**: All UI elements use Nord components for consistency

### 3. TypeScript Implementation
- **Strict Mode**: Enabled for better code quality
- **Type Definitions**: Custom types in `/types/index.ts`
- **Composables**: Fully typed with proper return types
- **Components**: Use `<script setup lang="ts">` syntax

### 4. Validation Architecture
- **Composable Pattern**: Validation logic separated into reusable composables
- **Configuration-Driven**: Password rules defined in runtime config
- **Real-time Feedback**: Immediate validation on input changes
- **Accessibility**: Error messages properly associated with form fields

### 5. Testing Strategy
- **Unit Tests**: Vitest for composables and utility functions
- **E2E Tests**: Playwright for complete user flows
- **Test Coverage**: Key functionalities and user interactions
- **CI-Ready**: Configured for continuous integration

### 6. State Management
- **Reactive Composition**: Vue 3 reactive() for form state
- **Session Storage**: Temporary data persistence for route protection
- **No Global Store**: Simple application doesn't require Pinia/Vuex

### 7. Route Protection
- **Middleware Pattern**: Custom middleware for success page protection
- **Session-Based**: Uses sessionStorage to track signup completion
- **User-Friendly**: Redirects to signup if accessing success directly

## Code Quality Standards

### 1. File Organization
- **Feature-Based**: Related functionality grouped together
- **Composables**: Reusable logic extracted to composables/
- **Types**: Centralized in types/index.ts
- **Tests**: Mirror source structure in tests/

### 2. Component Design
- **Single Responsibility**: Each component has one clear purpose
- **Prop Validation**: TypeScript interfaces for prop types
- **Event Handling**: Proper event typing and emission
- **Accessibility**: ARIA labels and semantic HTML

### 3. Error Handling
- **Graceful Degradation**: Fallbacks for failed operations
- **User Feedback**: Clear error messages using design system
- **Validation**: Both client-side and format validation
- **Recovery**: Clear paths to resolve errors

### 4. Performance Considerations
- **Code Splitting**: Automatic with Nuxt 3
- **Lazy Loading**: Components loaded on demand
- **Bundle Size**: Nord components loaded efficiently
- **Caching**: Browser caching for static assets

## Security Implementation

### 1. Input Validation
- **Client-Side**: Immediate feedback and UX improvement
- **Format Validation**: Email regex and password complexity
- **Sanitization**: TypeScript prevents most injection attacks
- **Rate Limiting**: Would be implemented server-side in production

### 2. Password Security
- **Complexity Requirements**: Configurable strength rules
- **Visibility Toggle**: Secure implementation without logging
- **No Storage**: Passwords not persisted client-side
- **Hashing**: Would be implemented server-side in production

### 3. Data Protection
- **Session Storage**: Temporary, tab-specific storage
- **No Persistence**: No sensitive data in localStorage
- **HTTPS**: Required in production
- **CSP**: Content Security Policy headers recommended

## Testing Philosophy

### 1. Unit Testing Approach
- **Pure Functions**: Test composables in isolation
- **Mock Dependencies**: Isolate units under test
- **Edge Cases**: Test boundary conditions and errors
- **Fast Execution**: Quick feedback loop for development

### 2. E2E Testing Strategy
- **User Journeys**: Test complete workflows
- **Browser Testing**: Multiple browser support
- **Responsive Testing**: Different viewport sizes
- **Accessibility Testing**: Keyboard navigation and screen readers

### 3. Test Data Management
- **Deterministic**: Consistent test data across runs
- **Isolated**: Tests don't affect each other
- **Realistic**: Test data matches production scenarios
- **Cleanup**: Proper test cleanup and teardown

## Deployment Considerations

### 1. Build Configuration
- **Static Generation**: `npm run generate` for static hosting
- **Environment Variables**: Runtime config for different environments
- **Asset Optimization**: Automatic with Nuxt 3
- **Bundle Analysis**: Available for optimization

### 2. Hosting Requirements
- **Static Hosting**: Can be deployed to any static host
- **SPA Routing**: Server must handle client-side routing
- **HTTPS**: Required for production
- **CDN**: Recommended for global performance

### 3. Monitoring and Analytics
- **Error Tracking**: Sentry or similar service recommended
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Privacy-compliant tracking
- **Form Analytics**: Conversion tracking and optimization

## Future Enhancements

### 1. Backend Integration
- **API Integration**: RESTful or GraphQL API
- **Authentication**: JWT or session-based auth
- **Data Persistence**: Database storage
- **Email Verification**: Account activation flow

### 2. Advanced Features
- **Multi-step Forms**: Wizard-style signup
- **Social Authentication**: OAuth integration
- **Internationalization**: Multi-language support
- **Progressive Web App**: Offline functionality

### 3. Performance Optimizations
- **Image Optimization**: WebP/AVIF formats
- **Lazy Loading**: Below-fold content
- **Service Workers**: Caching strategies
- **Bundle Splitting**: Advanced code splitting

## Maintenance Guidelines

### 1. Dependency Updates
- **Regular Updates**: Monthly dependency reviews
- **Security Patches**: Immediate security updates
- **Breaking Changes**: Careful review of major updates
- **Testing**: Full test suite before updates

### 2. Code Reviews
- **Standards Compliance**: TypeScript and style guidelines
- **Testing Requirements**: Tests for new features
- **Performance Impact**: Bundle size and runtime performance
- **Accessibility**: WCAG compliance verification

### 3. Documentation
- **README Updates**: Keep installation and usage current
- **API Documentation**: Document composables and utilities
- **Architecture Decisions**: Record significant changes
- **Troubleshooting**: Common issues and solutions