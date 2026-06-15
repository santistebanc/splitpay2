# Run SplitPay on your phone

The fastest path is **Expo Go** (no Xcode/Android Studio build). The app uses the SQL.js PowerSync adapter on native, which works inside Expo Go’s sandbox.

## 1. Install Expo Go (SDK 56)

This project uses **Expo SDK 56**. The Play Store / App Store version of Expo Go is usually **older** and shows:

> _Project is incompatible with this version of Expo Go_

That is expected — SDK 56 Expo Go is **not on the Play Store yet** ([Expo changelog](https://expo.dev/changelog/sdk-56)).

### Android (your case)

**Option A — download the APK (easiest)**

1. Open **[expo.dev/go](https://expo.dev/go)** on your phone (or PC and transfer the file).
2. Select **SDK 56** → **Android** → **Install**.
3. Install the APK (allow “unknown sources” if prompted).
4. Open **that** Expo Go, then scan the QR from `npm run mobile:tunnel`.

**Option B — USB + Expo CLI**

1. Enable **Developer options** and **USB debugging** on the phone.
2. Plug in USB; on Windows run `adb devices` and confirm the phone appears.
3. Run `npm run mobile:tunnel` and press **`a`** in the terminal — Expo CLI installs the matching Expo Go build.

### iOS

Play Store Expo Go will not work for SDK 56 on a physical device. Use the [SDK 56 TestFlight beta](https://expo.dev/go) or a development build (`npx expo run:ios` on a Mac).

Phone and dev machine must be able to reach each other (same Wi‑Fi, or use tunnel — see below).

## 2. Offline mode (simplest)

Full app locally — create groups, expenses, settle, settings. No join/sync with other devices.

```bash
cd /path/to/splitpay2
npm install
npm run mobile:tunnel
```

Scan the QR code with Expo Go (Android: in app; iOS: Camera app → open in Expo Go).

**WSL2 tip:** Plain `npm run mobile` (LAN mode) often fails because the phone cannot reach WSL’s IP. **`mobile:tunnel`** routes the JS bundle through Expo’s servers and usually works from WSL.

## 3. Sync mode (phone + laptop / two phones)

Start the backend on your dev machine:

```bash
supabase start -x vector
npm run supabase:reset
npm run powersync:start
```

Then start the app with sync env (uses your LAN IP + tunnel):

```bash
npm run mobile:sync
```

On a **second device** (another phone or browser tab), join with the host’s join code — same flow as [`MANUAL-SYNC-TESTING.md`](./MANUAL-SYNC-TESTING.md).

### WSL2 + sync

The phone must call **Supabase** (`:54321`) and **PowerSync** (`:8080`) on your PC, not `127.0.0.1`.

1. On Windows, run `ipconfig` and note your **Wi‑Fi IPv4** (e.g. `192.168.1.42`).
2. Allow inbound ports **54321** and **8080** in Windows Firewall if needed.
3. Start with that IP:

```bash
LAN_IP=192.168.1.42 npm run mobile:sync
```

If join fails with network errors, the phone still cannot reach the stack — fix networking before debugging app code.

**Important:** Uploads go to Supabase (`:54321`). **Downloading** sync data (expenses, etc.) requires PowerSync (`:8080`). If only Supabase is reachable, join-by-code can work (via the edge function) and members may appear (fetched from Supabase directly), but **expenses will not sync** until PowerSync is reachable from the phone.

## Scripts

| Command                        | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `npm run mobile`               | Expo dev server (LAN)                                  |
| `npm run mobile:tunnel`        | Expo via tunnel — **recommended on WSL2**              |
| `npm run mobile:dev`           | Tunnel + `adb reverse` for installed **dev build**     |
| `npm run mobile:sync`          | Tunnel + local Supabase/PowerSync on your PC           |
| `npm run mobile:remote`        | Tunnel + **hosted dev** stack (`env/dev.local`)        |
| `npm run web:dev`              | Web → hosted dev stack                                 |
| `npm run deploy:dev`           | Push migrations + join function to linked Supabase     |
| `npm run mobile:android`       | Build + install native dev app (Windows `C:\` clone)   |
| `npm run mobile:android:win`   | Same build, triggered from WSL via `cmd.exe`           |
| `npm run mobile:adb:qr`        | Pair phone to ADB over Wi‑Fi via QR code (Android 11+) |
| `npm run mobile:android:wsl`   | Build from WSL (**x86_64 WSL only**)                   |
| `npm run mobile:android:setup` | One-time Linux SDK install for x86_64 WSL              |

## What works in Expo Go

- Local SQLite (SQL.js adapter — fine for trying UI flows, not for production)
- All screens: groups, expenses, settle, settings, activity
- **Upload** to the server (create group, add expense) when Supabase is reachable

## What does not work reliably in Expo Go

PowerSync’s own docs call `@powersync/adapter-sql-js` an **alpha dev adapter** for Expo Go’s sandbox. It is slow, rewrites the whole DB file on every write, and **inbound sync (server → phone) is not dependable** — which matches what you see when laptop → phone fails but phone → laptop works.

| Capability              | Laptop web            | Phone (Expo Go + SQL.js) |
| ----------------------- | --------------------- | ------------------------ |
| Upload to server        | ✓                     | ✓                        |
| Download from PowerSync | ✓ (SharedWorker sync) | ✗ unreliable             |
| Live UI on sync         | ✓                     | ✗ unreliable             |

**For reliable two-device sync today:** use two browser tabs (`npm run web:sync`), a **hosted dev stack** (`npm run web:dev` + `npm run mobile:remote` — see [`REMOTE-DEV.md`](./REMOTE-DEV.md)), or build a **development build** with native SQLite (see below).

## Troubleshooting

| Symptom                                                        | Likely cause                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| _Project incompatible with Expo Go_                            | Play Store Expo Go is older than SDK 56 — install from [expo.dev/go](https://expo.dev/go)                    |
| `TypeError: undefined is not a function` on launch             | Fixed in app code — reload after pull (`window` on RN is not a browser)                                      |
| `Property 'crypto' doesn't exist` on create/save               | Fixed in app code — reload after pull (Hermes has no Web Crypto)                                             |
| **Blank gray screen** (dev app opens, nothing loads)           | Metro is not running or the phone cannot reach it — see [Blank dev app screen](#blank-dev-app-screen)        |
| Join fails / network errors on phone                           | Phone cannot reach Supabase/PowerSync on your PC — set `LAN_IP`                                              |
| Phone → laptop sync works, laptop → phone never                | Expected on Expo Go — use web or a dev build                                                                 |
| Repeating `409` on `groups` in console                         | Stale upload queue — force-close Expo Go or reset local app data                                             |
| `JAVA_HOME is not set` / no `java`                             | Set `JAVA_HOME` to Android Studio `jbr`; add `%JAVA_HOME%\bin` to Path                                       |
| `ENOENT` … `C:\Windows\package.json`                           | UNC path (`\\wsl.localhost\...`) — use `C:\...` or `Z:\...`, not UNC                                         |
| Gradle `FileHasher` / `Incorrect function` on `Z:\`            | Build from `C:\` clone, not the WSL mount                                                                    |
| `cmake: Syntax error: ")" unexpected` in WSL                   | ARM WSL — use `C:\` clone (see below)                                                                        |
| `JvmVendorSpec IBM_SEMERU` / `Cannot find a Java installation` | Run `npm install` (postinstall patches RN gradle plugin + sets `org.gradle.java.home` to Android Studio jbr) |
| `Build Tools … corrupted` / missing `aapt.exe`                 | Reinstall **Android SDK Build-Tools 36** in Android Studio SDK Manager (see below)                           |
| `Inconsistent JVM-target` Java 17 vs Kotlin 21                 | Run `npm install` again (postinstall aligns Java + Kotlin to 21)                                             |
| `CodeHeap 'profiled nmethods'` / prefab JVM OOM                | Run `npm install`, `gradlew --stop`, close other apps; build uses max 2 workers (see below)                  |

## Blank dev app screen

The native **SplitPay** app (from `npm run mobile:android`) is only a shell until **Metro** delivers the JavaScript bundle. A solid gray screen with no spinner usually means the bundle never loaded — not a database or sync bug.

### Fix (Windows clone + phone)

**Terminal 1** — keep this running:

```powershell
cd C:\Users\santi\Downloads\splitpay2
adb devices
npm run mobile:dev
```

`mobile:dev` runs `adb reverse tcp:8081 tcp:8081` (when a device is connected) and starts Metro in **tunnel** mode so the phone can reach your PC even on tricky Wi‑Fi.

**On the phone:** open the **SplitPay** dev app (not Expo Go). If it is still blank, shake the device → **Reload**.

### Checklist

| Step                           | Why                                                         |
| ------------------------------ | ----------------------------------------------------------- |
| Metro terminal stays open      | Closing it stops the JS server                              |
| `adb devices` shows your phone | Needed for `adb reverse` and installs                       |
| Same Wi‑Fi (or tunnel)         | LAN-only Metro fails when the phone cannot route to your PC |
| Open **SplitPay** dev app      | Expo Go is a different app and will not load this build     |

### USB vs wireless ADB

- **USB:** `adb reverse tcp:8081 tcp:8081` then `npm run mobile:dev` is usually enough.
- **Wireless only:** pair first (`npm run mobile:adb:qr`), confirm `adb devices`, then `npm run mobile:dev`. Tunnel mode covers most cases when reverse is unavailable.

### If you see a spinner + “Loading database…”

JavaScript **is** loading. Wait a few seconds, or check Metro logs for a red error. Sync env vars (`mobile:sync`) are optional for offline UI — they only affect server sync, not the initial shell.

## Development build (recommended for phone + sync)

Expo Go uses SQL.js. A **dev build** uses `@journeyapps/react-native-quick-sqlite` automatically — stable bidirectional PowerSync, same model as web. `expo run:android` generates `apps/mobile/android/` on first run (gitignored).

### Recommended: native Windows clone

Works on all Windows machines (including ARM / Surface). Uses Android Studio’s SDK.

```bat
git clone <repo-url> C:\Users\<you>\code\splitpay2
cd C:\Users\<you>\code\splitpay2
npm install
adb devices
npm run mobile:android
```

**Do not build from `Z:\` or `\\wsl.localhost\...`** — Gradle file locking breaks on the WSL filesystem.

Keep editing in WSL if you like; sync via git before building. From WSL after the clone exists:

```bash
npm run mobile:android:win
```

Override clone path: `WINDOWS_REPO=/mnt/c/Users/you/code/splitpay2 npm run mobile:android:win`

### Wireless ADB (QR code, Android 11+)

Phone and PC must be on the **same Wi‑Fi**. Bluetooth is not supported for ADB.

**From Windows (in the repo clone):**

```powershell
npm run mobile:adb:qr
```

A QR code appears in the terminal. On the phone:

1. **Settings → Developer options → Wireless debugging** → ON
2. **Pair device with QR code**
3. Scan the QR in your PC terminal

When pairing succeeds, verify and build:

```powershell
adb devices
npm run mobile:android
```

**Alternative — Android Studio:** **Device Manager → Pair devices over Wi‑Fi** shows a QR code; scan it from the phone the same way.

**Manual pairing (no QR):** Developer options → **Pair device with pairing code**, then:

```powershell
adb pair 192.168.x.x:PAIRING_PORT
adb connect 192.168.x.x:DEBUG_PORT
```

Use the **debug** IP/port from the Wireless debugging main screen (not the pairing port).

### Windows environment variables

**Required before `npm run mobile:android`.** `npm install` sets `org.gradle.java.home` in `%USERPROFILE%\.gradle\gradle.properties` to Android Studio's JBR when found. You can also set `JAVA_HOME` manually:

| Variable       | Typical value                                 |
| -------------- | --------------------------------------------- |
| `JAVA_HOME`    | `C:\Program Files\Android\Android Studio\jbr` |
| `ANDROID_HOME` | `C:\Users\<you>\AppData\Local\Android\Sdk`    |

Add to **Path**: `%JAVA_HOME%\bin` and `%ANDROID_HOME%\platform-tools`. Open a new CMD window after saving.

Quick test in CMD:

```bat
java -version
adb devices
```

Gradle JDK path: Android Studio → **Settings → Build Tools → Gradle → Gradle JDK**.

**Corrupted Build Tools (`aapt.exe` missing):** Android Studio → **Settings → Languages & Frameworks → Android SDK → SDK Tools** → uncheck **Android SDK Build-Tools 36**, Apply, then check it again and Apply. Or in CMD:

```bat
"%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" --uninstall "build-tools;36.0.0"
"%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;36.0.0"
```

If `sdkmanager` is not found, install **Android SDK Command-line Tools (latest)** in the same SDK Tools tab first.

If a prior build failed downloading JDK via foojay, clean up and retry:

```bat
cd apps\mobile\android
gradlew.bat --stop
rmdir /s /q %USERPROFILE%\.gradle\.tmp\jdks
cd ..\..\..
npm install
npm run mobile:android
```

**Prefab / CodeHeap OOM during native build:** Gradle runs several small JVMs for prefab. Close other heavy apps, then:

```powershell
cd apps\mobile\android
.\gradlew.bat --stop
cd C:\Users\santi\Downloads\splitpay2
$env:JAVA_TOOL_OPTIONS="-XX:ReservedCodeCacheSize=128m"
npm run mobile:android
```

`npm install` sets `org.gradle.workers.max=2` in your user and project `gradle.properties`.

### x86_64 WSL only (optional)

Skip on **ARM WSL** (`uname -m` = `aarch64`) — Google’s Linux SDK ships x86_64 host tools that fail on ARM.

```bash
sudo apt install openjdk-17-jdk unzip
npm run mobile:android:setup   # once
npm run mobile:android:wsl
```

### Daily sync dev (dev build on phone)

Terminal 1 — backend:

```bash
supabase start -x vector
npm run supabase:reset
npm run powersync:start
```

Terminal 2 — Metro with sync env:

```bash
LAN_IP=192.168.0.197 npm run mobile:sync
```

Open the **SplitPay** dev app on the phone (not Expo Go). Join/create groups and sync with laptop `npm run web:sync`.

See [PowerSync Expo Go support](https://docs.powersync.com/client-sdks/frameworks/expo-go-support) and [React Native SDK](https://docs.powersync.com/client-sdks/reference/react-native-and-expo).
