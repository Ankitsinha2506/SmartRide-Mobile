# SmartRide Customer Mobile App

React Native CLI application for Android and iOS, written in JavaScript. It connects to the existing SmartRide backend for authentication, vehicles, bookings, Razorpay payments, notifications, profile uploads, reviews, and real-time Socket.IO updates.

## Requirements

- Node.js 22 (the repository includes `.nvmrc`)
- JDK 17 and Android Studio for Android
- Xcode and CocoaPods for iOS

## Run locally

```sh
npm install
npm start
```

In a second terminal:

```sh
npm run android
# or
npm run ios
```

This customer app reserves Metro port `8081`, allowing it to run alongside the driver app on port `8082`.

The development API host is set in `src/config/env.js`: Android emulator uses `10.0.2.2`, while iOS Simulator uses `localhost`. For a physical device, replace it with the computer's LAN address. Release builds must use an HTTPS production URL.

After changing native dependencies, run:

```sh
cd ios
pod install
```

## Quality checks

```sh
npm run lint
npm test -- --watchman=false --runInBand
cd android && ./gradlew assembleDebug
```

## Structure

- `src/components`: reusable mobile UI
- `src/screens`: feature screens for auth, discovery, bookings, notifications, profile, and reviews
- `src/navigation`: authenticated stacks and bottom tabs
- `src/services`: secure session storage, REST, and Socket.IO
- `src/store`: Zustand session state
- `src/theme`: shared design tokens

## External setup

- Razorpay: configure valid keys in the backend; the mobile app verifies payments through the backend and does not store a secret.
- Profile images: configure Cloudinary/upload credentials in the backend.
- Push notifications: Firebase/APNs require environment-specific `google-services.json`, `GoogleService-Info.plist`, signing, and APNs credentials. Socket.IO notifications work without those files; add the platform credentials before enabling remote push in a release build.
