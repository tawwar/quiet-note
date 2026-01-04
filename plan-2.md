# Plan-2: Implement Android Data Export

This plan outlines the steps to implement a functional "Export Journal" feature for Android devices in the Quiet Note app. The feature will allow users to save their journal data (settings, entries, and albums) as a JSON file to a location of their choice on their device.

## Proposed Changes

### [Settings Component]

#### [MODIFY] [settings.tsx](file:///c:/repo/mobile/quiet-note/app/(tabs)/settings.tsx)
- Import `FileSystem` from `expo-file-system`.
- Update `handleExportData` to include Android-specific logic:
    - Use `FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()` to let the user select a directory.
    - generate a filename like `quiet-note-export-YYYY-MM-DD.json`.
    - Create the file in the selected directory using `createFileAsync`.
    - Write the serialized JSON data to the new file.
    - Show success or error alerts based on the outcome.

## Technical Details

### Android Storage Access Framework (SAF)
On Android, we will use the `StorageAccessFramework` provided by `expo-file-system`. This allows the app to request access to a user-selected directory and perform file operations within it without requiring broad storage permissions.

```typescript
// Example of the logic to be implemented
const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
if (permissions.granted) {
  const uri = await FileSystem.StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    filename,
    'application/json'
  );
  await FileSystem.writeAsStringAsync(uri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
}
```

## Verification Plan

### Manual Verification (Android)
1. Navigate to **Settings** tab.
2. Tap on **Export Journal**.
3. **Expectation**: A system file/folder picker should appear.
4. Select a folder (e.g., Downloads) and tap "Allow access" or "Select".
5. **Expectation**: An alert should appear confirming "Export Complete".
6. Navigate to the selected folder using a File Manager app.
7. **Expectation**: A file named `quiet-note-export-YYYY-MM-DD.json` should exist.
8. Open the file and verify it contains the correct JSON structure with `userSettings`, `entries`, and `albums`.

### Manual Verification (Web)
1. Ensure existing web export functionality still works as expected.
