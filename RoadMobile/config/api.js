import { Platform } from 'react-native';

// IP-адрес вашего компьютера из ipconfig
const LOCAL_IP = '192.168.10.9';

export const API_BASE_URL = Platform.select({
  ios: `http://${LOCAL_IP}:8000`,
  android: 'http://10.0.2.2:8000', // Android эмулятор
  web: 'http://localhost:8000',
  default: 'http://localhost:8000'
});

console.log('API_BASE_URL:', API_BASE_URL);
