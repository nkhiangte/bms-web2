# Android Play Store Deployment Guide

This project has been set up with Capacitor to wrap your web app into a native Android app. We have also configured a GitHub Actions workflow to automatically build and upload your app to the Google Play Store when you push to the `main` branch.

## 1. Local Development
*   **Android Studio:** To run the app locally on an emulator or device, you can open the Android project via Android Studio.
    ```bash
    npx cap open android
    ```
*   **Syncing changes:** Every time you make changes to your React app and run `npm run build`, you need to sync the changes to the Android native project:
    ```bash
    npx cap sync android
    ```

## 2. GitHub Actions Setup for Automatic Deployment
The provided `.github/workflows/android-deploy.yml` will automatically build an Android App Bundle (.aab) and upload it to the Play Store. However, it requires a few secret keys to sign the application securely.

You must configure the following Secrets in your GitHub repository (**Settings > Secrets and variables > Actions > New repository secret**):

### Required Secrets:
1.  **`KEYSTORE_BASE64`**: 
    Your Android Keystore is required to sign the app. Create a keystore locally and then convert it to base64.
    *   To generate: `keytool -genkey -v -keystore release.keystore -alias release-alias -keyalg RSA -keysize 2048 -validity 10000`
    *   To convert to base64: `base64 -w 0 release.keystore > keystore.b64` (Copy the contents of `keystore.b64` into the secret value).
2.  **`KEY_ALIAS`**:
    The alias you chose for your keystore (e.g., `release-alias`).
3.  **`KEY_PASSWORD`**:
    The password for your key.
4.  **`KEYSTORE_PASSWORD`**:
    The password for your keystore (usually the same as the key password).
5.  **`PLAY_STORE_SERVICE_ACCOUNT_JSON`**:
    A JSON key for a Google Cloud Service Account that has permissions to publish apps in your Google Play Console.
    *   Go to Google Play Console > Setup > API Access.
    *   Create a Service Account, generate a JSON key, and grant it the "Release manager" or "App Release" role.
    *   Paste the *entire JSON string* into this secret.

## 3. Play Store Prerequisites
*   You must upload the first APK/AAB to the Google Play Console **manually** before you can automate uploads via the API.
*   The package name is set to `com.bethelmissionschool.app`. Ensure this matches what you used to register the app in the Google Play Console!

## 4. Automation Track
By default, the workflow targets the `internal` track (Internal Testing).
Once you are ready for production, change the `track` parameter in `.github/workflows/android-deploy.yml` from `internal` to `production`.
