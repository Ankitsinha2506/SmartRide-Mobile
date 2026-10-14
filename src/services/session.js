import * as SecureStore from 'expo-secure-store';
const sessionKey = 'com.smartride.session';
export async function saveSession(session) {
  await SecureStore.setItemAsync(sessionKey, JSON.stringify(session));
}
export async function readSession() {
  const value = await SecureStore.getItemAsync(sessionKey);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
export async function clearSession() {
  await SecureStore.deleteItemAsync(sessionKey);
}
