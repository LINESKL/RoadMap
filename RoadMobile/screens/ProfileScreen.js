import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Нет токена');
        const response = await fetch('http://localhost:8000/api/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Ошибка профиля');
        setUser(data);
      } catch (e) {
        Alert.alert('Ошибка', e.message || 'Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#5656D6" /></View>;
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Не удалось загрузить профиль</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="person-circle-outline" size={72} color="#5656D6" style={{ alignSelf: 'center', marginBottom: 12 }} />
        <Text style={styles.title}>Профиль</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#5656D6" style={{ marginRight: 8 }} />
          <Text style={styles.label}>Имя пользователя:</Text>
        </View>
        <Text style={styles.value}>{user.username}</Text>
        {/* Добавьте другие поля профиля по необходимости */}
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 350, alignItems: 'center', elevation: 4, shadowColor: '#5656D6', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  title: { fontSize: 26, fontWeight: 'bold', color: '#5656D6', marginBottom: 18 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  label: { fontSize: 16, color: '#4a5568' },
  value: { fontSize: 18, color: '#2d3748', marginBottom: 12, fontWeight: 'bold' },
  button: { backgroundColor: '#5656D6', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
