import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../config/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          email: email.trim(), 
          password 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        Alert.alert('Ошибка регистрации', data.error || 'Произошла ошибка при регистрации');
      } else {
        Alert.alert(
          'Успех!', 
          'Регистрация прошла успешно. Теперь вы можете войти в свой аккаунт.',
          [{ text: 'ОК', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (e) {
      console.error('Registration error:', e);
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Ionicons name="person-add-outline" size={64} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Регистрация</Text>
          <Text style={styles.headerSubtitle}>Создайте свой аккаунт</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
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
            <Ionicons name="mail-outline" size={24} color="#5656D6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={24} color="#5656D6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Пароль (минимум 6 символов)"
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

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={24} color="#5656D6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Подтвердите пароль"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
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
              <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Уже есть аккаунт?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Войти</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flex: 0.35, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, position: 'relative' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 1, padding: 8 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  headerSubtitle: { fontSize: 16, color: '#E8E8FF', marginTop: 8 },
  formContainer: { flex: 0.65, paddingHorizontal: 24, paddingTop: 24 },
  inputContainer: { marginBottom: 24 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, marginBottom: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 16, color: '#1F2937' },
  eyeIcon: { padding: 4 },
  registerButton: { marginBottom: 24 },
  registerButtonDisabled: { opacity: 0.7 },
  buttonGradient: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  registerButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  loginSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  loginText: { fontSize: 16, color: '#6B7280' },
  loginLink: { fontSize: 16, fontWeight: 'bold', color: '#5656D6', marginLeft: 8 },
});