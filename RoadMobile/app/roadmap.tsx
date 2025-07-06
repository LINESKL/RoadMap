import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoadmapScreen from '../screens/RoadmapScreen';

export default function RoadmapScreenWrapper() {
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) router.replace('/(auth)/login');
    };
    checkAuth();
  }, [router]);
  
  return <RoadmapScreen />;
}
