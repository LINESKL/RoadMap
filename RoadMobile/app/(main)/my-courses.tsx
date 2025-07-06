import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../config/api';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
}

export default function MyCoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
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

      if (response.ok) {
        const data = await response.json();
        const userProgress = data.user?.user_progress || [];
        const coursesWithStats = data.syllabuses.map((s: any) => {
          const up = userProgress.find((up: any) => up.syllabus_id === s.id);
          const totalTopics = s.roadmap?.subtopics?.length || 0;
          const completedTopics = up?.completed_topics?.length || 0;
          
          return {
            id: s.id,
            title: s.roadmap.subject.label,
            description: s.roadmap.subject.description,
            progress: up?.progress || 0,
            totalTopics,
            completedTopics,
          };
        });
        setCourses(coursesWithStats);
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось загрузить курсы');
    } finally {
      setLoading(false);
    }
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => router.push({ pathname: '/roadmap', params: { subjectId: item.id } })}
    >
      <View style={styles.courseHeader}>
        <View style={styles.courseIcon}>
          <Ionicons name="library-outline" size={24} color="#5656D6" />
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{item.title}</Text>
          <Text style={styles.courseDescription} numberOfLines={2}>{item.description}</Text>
        </View>
      </View>
      
      <View style={styles.courseStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.completedTopics}</Text>
          <Text style={styles.statLabel}>из {item.totalTopics} тем</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.progress}%</Text>
          <Text style={styles.statLabel}>завершено</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
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
      <LinearGradient
        colors={['#5656D6', '#7B68EE']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Мои курсы</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/syllabus-search')} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  addButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  listContent: { padding: 20 },
  courseCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  courseHeader: { flexDirection: 'row', marginBottom: 16 },
  courseIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  courseDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  courseStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  progressContainer: { marginTop: 8 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#41CB63', borderRadius: 4 },
});
