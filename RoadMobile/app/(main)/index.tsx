import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../config/api';

interface Subject {
  id: string;
  title: string;
  description: string;
  progress: number;
}

export default function HomeScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.username || 'Пользователь');
      }
    } catch (e) {
      console.log('Error fetching user data:', e);
    }
  };

  const fetchSubjects = async () => {
    try {
      let token = global.token;
      if (!token) {
        token = await AsyncStorage.getItem('token');
        global.token = token;
      }
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user-syllabuses/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        router.replace('/(auth)/login');
        return;
      }

      const data = await response.json();
      if (data && data.syllabuses) {
        const user = data.user || {};
        const userProgressArr = user.user_progress || [];
        setSubjects(data.syllabuses.map((s: any) => {
          const up = userProgressArr.find((up: any) => up.syllabus_id === s.id);
          return {
            id: s.id,
            title: s.roadmap.subject.label,
            description: s.roadmap.subject.description,
            progress: up ? up.progress || 0 : 0
          };
        }));
      }
    } catch (e) {
      console.log('Error fetching subjects:', e);
      Alert.alert('Ошибка', 'Не удалось загрузить курсы');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUserData();
      await fetchSubjects();
      setLoading(false);
    };
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubjects();
    setRefreshing(false);
  };

  const getProgressColor = (progress: number) => {
    return ['#41CB63', '#81DC98']; // Зеленый градиент
  };

  const renderSubject = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={styles.subjectCard}
      onPress={() => router.push({ pathname: '/roadmap', params: { subjectId: item.id } })}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="library-outline" size={24} color="#5656D6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.subjectTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.subjectDescription} numberOfLines={3}>{item.description}</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Прогресс</Text>
            <Text style={styles.progressValue}>{item.progress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={getProgressColor(item.progress)}
              style={[styles.progressBar, { width: `${item.progress}%` }]}
            />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.continueText}>Продолжить изучение</Text>
          <Ionicons name="arrow-forward" size={20} color="#5656D6" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#5656D6', '#7B68EE']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="school-outline" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>Привет, {userName}! 👋</Text>
              <Text style={styles.greetingSubtext}>Продолжай изучать новое</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(main)/profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="book-outline" size={32} color="#5656D6" />
            <Text style={styles.statNumber}>{subjects.length}</Text>
            <Text style={styles.statLabel}>Курсов</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="trending-up-outline" size={32} color="#F59E0B" />
            <Text style={styles.statNumber}>
              {subjects.length > 0 ? Math.round(subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length) : 0}%
            </Text>
            <Text style={styles.statLabel}>Прогресс</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="checkmark-circle-outline" size={32} color="#10B981" />
            <Text style={styles.statNumber}>{subjects.filter(s => s.progress === 100).length}</Text>
            <Text style={styles.statLabel}>Окончено</Text>
          </View>
        </View>
      </View>

      {/* Быстрые действия */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Быстрые действия</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/(main)/statistics')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF2D9215' }]}>
              <Ionicons name="stats-chart-outline" size={24} color="#FF2D92" />
            </View>
            <Text style={styles.quickActionText}>Статистика</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/(main)/downloads')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#007AFF15' }]}>
              <Ionicons name="download-outline" size={24} color="#007AFF" />
            </View>
            <Text style={styles.quickActionText}>Загрузки</Text>
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/settings')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF950015' }]}>
              <Ionicons name="settings-outline" size={24} color="#FF9500" />
            </View>
            <Text style={styles.quickActionText}>Настройки</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Мои курсы</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Пока нет курсов</Text>
      <Text style={styles.emptyDescription}>
        Найдите интересные курсы в разделе поиска
      </Text>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => router.push('/(main)/syllabus-search')}
      >
        <LinearGradient
          colors={['#5656D6', '#7B68EE']}
          style={styles.searchButtonGradient}
        >
          <Ionicons name="search-outline" size={20} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>Найти курсы</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5656D6" />
        <Text style={styles.loadingText}>Загрузка курсов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#5656D6']}
            tintColor="#5656D6"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  headerContainer: { marginBottom: 24 },
  headerGradient: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  greetingSection: { flex: 1 },
  greetingText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  greetingSubtext: { fontSize: 14, color: '#E8E8FF', marginTop: 4 },
  profileButton: { padding: 8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: -20, marginBottom: 24 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, minWidth: 80, flex: 1, marginHorizontal: 6 },
  statContent: { alignItems: 'center', padding: 20 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', paddingHorizontal: 20, marginBottom: 16 },
  listContent: { paddingBottom: 100 },
  subjectCard: { marginHorizontal: 20, marginBottom: 16 },
  cardGradient: { borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  cardHeader: { flexDirection: 'row', marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  subjectTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  subjectDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  progressSection: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#6B7280' },
  progressValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  progressBarContainer: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: 8, borderRadius: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  continueText: { fontSize: 16, fontWeight: '600', color: '#5656D6' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#374151', marginTop: 24 },
  emptyDescription: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 12, lineHeight: 24 },
  searchButton: { marginTop: 32 },
  searchButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 },
  searchButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 8 },
  quickActionsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  quickActionsTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '47%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  quickActionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  quickActionText: { fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
});

