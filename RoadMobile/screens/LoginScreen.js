import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        global.token = token;
        router.replace('/');
      }
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Ошибка', data.detail || data.error || 'Ошибка входа');
      } else {
        await AsyncStorage.setItem('token', data.token);
        global.token = data.token;
        router.replace('/');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Имя пользователя"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Войти</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')} style={styles.link}>
        <Text style={styles.linkText}>Нет аккаунта? Зарегистрируйтесь!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, color: '#5656D6' },
  input: { width: '100%', maxWidth: 320, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#5656D6', padding: 16, borderRadius: 8, width: '100%', maxWidth: 320, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { marginTop: 8 },
  linkText: { color: '#5656D6', fontSize: 16 },
});
