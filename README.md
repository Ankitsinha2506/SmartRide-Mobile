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

The development API host in `src/config/env.js` defaults to the host running Expo, which lets Expo Go on a physical device reach the backend on the same computer. Keep the phone and computer on the same network and start the backend on port `8080`. To override the API address, set `EXPO_PUBLIC_API_URL` (for example, `http://192.168.1.10:8080/api/v1`) before starting Expo. For Android emulators, `EXPO_PUBLIC_API_HOST=10.0.2.2` can be used if needed. Release builds must use an HTTPS production URL.

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
