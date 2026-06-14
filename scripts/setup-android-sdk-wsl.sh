#!/usr/bin/env bash
# Install a Linux Android SDK in WSL for native Gradle/NDK builds.
# USB devices on WSL2 still use Windows adb.exe via a wrapper (see mobile-android-wsl.sh).
set -euo pipefail

ARCH="$(uname -m)"
if [[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]]; then
  echo "WSL is ARM64 ($ARCH). Google's Linux Android SDK ships x86_64 binaries (cmake, aapt2, NDK host tools)."
  echo "They cannot run on ARM WSL — Android builds from WSL will fail."
  echo ""
  echo "Use a native Windows clone instead:"
  echo "  git clone <repo> C:\\Users\\santi\\code\\splitpay2"
  echo "  cd C:\\Users\\santi\\code\\splitpay2"
  echo "  npm install && npm run mobile:android"
  echo ""
  echo "See docs/MOBILE-DEV.md"
  exit 1
fi

SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
CMDLINE="$SDK_ROOT/cmdline-tools/latest"
TOOLS_ZIP="$SDK_ROOT/cmdline-tools.zip"
TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

NDK_VERSION="${ANDROID_NDK_VERSION:-27.1.12297006}"
CMAKE_VERSION="${ANDROID_CMAKE_VERSION:-3.22.1}"
BUILD_TOOLS="${ANDROID_BUILD_TOOLS:-35.0.0}"
PLATFORM="${ANDROID_PLATFORM:-android-36}"

if ! command -v java >/dev/null 2>&1; then
  echo "Install JDK 17 first: sudo apt install openjdk-17-jdk"
  exit 1
fi

if ! command -v unzip >/dev/null 2>&1; then
  echo "Install unzip first: sudo apt install unzip"
  exit 1
fi

mkdir -p "$SDK_ROOT/cmdline-tools"
if [[ ! -x "$CMDLINE/bin/sdkmanager" ]]; then
  echo "Downloading Android command-line tools..."
  curl -fsSL "$TOOLS_URL" -o "$TOOLS_ZIP"
  tmp="$(mktemp -d)"
  unzip -q "$TOOLS_ZIP" -d "$tmp"
  rm -rf "$CMDLINE"
  mv "$tmp/cmdline-tools" "$CMDLINE"
  rm -rf "$tmp" "$TOOLS_ZIP"
fi

export ANDROID_SDK_ROOT="$SDK_ROOT"
export ANDROID_HOME="$SDK_ROOT"

echo "Installing SDK packages (NDK, CMake, build-tools) — may take several minutes..."
yes | "$CMDLINE/bin/sdkmanager" --sdk_root="$SDK_ROOT" --licenses >/dev/null
"$CMDLINE/bin/sdkmanager" --sdk_root="$SDK_ROOT" \
  "platform-tools" \
  "platforms;${PLATFORM}" \
  "build-tools;${BUILD_TOOLS}" \
  "ndk;${NDK_VERSION}" \
  "cmake;${CMAKE_VERSION}"

echo ""
echo "Linux Android SDK installed at: $SDK_ROOT"
echo "Add to ~/.bashrc:"
echo "  export ANDROID_SDK_ROOT=\"$SDK_ROOT\""
echo "  export ANDROID_HOME=\"\$ANDROID_SDK_ROOT\""
echo ""
echo "Then run: npm run mobile:android:wsl"
