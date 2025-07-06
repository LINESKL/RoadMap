import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../config/api';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
  username: string;
  email: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCourses: 0, completedCourses: 0, averageProgress: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          router.replace('/(auth)/login');
          return;
        }

        // Получаем данные пользователя
        const profileResponse = await fetch(`${API_BASE_URL}/api/profile/`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (profileResponse.status === 401) {
          await AsyncStorage.removeItem('token');
          router.replace('/(auth)/login');
          return;
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser(profileData);
        }

        // Получаем статистику курсов
        const syllabusResponse = await fetch(`${API_BASE_URL}/api/user-syllabuses/`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (syllabusResponse.ok) {
          const syllabusData = await syllabusResponse.json();
          if (syllabusData && syllabusData.syllabuses) {
            const courses = syllabusData.syllabuses;
            const userProgress = syllabusData.user?.user_progress || [];
            
            const totalCourses = courses.length;
            const completedCourses = userProgress.filter((up: any) => up.progress === 100).length;
            const averageProgress = totalCourses > 0 
              ? Math.round(userProgress.reduce((acc: number, up: any) => acc + (up.progress || 0), 0) / totalCourses)
              : 0;

            setStats({ totalCourses, completedCourses, averageProgress });
          }
        }
      } catch (e) {
        console.log('Error fetching profile:', e);
        Alert.alert('Ошибка', 'Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Выйти из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['token', 'user']);
            global.token = null;
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5656D6" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
        <Text style={styles.errorTitle}>Ошибка загрузки</Text>
        <Text style={styles.errorText}>Не удалось загрузить данные профиля</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = [
    { 
      icon: 'create-outline', 
      title: 'Редактировать профиль', 
      subtitle: 'Изменить данные аккаунта',
      color: '#5656D6',
      onPress: () => router.push('/(main)/edit-profile')
    },
    { 
      icon: 'book-outline', 
      title: 'Мои курсы', 
      subtitle: `${stats.totalCourses} активных курсов`,
      color: '#5656D6',
      onPress: () => router.push('/(main)/my-courses')
    },
    { 
      icon: 'search-outline', 
      title: 'Найти курсы', 
      subtitle: 'Поиск новых материалов',
      color: '#10B981',
      onPress: () => router.push('/(main)/syllabus-search')
    },
    { 
      icon: 'settings-outline', 
      title: 'Настройки', 
      subtitle: 'Настройки приложения',
      color: '#F59E0B',
      onPress: () => router.push('/settings')
    },
    { 
      icon: 'help-circle-outline', 
      title: 'Помощь', 
      subtitle: 'FAQ и поддержка',
      color: '#8B5CF6',
      onPress: () => Alert.alert('Помощь', 'Свяжитесь с нами: support@roadmap.com')
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#5656D6', '#7B68EE']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.username}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="book-outline" size={32} color="#5656D6" />
            <Text style={styles.statNumber}>{stats.totalCourses}</Text>
            <Text style={styles.statLabel}>Курсов</Text>
          </View>
        </View>
        
        
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="trending-up-outline" size={32} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats.averageProgress}%</Text>
            <Text style={styles.statLabel}>Прогресс</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="checkmark-circle-outline" size={32} color="#10B981" />
            <Text style={styles.statNumber}>{stats.completedCourses}</Text>
            <Text style={styles.statLabel}>Окончено</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Меню</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#374151', marginTop: 24 },
  errorText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 12 },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  userInfo: { flex: 1 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  userEmail: { fontSize: 16, color: '#E8E8FF', marginTop: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: -20, marginBottom: 32 },
  statCard: { flex: 1, marginHorizontal: 6 },
  statContent: { alignItems: 'center', padding: 20, borderRadius: 16, backgroundColor: '#FFFFFF' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  menuContainer: { paddingHorizontal: 20, marginBottom: 32 },
  menuTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  menuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuContent: { flex: 1 },
  menuItemTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  menuItemSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  logoutContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FECACA' },
  logoutButtonText: { fontSize: 16, fontWeight: '600', color: '#EF4444', marginLeft: 8 },
});
