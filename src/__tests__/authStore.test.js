jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
describe('auth store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ token: null, user: null, hydrated: false });
  });
  it('persists a new session', async () => {
    const session = { token: 'jwt', user: { role: 'CUSTOMER' } };
    await useAuthStore.getState().setSession(session);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'com.smartride.session',
      JSON.stringify(session),
    );
    expect(useAuthStore.getState()).toMatchObject(session);
  });
  it('hydrates a saved session', async () => {
    SecureStore.getItemAsync.mockResolvedValue(
      JSON.stringify({ token: 'jwt', user: { role: 'CUSTOMER' } }),
    );
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState()).toMatchObject({
      token: 'jwt',
      hydrated: true,
    });
  });
  it('clears secure session on logout', async () => {
    useAuthStore.setState({ token: 'jwt' });
    await useAuthStore.getState().logout();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'com.smartride.session',
    );
    expect(useAuthStore.getState().token).toBeNull();
  });
});
