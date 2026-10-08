jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));
import * as Keychain from 'react-native-keychain';
import { useAuthStore } from '../store/authStore';
describe('auth store', () => {
  beforeEach(() =>
    useAuthStore.setState({ token: null, user: null, hydrated: false }),
  );
  it('hydrates a saved session', async () => {
    Keychain.getGenericPassword.mockResolvedValue({
      password: JSON.stringify({ token: 'jwt', user: { role: 'CUSTOMER' } }),
    });
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState()).toMatchObject({
      token: 'jwt',
      hydrated: true,
    });
  });
  it('clears secure session on logout', async () => {
    useAuthStore.setState({ token: 'jwt' });
    await useAuthStore.getState().logout();
    expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
