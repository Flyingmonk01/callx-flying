# 📞 Callx - React Native Incoming Call Library

**Beautiful React Native incoming call UI with Firebase Cloud Messaging integration**

[![npm version](https://img.shields.io/npm/v/@bear-block/callx.svg)](https://www.npmjs.com/package/@bear-block/callx)  
[![license](https://img.shields.io/npm/l/@bear-block/callx.svg)](https://www.npmjs.com/package/@bear-block/callx)  
[![GitHub stars](https://img.shields.io/github/stars/bear-block/callx.svg?style=social&label=Star)](https://github.com/bear-block/callx)  
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red.svg)](https://github.com/sponsors/bear-block)

<table>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/bear-block/callx/main/example/docs/assets/incoming-call-background.gif" width="324" /><br/>
      <b>When app is in background</b>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/bear-block/callx/main/example/docs/assets/incoming-call-lockscreen.gif" width="324" /><br/>
      <b>When device is on lock screen</b>
    </td>
  </tr>
</table>

---

## ✨ Features

- 📱 **Cross-platform**: iOS & Android support
- 🍎 **iOS**: Complete iOS support with CallKit & PushKit
- 🤖 **Android**: Custom incoming call UI with FCM
- 🌗 **Auto Dark/Light (Android)**: Incoming call UI adapts to system theme
- 🔔 **Push Notifications**: Firebase Cloud Messaging (FCM)
- 🎥 **Video call support** for both platforms
- 📋 **Call logging** to phone's native call history
- ⚙️ **Configuration**: set from JS via `Callx.initialize(...)` and persisted locally (no AndroidManifest/Info.plist mapping)
- 🚀 **Expo plugin** for automatic configuration
- 🔧 **TypeScript**: Full TypeScript support

### ✅ Compatibility

- **React Native**: 0.70+
- **Expo**: SDK 52+
- **Android**: 
  - **Kotlin projects**: Extend `CallxReactActivity` in your `MainActivity.kt` (automatic with plugin)
  - **Java projects**: Extend `CallxReactActivity` in your `MainActivity.java` (automatic with plugin)
- **iOS**: Works with Swift `AppDelegate` (default in modern templates). No custom `AppDelegate` code is required; the module initializes its own PushKit/CallKit handler.

> Note: On iOS you still need to enable Background Modes (VoIP, Remote notifications) and Push Notifications capability in your app's signing settings. The plugin injects Info.plist keys, but code signing capabilities are configured in your project/EAS.

### 📋 Platform Support

| Feature | iOS | Android |
|---------|-----|---------|
| Native UI | ✅ CallKit | ✅ Custom |
| Push Notifications | ✅ PushKit | ✅ FCM |
| Lock Screen | ✅ Native | ✅ Custom |
| Video Calls | ✅ Native | ✅ Native |
| Call Logging | ✅ Native | ✅ Native |
| Background Processing | ✅ Native | ✅ Native |

### 🚀 Support Development

If this library helps you, please consider supporting its development:

- ⭐ **Star this repo** - [GitHub](https://github.com/bear-block/callx)
- 💖 **Sponsor on GitHub** - [GitHub Sponsors](https://github.com/sponsors/bear-block)
- ☕ **Buy me a coffee** - [Buy Me a Coffee](https://www.buymeacoffee.com/bearblock)

---

## 🔧 Configuration at a glance

Purpose: let native detect call events from your push payload, map fields for the UI, and enable platform features — even when JS is not running. You configure everything from JS; the library persists it locally for background/native paths.

- **Triggers** (JS): which push field/value triggers each event
  - Keys: `incoming`, `ended`, `missed`, `answered_elsewhere`
  - Example:
    ```ts
    triggers: {
      incoming: { field: 'type', value: 'call.started' },
      ended: { field: 'type', value: 'call.ended' },
      missed: { field: 'type', value: 'call.missed' },
      answered_elsewhere: { field: 'type', value: 'call.answered_elsewhere' }
    }
    ```
- **Fields mapping** (JS): map fields from push payload to UI
  - Keys: `callId`, `callerName`, `callerPhone`, `callerAvatar`, `hasVideo`
  - Paths support dot-notation (e.g., `data.caller.name`)
  - Example:
    ```ts
    fields: {
      callId: { field: 'callId' },
      callerName: { field: 'callerName', fallback: 'Unknown Caller' },
      callerPhone: { field: 'callerPhone', fallback: 'No Number' },
      callerAvatar: { field: 'callerAvatar', fallback: '' },
      hasVideo: { field: 'hasVideo', fallback: 'false' }
    }
    ```
- **App flags** (JS):
  - `supportsVideo` (boolean): enable video-call affordances (iOS/Android)
  - `enabledLogPhoneCall` (boolean): log calls to device history (if permitted)
  - `showOverLockscreen` (Android-only)
  - `requireUnlock` (Android-only)

**Runtime flow:**
- Android: FCM → match Trigger → show UI on lock screen → buffer events → JS receives after `Callx.initialize(...)`.
- iOS: VoIP push → CallKit UI → buffer events → JS receives after `Callx.initialize(...)`.

---

## ⚡ Quick Setup

> **⚠️ IMPORTANT:** Ensure you have completed the [React Native Firebase with Messaging setup guide](https://rnfirebase.io/) first.

### 📦 Install

```bash
npm install @bear-block/callx
# or
yarn add @bear-block/callx
```

### 📱 Expo Setup (Recommended)

#### 1. Add Plugin to `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "@bear-block/callx",
        { "package": "your.package.name" }
      ]
    ]
  }
}
```

**The plugin automatically:**
- ✅ Updates `MainActivity` to extend `CallxReactActivity` (supports both Kotlin `.kt` and Java `.java` files)
- ✅ Adds required iOS background modes (`voip`, `remote-notification`)

#### 2. Build with EAS

```bash
eas build --platform android
eas build --platform ios
```

> **💡 Note:** Expo development builds are required for native modules like Callx. **Expo SDK 52+ is fully supported!**

### 🔧 React Native CLI Setup

#### 1. Android Setup

**For Kotlin projects**, extend `CallxReactActivity` in your `MainActivity.kt`:

```kotlin
import com.callx.CallxReactActivity

class MainActivity : CallxReactActivity() {
  // ...
}
```

**For Java projects**, extend `CallxReactActivity` in your `MainActivity.java`:

```java
import com.callx.CallxReactActivity;

public class MainActivity extends CallxReactActivity {
    // ...
}
```

**💡 Note**: The Expo plugin automatically detects and modifies both Kotlin (`.kt`) and Java (`.java`) MainActivity files to extend `CallxReactActivity`!

Permissions required for full-screen incoming UI and notifications are declared by the library; no manual manifest changes are needed.

#### 2. iOS Setup

If you use the Expo plugin, required background modes and privacy strings are injected automatically. For React Native CLI, ensure `UIBackgroundModes` includes `voip` and `remote-notification` in your `Info.plist`.

#### 3. Configure Triggers & Fields (in JS)

Call `Callx.initialize({...})` from JS with your mapping (see examples below). The library persists this config for background/native use.

#### 4. Initialize in JS

Initialize as early as possible (e.g., `index.js`). Native buffers events when the app is killed/backgrounded and flushes them on initialize:

```ts
// index.js - Initialize before app renders
import Callx from '@bear-block/callx';

Callx.initialize({
  // Required: mapping and triggers
  triggers: {
    incoming: { field: 'type', value: 'call.started' },
    ended: { field: 'type', value: 'call.ended' },
    missed: { field: 'type', value: 'call.missed' },
    answered_elsewhere: { field: 'type', value: 'call.answered_elsewhere' },
  },
  fields: {
    callId: { field: 'callId' },
    callerName: { field: 'callerName', fallback: 'Unknown Caller' },
    callerPhone: { field: 'callerPhone', fallback: 'No Number' },
    callerAvatar: { field: 'callerAvatar', fallback: '' },
    hasVideo: { field: 'hasVideo', fallback: 'false' },
  },
  app: {
    supportsVideo: false,
    enabledLogPhoneCall: true,
    // Android-only flags:
    showOverLockscreen: true,
    requireUnlock: false,
  },

  // Optional: listeners
  onIncomingCall: (data) => {},
  onCallAnswered: (data) => {},
  onCallDeclined: (data) => {},
  onCallEnded: (data) => {},
  onCallMissed: (data) => {},
  onCallAnsweredElsewhere: (data) => {},
  onTokenUpdated: ({ token }) => {},
});
```

---

## 📋 Configuration Examples

Configuration is now JS-only (persisted for native/background use). See the `initialize` example above.

**Theming:**
- Android incoming UI uses a DayNight theme with `values-night/` and `drawable-night/` overrides.
- No setup needed: the screen follows system Dark/Light automatically.
- You can override colors by redefining `call_background_*` and `call_text_*` in your app.

---

## 🎥 Video Call Support

Callx supports both voice and video calls:

**Push Notification Payload:**
```json
{
  "data": {
    "type": "call.started",
    "callId": "call-123",
    "callerName": "John Doe",
    "callerPhone": "+1234567890",
    "hasVideo": true  // or false for voice calls
  }
}
```

**Call Data Structure:**
```typescript
interface CallData {
  callId: string;
  callerName: string;
  callerPhone: string;
  callerAvatar?: string;
  hasVideo?: boolean;  // true for video calls, false for voice calls
  originalPayload?: Object; // full push payload (FCM/VoIP)
}
```

---

## 🔥 FCM & iOS VoIP Integration

### Android (FCM)

Callx automatically handles FCM messages for Android. Just send a data-only message:

```json
{
  "data": {
    "type": "call.started",
    "callId": "call-123",
    "callerName": "John Doe",
    "callerPhone": "+1234567890",
    "hasVideo": "false"
  }
}
```

Other events:
```json
{
  "data": { "type": "call.ended", "callId": "call-123" }
}
{
  "data": { "type": "call.missed", "callId": "call-123" }
}
{
  "data": { "type": "call.answered_elsewhere", "callId": "call-123" }
}
```

### iOS (VoIP Push)

For iOS, you need to send VoIP push notifications using the VoIP token:

```typescript
// Get VoIP token
const voipToken = await Callx.getVoIPToken();

// Listen for token updates
Callx.initialize({
  onTokenUpdated: (tokenData) => {
    console.log('VoIP token updated:', tokenData.token);
    // Send this token to your server for VoIP pushes
  }
});
```

**VoIP Push Payload:**
```json
{
  "data": {
    "type": "call.started",
    "callId": "call-123",
    "callerName": "John Doe",
    "callerPhone": "+1234567890",
    "hasVideo": true
  }
}
```

---

## 🚀 Advanced Usage

### Manual Call Display

You can manually trigger call UI from your JS code:

```ts
import Callx from '@bear-block/callx';

// Show incoming call manually
Callx.showIncomingCall({
  callId: 'manual-call-123',
  callerName: 'John Doe',
  callerPhone: '+1234567890',
  callerAvatar: 'https://example.com/avatar.jpg',
  hasVideo: true, // Video call support
});
```

### Token Management

Get tokens for your server:

```ts
// FCM Token (Android)
const fcmToken = await Callx.getFCMToken();
console.log('FCM Token:', fcmToken);

// VoIP Token (iOS)
const voipToken = await Callx.getVoIPToken();
console.log('VoIP Token:', voipToken);
```

### Call Status Management

```ts
// Check if call is active
const isActive = await Callx.isCallActive();

// Get current call data
const currentCall = await Callx.getCurrentCall();

// End current call
await Callx.endCall('call-id');

// Answer call
await Callx.answerCall('call-id');

// Decline call
await Callx.declineCall('call-id');
```

### Manual FCM Handling

If you're using JS mode, handle FCM messages manually:

```ts
import messaging from '@react-native-firebase/messaging';

messaging().onMessage(async (remoteMessage) => {
  // Handle FCM message manually
  await Callx.handleFcmMessage(remoteMessage.data);
});
```

---

## 🔧 Troubleshooting

### Common Issues

**FCM not working?**
- ✅ Check `google-services.json` is in `android/app/`
- ✅ Verify Firebase project settings
- ✅ Test with real device (not simulator)
- ✅ Ensure React Native Firebase is properly installed
- ✅ Check Firebase dependencies are added to Gradle files

**iOS VoIP not working?**
- ✅ Test with real device (VoIP doesn't work in simulator)
- ✅ Check Info.plist has voip background mode
- ✅ Verify VoIP certificate in Apple Developer Console
- ✅ Ensure VoIP push payload is correct

**Native UI not showing?**
- ✅ Check FCM configuration
- ✅ Ensure MainActivity extends CallxReactActivity

**Build errors?**
- ✅ Clean and rebuild: `cd android && ./gradlew clean`
- ✅ Check Android logs: `adb logcat | grep Callx`
- ✅ Check iOS logs in Xcode console

### Debug Mode

```ts
// Check current state
console.log('Active call:', await Callx.getCurrentCall());
console.log('FCM token:', await Callx.getFCMToken());
console.log('VoIP token:', await Callx.getVoIPToken());
```

---

## 🔔 Notification Configuration

Callx uses hardcoded notification settings for consistent behavior across all installations:

### Android Notification Channel
- **Channel ID**: `callx_incoming_calls`
- **Channel Name**: `Incoming Calls`
- **Description**: `Incoming call notifications with ringtone`
- **Importance**: `high`
- **Sound**: `default`

### iOS Push Notifications
- **Category**: VoIP push notifications
- **Sound**: Default system sound
- **Priority**: High priority for immediate delivery

> **Note:** These settings are built into the native module and cannot be customized. This ensures consistent notification behavior across all Callx installations.

---

## 📖 API Reference

### Methods

| Method                                   | Description                               | Platform |
| ---------------------------------------- | ----------------------------------------- | -------- |
| `initialize(config)`                     | Initialize Callx with event listeners     | Both |
| `showIncomingCall(data)`                 | Manually display incoming call UI         | Both |
| `handleFcmMessage(data)`                 | Handle FCM message manually (for JS mode) | Both |
| `answerCall(callId)`                     | Answer current call                       | Both |
| `declineCall(callId)`                    | Decline current call                      | Both |
| `endCall(callId)`                        | End current call                          | Both |
| `getFCMToken()`                    | Get current FCM token              | Both |
| `getVoIPToken()`                   | Get current VoIP token (iOS)      | iOS  |
| `getCurrentCall()`                 | Get current active call data      | Both |
| `isCallActive()`                   | Check if call is active           | Both |
| `hideFromLockScreen()`             | Hide app from lock screen         | Android |
| `moveAppToBackground()`            | Move app to background            | Android |

### Event Callbacks

| Event                       | Description                            |
| --------------------------- | -------------------------------------- |
| `onIncomingCall`           | Triggered when incoming call displayed |
| `onCallAnswered`           | User answered the call                 |
| `onCallDeclined`           | User rejected the call                 |
| `onCallEnded`              | Call ended after it was answered       |
| `onCallMissed`             | Call was missed (no response)          |
| `onCallAnsweredElsewhere` | Call answered on another device  |
| `onTokenUpdated`                | VoIP or FCM token was updated            | Both |

---

## 🎯 Best Practices

### 📱 App Architecture

**Recommended Setup:**

```ts
// index.js - Initialize before app renders
import Callx from '@bear-block/callx';

// Initialize Callx before app starts
Callx.initialize({
  onIncomingCall: (data) => {
    // Navigate to call screen or show notification
    // Note: navigation might not be available here
    console.log('📞 Incoming call:', data);
  },
  onCallAnswered: (data) => {
    // Handle call answered - start your call logic
    console.log('✅ Call answered:', data);
  },
  onCallDeclined: (data) => {
    // Handle call declined - user rejected the call
    console.log('❌ Call declined:', data);
  },
  // Handle call end scenarios
  onCallAnsweredElsewhere: (data) => {
    console.log('📱 Answered elsewhere:', data);
    // Hide current call UI, show "answered elsewhere" message
  },
});

// Then register your app
AppRegistry.registerComponent(appName, () => App);
```

### 🔒 Lock Screen Call Handling

**End Call from Lock Screen:**

```ts
// Handle end call when app is in background/lock screen
Callx.initialize({
  onCallAnswered: (data) => {
    // Start your call session
    startCallSession(data);
  },
  onCallEnded: (data) => {
    // Call ended - clean up resources
    endCallSession(data);

    // If app was launched from lock screen, you might want to:
    // 1. Hide from lock screen (Android)
    if (Platform.OS === 'android') {
      Callx.hideFromLockScreen();
      Callx.moveAppToBackground();
    }
  },
});

// Manual end call handling
import { AppState, Platform } from 'react-native';

const handleEndCall = async (callId) => {
  try {
    // End call in your app
    await endCallInYourApp(callId);

    // End call in Callx
    await Callx.endCall(callId);

    // Check if app is in background (likely from lock screen)
    const appState = AppState.currentState;
    if (Platform.OS === 'android' && (appState === 'background' || appState === 'inactive')) {
      // Only cleanup if app was in background
      await Callx.hideFromLockScreen();
      await Callx.moveAppToBackground();
    }
  } catch (error) {
    console.error('Error ending call:', error);
  }
};