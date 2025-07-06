import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../config/api';

interface UserProfile {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setProfile({
          username: user.username || '',
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          bio: user.bio || '',
          phone: user.phone || '',
        });
      }
    } catch (e) {
      console.log('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
  };

  const saveProfile = async () => {
    if (!profile.username.trim()) {
      Alert.alert('Ошибка', 'Имя пользователя обязательно');
      return;
    }

    if (!profile.email.trim()) {
      Alert.alert('Ошибка', 'Email обязателен');
      return;
    }

    if (!validateEmail(profile.email)) {
      Alert.alert('Ошибка', 'Некорректный email');
      return;
    }

    if (profile.phone && !validatePhone(profile.phone)) {
      Alert.alert('Ошибка', 'Некорректный номер телефона');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert('Успех', 'Профиль обновлен', [
          { text: 'ОК', onPress: () => router.back() }
        ]);
      } else {
        const error = await response.json();
        Alert.alert('Ошибка', error.message || 'Не удалось обновить профиль');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Проблема с сетью');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5656D6" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#5656D6', '#7B68EE']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Редактировать профиль</Text>
          <TouchableOpacity onPress={saveProfile} disabled={saving} style={styles.saveButton}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <TouchableOpacity style={styles.changeAvatarButton}>
            <Text style={styles.changeAvatarText}>Изменить фото</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Имя пользователя *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.username}
                onChangeText={(value) => updateField('username', value)}
                placeholder="Введите имя пользователя"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="Введите email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Имя</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                placeholder="Введите имя"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Фамилия</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(value) => updateField('lastName', value)}
                placeholder="Введите фамилию"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Телефон</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="+7 (xxx) xxx-xx-xx"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>О себе</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.bio}
                onChangeText={(value) => updateField('bio', value)}
                placeholder="Расскажите о себе..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.saveMainButton, saving && styles.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? ['#D1D5DB', '#D1D5DB'] : ['#5656D6', '#7B68EE']}
              style={styles.saveButtonGradient}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Сохранить изменения</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  saveButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', marginTop: -30, marginBottom: 32 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#5656D6', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 4, borderColor: '#FFFFFF' },
  changeAvatarButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(86, 86, 214, 0.1)', borderRadius: 16 },
  changeAvatarText: { fontSize: 14, color: '#5656D6', fontWeight: '600' },
  formSection: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  textAreaContainer: { alignItems: 'flex-start', paddingVertical: 12 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 16, color: '#1F2937' },
  textArea: { minHeight: 80, paddingVertical: 8 },
  buttonSection: { marginBottom: 40 },
  saveMainButton: { marginBottom: 16 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 8 },
  cancelButton: { alignItems: 'center', paddingVertical: 16 },
  cancelButtonText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
