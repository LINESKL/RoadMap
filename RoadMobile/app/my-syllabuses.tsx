import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MySyllabusesScreen from '../screens/MySyllabusesScreen';

export default function MySyllabusesScreenWrapper() {
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) router.replace('/(auth)/login');
    };
    checkAuth();
  }, [router]);
  
  return <MySyllabusesScreen />;
}
