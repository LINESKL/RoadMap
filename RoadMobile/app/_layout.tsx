import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsAuthenticated(!!token);
        if (token) {
          global.token = token;
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(main)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5656D6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
      <Stack.Screen name="roadmap" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="my-syllabuses" options={{ headerShown: false }} />
    </Stack>
  );
}
