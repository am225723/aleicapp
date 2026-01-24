# Unused Files Documentation

This document lists files that were identified as not being imported or used anywhere in the active codebase. These files have been moved to the `_unused/` folder for reference.

## Analysis Date
January 21, 2026

## Unused Files List

### Components (client/components/)
| Original Location | Description |
|-------------------|-------------|
| `client/components/GlassWidget.tsx` | Glass widget component (replaced by GlowWidget) |
| `client/components/HeaderTitle.tsx` | Custom header title component |
| `client/components/Spacer.tsx` | Spacing utility component |

### Hooks (client/hooks/)
| Original Location | Description |
|-------------------|-------------|
| `client/hooks/useApi.ts` | API hook (replaced by React Query) |
| `client/hooks/useColorScheme.web.ts` | Web-specific color scheme hook |

### Screens (client/screens/)
| Original Location | Description |
|-------------------|-------------|
| `client/screens/couple/ActivitiesScreen.tsx` | Activities screen (replaced by category screens) |
| `client/screens/couple/ConnectScreen.tsx` | Connect screen (replaced by ConnectToolsScreen) |

### Server Files (server/)
| Original Location | Description |
|-------------------|-------------|
| `server/storage.ts` | Memory storage implementation (unused) |

### Image Assets (Duplicates in client/assets/)
| Original Location | Description |
|-------------------|-------------|
| `client/assets/images/icon.png` | Duplicate app icon (main one is in assets/images/) |
| `client/assets/images/favicon.png` | Duplicate favicon (main one is in assets/images/) |
| `client/assets/images/splash-icon.png` | Duplicate splash icon (main one is in assets/images/) |
| `client/assets/images/android-icon-foreground.png` | Duplicate Android icon (main one is in assets/images/) |

### Root Assets (assets/images/)
| Original Location | Description |
|-------------------|-------------|
| `assets/images/android-icon-background.png` | Android icon background (adaptive icons not fully configured) |

## Notes
- Files in the `reference/` folder were intentionally excluded from this analysis
- These files can be safely deleted or kept for reference in the `_unused/` folder
- Before permanent deletion, verify that no dynamic imports or runtime references exist
