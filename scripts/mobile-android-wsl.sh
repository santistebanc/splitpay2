#!/usr/bin/env bash
# Build/install the Android dev app from WSL when the repo lives on the Linux filesystem.
# Requires x86_64 WSL + Linux Android SDK. ARM WSL and Windows SDK cannot compile from WSL.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

ARCH="$(uname -m)"
if [[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]]; then
  echo "WSL is ARM64 ($ARCH). Android native builds from WSL are not supported on this machine."
  echo "The Linux SDK installs x86_64 tools (cmake, aapt2) that cannot run on ARM Linux."
  echo ""
  echo "Build from a native Windows path instead:"
  echo "  git clone <repo> C:\\Users\\santi\\code\\splitpay2"
  echo "  cd C:\\Users\\santi\\code\\splitpay2"
  echo "  npm install"
  echo "  adb devices"
  echo "  npm run mobile:android"
  echo ""
  echo "Or from WSL, if the C:\\ clone exists:"
  echo "  npm run mobile:android:win"
  echo ""
  echo "See docs/MOBILE-DEV.md"
  exit 1
fi

LINUX_SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"
if [[ "$LINUX_SDK" == /mnt/c/* ]]; then
  LINUX_SDK="$HOME/Android/Sdk"
fi

WINDOWS_SDK=""
for u in /mnt/c/Users/*; do
  sdk="$u/AppData/Local/Android/Sdk"
  if [[ -f "$sdk/platform-tools/adb.exe" ]]; then
    WINDOWS_SDK="$sdk"
    break
  fi
done

if [[ ! -x "$LINUX_SDK/cmdline-tools/latest/bin/sdkmanager" && ! -d "$LINUX_SDK/ndk" ]]; then
  echo "No Linux Android SDK at $LINUX_SDK"
  echo ""
  echo "WSL cannot use the Windows SDK for native builds (cmake/NDK are Windows .exe files)."
  echo ""
  echo "Option A — install Linux SDK in WSL (keep repo in ~/code/splitpay2):"
  echo "  bash scripts/setup-android-sdk-wsl.sh"
  echo "  npm run mobile:android:wsl"
  echo ""
  echo "Option B — build from a native Windows clone (uses Android Studio SDK):"
  echo "  git clone <repo> C:\\Users\\santi\\code\\splitpay2"
  echo "  cd C:\\Users\\santi\\code\\splitpay2 && npm install && npm run mobile:android"
  echo ""
  echo "See docs/MOBILE-DEV.md"
  exit 1
fi

if ! command -v java >/dev/null 2>&1; then
  echo "Install JDK 17 in WSL: sudo apt install openjdk-17-jdk"
  exit 1
fi

mkdir -p "$LINUX_SDK/platform-tools"
if [[ -n "$WINDOWS_SDK" ]]; then
  ADB_EXE="$WINDOWS_SDK/platform-tools/adb.exe"
  cat >"$LINUX_SDK/platform-tools/adb" <<EOF
#!/usr/bin/env bash
exec "$ADB_EXE" "\$@"
EOF
  chmod +x "$LINUX_SDK/platform-tools/adb"
  echo "adb → Windows adb.exe (USB device on host)"
else
  echo "Warning: Windows adb.exe not found — USB device may not appear."
fi

export ANDROID_SDK_ROOT="$LINUX_SDK"
export ANDROID_HOME="$LINUX_SDK"
export JAVA_HOME="${JAVA_HOME:-$(dirname "$(dirname "$(readlink -f "$(which java)")")")}"
export PATH="$LINUX_SDK/platform-tools:$LINUX_SDK/cmdline-tools/latest/bin:$PATH"

echo "ANDROID_HOME=$ANDROID_HOME"
echo "JAVA_HOME=$JAVA_HOME"
if [[ -x "$LINUX_SDK/platform-tools/adb" ]]; then
  "$LINUX_SDK/platform-tools/adb" devices
fi
echo ""

cd "$ROOT"
exec npm run android --workspace=@splitpay/mobile
