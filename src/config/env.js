import Constants from 'expo-constants';
import { Platform } from 'react-native';

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const host = process.env.EXPO_PUBLIC_API_HOST || expoHost || defaultHost;

export const env = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL || `http://${host}:8080/api/v1`,
  socketUrl:
    process.env.EXPO_PUBLIC_SOCKET_URL || `http://${host}:8080`,
};
