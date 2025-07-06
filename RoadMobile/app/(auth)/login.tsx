import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../config/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) router.replace('/');
    };
    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login/`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password })
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('Login response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        Alert.alert('Ошибка', `Сервер вернул некорректный ответ. Статус: ${response.status}`);
        return;
      }
      
      if (!response.ok) {
        Alert.alert('Ошибка входа', data.error || 'Неверный логин или пароль');
      } else {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        global.token = data.token;
        router.replace('/(main)');
      }
    } catch (e) {
      console.error('Login error:', e);
      Alert.alert('Ошибка сети', `Не удается подключиться к серверу`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5656D6" />
      
      <LinearGradient
        colors={['#5656D6', '#7B68EE', '#9370DB']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="school-outline" size={80} color="#FFFFFF" />
          <Text style={styles.headerTitle}>RoadMap</Text>
          <Text style={styles.headerSubtitle}>Персональные учебные маршруты</Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Добро пожаловать!</Text>
          <Text style={styles.welcomeSubtitle}>Войдите в свой аккаунт</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={24} color="#5656D6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Имя пользователя"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={24} color="#5656D6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#D1D5DB', '#D1D5DB'] : ['#5656D6', '#7B68EE']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Войти</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Нет аккаунта?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>Зарегистрироваться</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flex: 0.4, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  headerSubtitle: { fontSize: 16, color: '#E8E8FF', marginTop: 8, textAlign: 'center' },
  formContainer: { flex: 0.6, paddingHorizontal: 24, paddingTop: 32 },
  welcomeSection: { marginBottom: 32 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  welcomeSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  inputContainer: { marginBottom: 24 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, marginBottom: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 16, color: '#1F2937' },
  eyeIcon: { padding: 4 },
  loginButton: { marginBottom: 24 },
  loginButtonDisabled: { opacity: 0.7 },
  buttonGradient: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  loginButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  registerSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 16, color: '#6B7280' },
  registerLink: { fontSize: 16, fontWeight: 'bold', color: '#5656D6', marginLeft: 8 },
});
