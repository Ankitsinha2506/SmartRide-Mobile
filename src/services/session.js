import * as Keychain from 'react-native-keychain';
const service = 'com.smartride.session';
export async function saveSession(session) {
  await Keychain.setGenericPassword('session', JSON.stringify(session), {
    service,
  });
}
export async function readSession() {
  const value = await Keychain.getGenericPassword({ service });
  if (!value) return null;
  try {
    return JSON.parse(value.password);
  } catch {
    return null;
  }
}
export async function clearSession() {
  await Keychain.resetGenericPassword({ service });
}
