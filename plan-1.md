# Implementation Plan: Rich Text Editor & Media Package Migration

## Overview
This plan addresses two main issues:
1. Replace the current non-functional text editor with `react-native-enriched` for native rich text editing
2. Migrate from deprecated `expo-av` to `expo-video` and `expo-audio` packages (SDK 54 compliant)

---

## Issue 1: Rich Text Editor Migration

### Current State
- `app/entry/new.tsx` and `app/entry/[id].tsx` use basic `TextInput` components
- No actual rich text formatting functionality (Bold, Italic, List buttons are non-functional)
- Toolbar exists but doesn't apply any formatting

### Target State
- Use `react-native-enriched` package's `EnrichedTextInput` component
- Functional formatting toolbar (Bold, Italic, Lists, etc.)
- Toolbar appears with keyboard when editing content (not title)
- Store rich text content as HTML in database

### Implementation Steps

#### Step 1.1: Database Schema Update
Update `db/schema.ts` to store HTML content:
```typescript
// Add contentHtml field to journalEntries table
contentHtml: text('content_html'), // Stores HTML formatted content
```

Update `db/client.ts` to add the new column migration.

#### Step 1.2: Create Shared Rich Text Editor Component
Create `components/RichTextEditor.tsx`:
- Wrap `EnrichedTextInput` from `react-native-enriched`
- Implement formatting state tracking via `onChangeState`
- Expose ref methods for formatting toggles
- Handle `getHtml()` and `setHtml()` for content persistence

#### Step 1.3: Create Formatting Toolbar Component
Create `components/FormattingToolbar.tsx`:
- Display formatting buttons (Bold, Italic, Underline, Strikethrough, Lists)
- Show active state based on `OnChangeStateEvent`
- Use `InputAccessoryView` (iOS) or `KeyboardAvoidingView` pattern for keyboard attachment
- Only show when content input is focused (not title)

#### Step 1.4: Update New Entry Screen (`app/entry/new.tsx`)
- Replace `TextInput` for content with `EnrichedTextInput`
- Integrate `FormattingToolbar` component
- Track focus state to show/hide toolbar
- Save HTML content via `ref.current?.getHtml()`
- Update `handleSave` to store `contentHtml`

#### Step 1.5: Update Edit Entry Screen (`app/entry/[id].tsx`)
- Replace `TextInput` for content with `EnrichedTextInput`
- Load existing HTML content via `ref.current?.setHtml()`
- Integrate `FormattingToolbar` component
- Update save logic to persist HTML content

#### Step 1.6: Update DatabaseContext
- Add `contentHtml` to entry creation/update methods
- Ensure backward compatibility with plain `content` field

---

## Issue 2: expo-av to expo-video/expo-audio Migration

### Current State
- `app/entry/[id].tsx` imports `Video, ResizeMode` from `expo-av`
- Used for video thumbnail preview and fullscreen playback
- `expo-av` is deprecated and removed in SDK 54

### Target State
- Use `expo-video` for video playback (`VideoView`, `useVideoPlayer`)
- Use `expo-audio` for any audio features (if needed)
- Maintain same UX for video preview and fullscreen playback

### Implementation Steps

#### Step 2.1: Update Imports in `app/entry/[id].tsx`
Replace:
```typescript
import { Video, ResizeMode } from 'expo-av';
```
With:
```typescript
import { VideoView, useVideoPlayer } from 'expo-video';
```

#### Step 2.2: Update Video Thumbnail Component
Replace `<Video>` component with `<VideoView>`:
- Create video player instance with `useVideoPlayer(source)`
- Configure player: `player.loop = false`, `player.muted = true`
- Use `<VideoView player={player} nativeControls={false} />`

#### Step 2.3: Update Fullscreen Video Modal
- Create separate player for fullscreen playback
- Use `<VideoView player={fullscreenPlayer} nativeControls allowsFullscreen />`
- Handle play/pause via `player.play()` / `player.pause()`

#### Step 2.4: Remove expo-av Dependency
After migration, remove `expo-av` from `package.json`:
```bash
pnpm remove expo-av
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `db/schema.ts` | Modify | Add `contentHtml` column |
| `db/client.ts` | Modify | Add migration for new column |
| `context/DatabaseContext.tsx` | Modify | Support `contentHtml` in CRUD |
| `components/RichTextEditor.tsx` | Create | Wrapper for EnrichedTextInput |
| `components/FormattingToolbar.tsx` | Create | Keyboard-attached formatting toolbar |
| `app/entry/new.tsx` | Modify | Integrate rich text editor |
| `app/entry/[id].tsx` | Modify | Integrate rich text editor + migrate expo-video |
| `package.json` | Modify | Remove expo-av |

---

## Dependencies Status

### Already Installed (No Action Needed)
- `react-native-enriched`: ^0.2.1 ✅
- `expo-video`: ^3.0.15 ✅
- `expo-audio`: ^1.1.1 ✅

### To Remove
- `expo-av`: ~16.0.8 ❌ (deprecated)

---

## Testing Checklist

### Rich Text Editor
- [ ] Bold formatting toggles correctly
- [ ] Italic formatting toggles correctly
- [ ] Underline formatting works
- [ ] Strikethrough formatting works
- [ ] Bullet list creation works
- [ ] Numbered list creation works
- [ ] Toolbar appears only when content input focused
- [ ] Toolbar hides when title input focused
- [ ] HTML content saves to database correctly
- [ ] HTML content loads from database correctly
- [ ] New entries save with formatted content
- [ ] Existing entries preserve formatting on edit

### Video Migration
- [ ] Video thumbnails display correctly
- [ ] Play icon overlay shows on video thumbnails
- [ ] Fullscreen video modal opens
- [ ] Video plays in fullscreen mode
- [ ] Native controls work in fullscreen
- [ ] Modal closes correctly
- [ ] No expo-av imports remain

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `react-native-enriched` API changes | Pin to specific version, test thoroughly |
| HTML content size increase | Monitor storage, consider compression if needed |
| Keyboard toolbar positioning | Test on both iOS and Android |
| Video player memory leaks | Ensure proper cleanup with `player.release()` |

---

## Estimated Effort
- Rich Text Editor Migration: ~3-4 hours
- Video Package Migration: ~1-2 hours
- Testing & Bug Fixes: ~1-2 hours
- **Total: ~5-8 hours**

---

## Approval Required
~~Please review this plan and confirm to proceed with implementation.~~

## ✅ Implementation Complete

All changes have been implemented successfully:

1. **Rich Text Editor**: Integrated `react-native-enriched` with `EnrichedTextInput` component
2. **Formatting Toolbar**: Created keyboard-attached toolbar with Bold, Italic, Underline, Strikethrough, Bullet List, Ordered List
3. **Database Schema**: Added `contentHtml` column for storing formatted content
4. **expo-av Migration**: Replaced all `expo-av` imports with `expo-video` in entry screens and gallery
5. **Removed expo-av**: Package removed from dependencies
