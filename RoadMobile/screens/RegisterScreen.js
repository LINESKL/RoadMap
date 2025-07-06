import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== password2) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Ошибка', data.detail || data.error || 'Ошибка регистрации');
      } else {
        Alert.alert('Успех', 'Регистрация прошла успешно!');
        router.replace('/login');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Повторите пароль"
        value={password2}
        onChangeText={setPassword2}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Зарегистрироваться</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/login')} style={styles.link}>
        <Text style={styles.linkText}>Уже есть аккаунт? Войти</Text>
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
