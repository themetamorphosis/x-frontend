# EAS Build Documentation

## Build Profiles

| Profile | Purpose | Distribution |
|---------|---------|-------------|
| `development` | Dev client with hot reload | Internal |
| `preview` | Testing builds | Internal (TestFlight / Internal Testing) |
| `production` | App Store / Play Store | Store |

## Environment Variables

Set these in EAS Secrets (not in code):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://api.nutrilog.app"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "..."
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "..."
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "..."
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "..."
```

## Building

```bash
# Development build (iOS)
eas build --platform ios --profile development

# Development build (Android)
eas build --platform android --profile development

# Preview build for testing
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production
```

## Submitting

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## Over-the-Air Updates

```bash
# Push OTA update (no rebuild needed)
eas update --branch production --message "Bug fix for dashboard"
```

## Build Configuration

See [`eas.json`](../eas.json) for build profiles and [`app.json`](../app.json) for app configuration.
