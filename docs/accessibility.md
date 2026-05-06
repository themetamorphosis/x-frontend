# Accessibility Testing Checklist

## Automated Checks

- [ ] All interactive elements have `accessibilityRole`
- [ ] All interactive elements have `accessibilityLabel`
- [ ] Complex actions have `accessibilityHint`
- [ ] Error states use `accessibilityLiveRegion="assertive"`
- [ ] Status updates use `accessibilityLiveRegion="polite"`

## VoiceOver (iOS) Manual Testing

### Navigation
- [ ] Swipe right/left navigates through all elements in logical order
- [ ] Double-tap activates buttons and links
- [ ] Three-finger swipe scrolls content

### Dashboard Screen
- [ ] Macro rings announce "Calories: X of Y" format
- [ ] Water tracker announces current/target ml
- [ ] Food items announce name, calories, and macros
- [ ] Delete button announces food name in label

### Login Screen
- [ ] "Continue with Google" button is focusable and labeled
- [ ] Error toasts are announced automatically

### Food Logging
- [ ] Text input is focusable with keyboard
- [ ] AI parsing results are announced
- [ ] Confirm screen reads food items clearly

### Settings
- [ ] Toggle switches announce on/off state
- [ ] Time pickers are navigable

## TalkBack (Android) Manual Testing

- [ ] Same checks as VoiceOver above
- [ ] Explore by touch highlights elements correctly
- [ ] Back gesture works with screen reader active

## Color Contrast

- [ ] All text meets WCAG AA contrast ratio (4.5:1 for normal text)
- [ ] Interactive elements have visible focus indicators
- [ ] Error states don't rely solely on color (include icons/text)

## Touch Targets

- [ ] All interactive elements are at least 44x44 points
- [ ] Adequate spacing between adjacent touch targets
- [ ] `hitSlop` used for small interactive elements (e.g., delete button)

## Dynamic Type / Font Scaling

- [ ] App respects system font size settings
- [ ] Text doesn't truncate at large font sizes
- [ ] Layout adapts to larger text without breaking
