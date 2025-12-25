# QuietNote 🕯️ — Private, local-first journal

> A calm, privacy-first journaling app that keeps everything on the device.  
> No accounts. No cloud. No analytics. Just your thoughts — private and secure. 🔒

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license) [![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-4caf50.svg)](https://docs.expo.dev/) <!-- adjust badges as needed -->

---

## Table of contents
- [QuietNote 🕯️ — Private, local-first journal](#quietnote-️--private-local-first-journal)
  - [Table of contents](#table-of-contents)
  - [About](#about)
  - [Why QuietNote?](#why-quietnote)
  - [Features ✨](#features-)
  - [Getting started 🚀](#getting-started-)
    - [Prerequisites](#prerequisites)
    - [Install (pnpm)](#install-pnpm)
    - [Run (development)](#run-development)
    - [Build (optional)](#build-optional)
  - [Configuration \& privacy notes 🔏](#configuration--privacy-notes-)
  - [Contributing 🤝](#contributing-)
  - [Security \& responsible disclosure 🛡️](#security--responsible-disclosure-️)
  - [License 📜](#license-)
  - [Maintainer / Contact ✉️](#maintainer--contact-️)

---

## About
QuietNote is a **local-first**, privacy-focused journaling app built with **React Native**. It is designed for reflection, mood tracking, and idea capture while keeping everything strictly on the user’s device. By default QuietNote avoids cloud sync, analytics, and any third-party trackers — users control export/import explicitly.

---

## Why QuietNote?
- Privacy-first design: entries never leave the device unless the user explicitly exports them. 🔒  
- Minimal, calm UX optimized for journaling and emotional reflection. 🕯️  
- Easy to fork, extend, and audit — perfect for open-source contributors and privacy-minded users. 🛠️

---

## Features ✨
- ✅ Local-first storage: all content stays on-device.  
<!-- - ✅ Optional app lock: PIN / passphrase / biometric lock (device-provided).   -->
- ✅ Attach photos & voice notes (saved locally).  
- ✅ Mood tags, daily prompts, and simple rich-text formatting.  
- ✅ Calendar timeline, search, and export/import features (user-initiated).  
- ✅ No analytics, no ads, no third-party trackers by default. 🚫📊

<!-- ---

 ## Tech stack 🛠️
- **React Native** (via Expo)  
- **Expo SDK 54**  
- **TypeScript**  
- Local storage options implemented as abstractions (see `src/services/storage`): recommended options: `expo-sqlite` (SQLite), `WatermelonDB`, or encrypted file storage.  
- Optional: `react-native-encrypted-storage` or platform-specific secure storage for encryption keys. 

---

## Demo / Screenshots 📸
Add screenshots to `assets/screenshots/` and reference them here. Example:
```
/assets/screenshots/01-welcome.png
/assets/screenshots/02-new-entry.png
/assets/screenshots/03-lock-screen.png
/assets/screenshots/04-calendar.png
```
You can include the images below after adding them to the repo. Keep screenshots simple and policy-safe (no real user content).
-->
---

## Getting started 🚀

### Prerequisites
- Node.js (LTS; ≥16 recommended)  
- pnpm  — install with `npm i -g pnpm` 
- Expo CLI (optional global): `pnpm add -g expo-cli` or use `npx expo` / `pnpm exec expo`  
- Android Studio or Xcode (for emulators & native builds) if building standalone apps  
- Optional: EAS CLI (`pnpm add -g eas-cli`) if you plan to use Expo Application Services for production builds

### Install (pnpm)
```bash
# clone the repo
git clone https://github.com/tawwar/quiet-note.git
cd quiet-note

# install dependencies with pnpm
pnpm install
```

### Run (development)
```bash
# start Expo dev server
pnpm start
# or
pnpm exec expo start
```

- Open the Expo Go app and scan the QR code, or press `a` to open Android emulator, `i` for iOS simulator (macOS + Xcode required).

### Build (optional)
Use EAS for production builds (recommended for standalone apps):
```bash
# login first
pnpm exec eas login

# build android
pnpm exec eas build -p android

# build ios
pnpm exec eas build -p ios
```

---

## Configuration & privacy notes 🔏

- **Permissions**: Request only the minimum permissions when needed (camera for attaching photos, microphone for voice notes, storage for explicit import/export). Explain why you request them in-app.  
- **Data collection**: By default QuietNote collects no analytics or identifiers. If you add any third-party libraries that collect data (crash reporters, analytics), update the privacy policy and the Play Store Data Safety form immediately.  
- **Encrypted storage**: If you implement encryption, document key derivation & storage. Prefer device secure storage / keychain and biometric unlocking.

<!-- ---

## Architecture & folder structure
A recommended structure (included in this repo as a guideline):
```
/
├─ README.md
├─ app.json / app.config.ts        # Expo config
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
├─ src/
│  ├─ assets/
│  ├─ components/                 # small UI components
│  ├─ screens/                    # screen components (Home, Editor, Settings...)
│  ├─ navigation/                 # React Navigation setup
│  ├─ services/                   # storage, encryption, export/import
│  ├─ hooks/
│  ├─ context/                    # React contexts
│  ├─ types/
│  └─ utils/
├─ assets/
│  └─ screenshots/
├─ privacy.html
├─ CONTRIBUTING.md
└─ LICENSE
``` -->

<!-- ---

## Storage choices & recommendations
- **SQLite (expo-sqlite)** — simple and reliable for structured entries. Good performance for queries and calendar views.  
- **WatermelonDB** — great for larger datasets and offline-first patterns, but heavier to integrate.  
- **Encrypted file storage** — simple JSON blobs encrypted on disk for small apps; easiest to audit.  
- **Recommendation:** Provide a storage abstraction (`src/services/storage`) so implementers can swap storage engines without changing UI code.

---

## Scripts (recommended for `package.json`)
Use pnpm scripts. Example `package.json` **scripts** section:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "build:android": "eas build -p android",
    "build:ios": "eas build -p ios",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "jest"
  }
}
```

---

## Testing 🧪
- Unit tests: Jest + React Native Testing Library (recommended).  
- E2E tests: Detox or Appium (optional).  
- Add CI to run `pnpm test`, `pnpm lint`, and `pnpm typecheck` on PRs.
 -->
---

## Contributing 🤝
Thanks for your interest! Please follow these steps:

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`  
2. Keep changes small and focused.  
3. Add or update tests where applicable.  
4. Ensure types are included and `pnpm run typecheck` passes.  
5. Open a pull request with a clear description and link to any related issue.  
6. Be respectful and constructive in code reviews.

Consider adding these files to the repo if they don't exist: `CONTRIBUTING.md`, `ISSUE_TEMPLATE.md`, `PULL_REQUEST_TEMPLATE.md`, and `CODE_OF_CONDUCT.md`.

---

## Security & responsible disclosure 🛡️
If you discover a security vulnerability, **do not** open a public issue. Contact the maintainers privately at `apps@tawwar.com` with details and reproduction steps. Include a suggested timeline for disclosure if possible.

---

## License 📜
This project is released under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

## Maintainer / Contact ✉️
- **Maintainer/X:** [Hossam Darwish](https://www.x.com/hossdar)
- **Email:** `apps@tawwar.com`  
- **Website:** [tawwar.com](https://tawwar.com)
---

Thank you for using and contributing to QuietNote — a small, private place to write. ❤️
