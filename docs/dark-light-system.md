# Dark/Light Theme System

The theme system allows users to switch between light and dark modes, with support for system preference detection.

## Overview

The system is built around the `useTheme()` composable located in `src/composables/useTheme.ts`. It provides a reactive theme state with persistent storage.

## Available Themes

- `light` — Forces light mode
- `dark` — Forces dark mode
- `auto` — Follows system preference (prefers-color-scheme)

## Usage in Components

```vue
<script setup lang="ts">
const { theme, setTheme, isDark, isLight, isAuto } = useTheme()
</script>

<template>
  <!-- Toggle button example -->
  <button @click="setTheme(theme === 'dark' ? 'light' : 'dark')">
    Toggle Theme
  </button>

  <!-- Conditional rendering based on theme -->
  <div v-if="isDark">Dark mode active</div>
  <div v-else-if="isLight">Light mode active</div>
  <div v-else-if="isAuto">Auto mode (following system)</div>
</template>
```

## Composable API

| Property/Method | Type | Description |
|----------------|------|-------------|
| `theme` | `Ref<Theme>` | Current stored theme value (`'light'` \| `'dark'` \| `'auto'`) |
| `effectiveTheme` | `ComputedRef<'light'\|'dark'>` | The actual theme applied (resolves `'auto'` to system preference) |
| `isDark` | `ComputedRef<boolean>` | Whether the effective theme is dark |
| `isLight` | `ComputedRef<boolean>` | Whether the effective theme is light |
| `isAuto` | `ComputedRef<boolean>` | Whether theme is set to auto |
| `setTheme(theme)` | `(theme: Theme) => void` | Set the theme |
| `toggleTheme()` | `() => void` | Toggle between light and dark |

## How It Works

1. **Storage**: Theme preference is stored in `localStorage` under key `coreui-docs-theme`
2. **DOM Application**: Theme is applied to `document.documentElement` via `data-coreui-theme` attribute
3. **System Detection**: Uses `window.matchMedia('(prefers-color-scheme: dark)')` for auto mode
4. **Event System**: Dispatches `coreui-theme-change` custom event when theme changes

## Initialization

The theme is automatically initialized when `useTheme()` is first called in a component. The system:

1. Checks localStorage for stored preference
2. Falls back to system preference if no stored value
3. Applies the theme to the DOM
4. Sets up listener for system preference changes (when in auto mode)

## Manual Initialization

For non-component contexts, you can manually initialize:

```ts
import { initTheme } from '@/composables/useTheme'

initTheme()
```

## Theme Change Event

Listen to theme changes across components:

```ts
document.addEventListener('coreui-theme-change', (event) => {
  const { theme, effectiveTheme } = event.detail
  console.log(`Theme changed to ${theme} (effective: ${effectiveTheme})`)
})
```

## CSS Integration

CoreUI uses the `data-coreui-theme` attribute for styling. Styles can be defined per theme:

```css
[data-coreui-theme="light"] {
  --cui-body-bg: #ffffff;
  --cui-body-color: #000000;
}

[data-coreui-theme="dark"] {
  --cui-body-bg: #1a1a1a;
  --cui-body-color: #ffffff;
}
```
