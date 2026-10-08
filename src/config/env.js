import { Platform } from 'react-native';
const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const env = {
  apiUrl: `http://${host}:8080/api/v1`,
  socketUrl: `http://${host}:8080`,
};
