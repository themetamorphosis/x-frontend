# NutriLog Frontend

AI-powered nutrition tracking mobile app built with React Native, Expo, and Zustand.

## Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go on device)

### Setup

```bash
# Navigate to frontend
cd x-frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API URL and Google OAuth client IDs

# Start development server
npm start
```

### Running

```bash
# iOS simulator
npm run ios

# Android emulator
npm run android

# Web browser
npm run web
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | Backend API URL (e.g., `http://localhost:8000`) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Yes | Google OAuth web client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Yes | Google OAuth iOS client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Yes | Google OAuth Android client ID |
| `EXPO_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error tracking |

## Architecture

```
app/                    # Expo Router file-based routing
├── _layout.tsx         # Root layout (auth guard, providers)
├── (auth)/             # Authentication screens
│   └── login.tsx       # Google sign-in + dev login
├── (tabs)/             # Main tab navigation
│   ├── index.tsx       # Dashboard (daily summary)
│   ├── log.tsx         # Log entry point
│   ├── progress.tsx    # Weight/weekly trends
│   └── profile.tsx     # User profile
├── (log)/              # Food logging flows
│   ├── text.tsx        # AI text parsing
│   ├── photo.tsx       # AI photo parsing
│   ├── barcode.tsx     # Barcode scanner
│   ├── search.tsx      # Food database search
│   ├── confirm.tsx     # Confirm AI results
│   └── custom-foods.tsx # Custom food management
├── (onboarding)/       # First-time setup
│   ├── goal.tsx        # Goal selection
│   ├── stats.tsx       # Body stats
│   ├── activity.tsx    # Activity level
│   ├── pace.tsx        # Weight change pace
│   └── targets.tsx     # Review calculated targets
└── (settings)/         # Settings screens
    └── notifications.tsx # Notification preferences

stores/                 # Zustand state management
├── authStore.ts        # Authentication + JWT refresh
├── dailyStore.ts       # Daily dashboard data
├── foodLogStore.ts     # AI parsing results + editing
├── profileStore.ts     # User profile + onboarding
└── progressStore.ts    # Weight logs + weekly data

services/               # API communication
├── api.ts              # HTTP client with retry + auth
├── food.ts             # Food logging API calls
├── foodDb.ts           # Food database search
└── notifications.ts    # Push notification setup

hooks/                  # Custom React hooks
├── useAuthGuard.ts     # Auth/onboarding navigation guard
├── useNetworkStatus.ts # Online/offline detection
└── useSaveFoodLog.ts   # Shared food log save logic

components/             # Reusable UI components
├── ui/                 # Base UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Toast.tsx       # With optional retry button
│   ├── Skeleton.tsx    # Loading placeholders
│   ├── EmptyState.tsx
│   └── ScreenWrapper.tsx
├── log/                # Food logging components
│   ├── FoodItemCard.tsx
│   ├── MealTypeSelector.tsx
│   └── ...
├── ErrorBoundary.tsx   # Global error boundary
├── MacroRing.tsx       # Animated progress rings
├── WaterTracker.tsx    # Water intake tracker
├── WeightChart.tsx     # Weight trend chart
└── WeeklyTrend.tsx     # Weekly calorie trend

utils/                  # Utility functions
├── colors.ts           # Theme colors (dark/light)
├── haptics.ts          # Haptic feedback
├── imageCompression.ts # Photo compression
├── mealType.ts         # Auto-detect meal type
├── mutationQueue.ts    # Offline mutation queue
└── sentry.ts           # Sentry initialization

types/                  # TypeScript type definitions
└── food.ts             # Food-related types
```

## Key Patterns

### State Management (Zustand)

Each domain has its own store with typed state and actions:

```typescript
// Use selectors to avoid unnecessary re-renders
const summary = useDailyStore((s) => s.summary);
const loading = useDailyStore((s) => s.loading);
```

### Authentication Flow

1. User signs in via Google OAuth → backend issues JWT + refresh token
2. Tokens stored in `expo-secure-store`
3. JWT decoded client-side for proactive refresh (2 min before expiry)
4. 401 responses trigger automatic logout

### Offline Support

- `MutationQueue` persists failed mutations to AsyncStorage
- Auto-flushes when network reconnects
- Optimistic updates with rollback on failure

### Error Handling

- `ErrorBoundary` catches React rendering errors → Sentry
- `Toast` component with optional retry button
- All store errors reported to Sentry with context tags

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Building

```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

See [`eas.json`](eas.json) for build profiles.
