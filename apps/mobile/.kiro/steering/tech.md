# Technology Stack

## Framework & Platform
- **React Native**: Cross-platform mobile development
- **Expo SDK 54**: Development platform and toolchain
- **TypeScript**: Type-safe JavaScript with strict mode enabled
- **Expo Router**: File-based routing system with typed routes

## Backend & Database
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Supabase Auth**: Authentication and user management
- **Bunny.net**: Video hosting, streaming, and CDN services

## State Management & Storage
- **React Context**: Global state management (Auth, Theme, I18n)
- **AsyncStorage**: Local data persistence
- **Supabase Client**: Real-time data synchronization

## Key Libraries
- **@react-navigation/native**: Navigation framework
- **expo-av**: Video playback functionality
- **i18n-js**: Internationalization (French/English)
- **expo-document-picker**: File selection for video uploads
- **react-native-reanimated**: Smooth animations

## Development Tools
- **ESLint**: Code linting with Expo configuration
- **TypeScript**: Strict type checking enabled
- **Expo CLI**: Development and build tooling

## Common Commands

### Development
```bash
# Start development server
npm start
# or
npx expo start

# Platform-specific development
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

### Code Quality
```bash
# Run linting
npm run lint

# Type checking (automatic with TypeScript)
npx tsc --noEmit
```

### Project Management
```bash
# Install dependencies
npm install

# Reset to clean project state
npm run reset-project
```

## Build Configuration
- **app.json**: Expo configuration with typed routes enabled
- **tsconfig.json**: Extends Expo base with strict mode and path aliases (@/*)
- **Path Aliases**: Use `@/` for root-level imports (e.g., `@/components/Button`)

## Environment Variables
Store sensitive configuration in `.env` file:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Bunny.net API credentials (server-side only)
