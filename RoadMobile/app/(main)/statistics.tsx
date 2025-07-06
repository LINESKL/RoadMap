import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '../../config/api';

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalTopics: 0,
    completedTopics: 0,
    averageProgress: 0,
    studyTime: 0, // в минутах
    streakDays: 0,
    weeklyProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/user-syllabuses/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const syllabuses = data.syllabuses || [];
        const userProgress = data.user?.user_progress || [];
        
        // Подсчитываем статистику
        const totalCourses = syllabuses.length;
        const completedCourses = userProgress.filter(up => up.progress === 100).length;
        
        let totalTopics = 0;
        let completedTopics = 0;
        let totalProgress = 0;
        
        syllabuses.forEach((syllabus: any) => {
          const topics = syllabus.roadmap?.subtopics?.length || 0;
          totalTopics += topics;
          
          const up = userProgress.find((up: any) => up.syllabus_id === syllabus.id);
          if (up) {
            completedTopics += up.completed_topics?.length || 0;
            totalProgress += up.progress || 0;
          }
        });
        
        const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
        
        // Симулируем дополнительную статистику
        const studyTime = Math.floor(Math.random() * 1000) + 100; // случайное время
        const streakDays = Math.floor(Math.random() * 30) + 1;
        
        setStats({
          totalCourses,
          completedCourses,
          totalTopics,
          completedTopics,
          averageProgress,
          studyTime,
          streakDays,
          weeklyProgress: generateWeeklyProgress()
        });
      }
    } catch (e) {
      console.log('Error fetching statistics:', e);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyProgress = () => {
    // Генерируем данные для последних 7 дней
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i],
      value: Math.floor(Math.random() * 100)
    }));
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5656D6" />
        <Text style={styles.loadingText}>Загрузка статистики...</Text>
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
          <Text style={styles.headerTitle}>Статистика</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Основная статистика */}
        <View style={styles.mainStats}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="library-outline" size={24} color="#5656D6" />
            </View>
            <Text style={styles.statNumber}>{stats.totalCourses}</Text>
            <Text style={styles.statLabel}>Курсов изучается</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>{stats.completedCourses}</Text>
            <Text style={styles.statLabel}>Курсов завершено</Text>
          </View>
        </View>

        <View style={styles.mainStats}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="document-text-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{stats.completedTopics}/{stats.totalTopics}</Text>
            <Text style={styles.statLabel}>Тем изучено</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="trending-up-outline" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statNumber}>{stats.averageProgress}%</Text>
            <Text style={styles.statLabel}>Средний прогресс</Text>
          </View>
        </View>

        {/* Время и достижения */}
        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>Достижения</Text>
          
          <View style={styles.achievementCard}>
            <View style={styles.achievementInfo}>
              <Ionicons name="time-outline" size={32} color="#5656D6" />
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Время обучения</Text>
                <Text style={styles.achievementValue}>{formatTime(stats.studyTime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.achievementCard}>
            <View style={styles.achievementInfo}>
              <Ionicons name="flame-outline" size={32} color="#FF6B35" />
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Streak дней подряд</Text>
                <Text style={styles.achievementValue}>{stats.streakDays} дней</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Прогресс за неделю */}
        <View style={styles.weeklySection}>
          <Text style={styles.sectionTitle}>Активность за неделю</Text>
          <View style={styles.chartContainer}>
            {stats.weeklyProgress.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { height: `${day.value}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.dayLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 20 },
  mainStats: { flexDirection: 'row', gap: 16, marginTop: 24 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statIcon: { marginBottom: 12 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  achievementSection: { marginTop: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  achievementCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  achievementInfo: { flexDirection: 'row', alignItems: 'center' },
  achievementText: { marginLeft: 16, flex: 1 },
  achievementTitle: { fontSize: 16, color: '#6B7280', marginBottom: 4 },
  achievementValue: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  weeklySection: { marginTop: 32, marginBottom: 40 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  dayColumn: { alignItems: 'center', flex: 1 },
  barContainer: { height: 100, width: 20, backgroundColor: '#F3F4F6', borderRadius: 10, justifyContent: 'flex-end', marginBottom: 8 },
  progressBar: { backgroundColor: '#41CB63', borderRadius: 10, width: '100%' },
  dayLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
});
