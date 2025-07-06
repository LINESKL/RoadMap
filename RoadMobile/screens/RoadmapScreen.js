import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../config/api';

export default function RoadmapScreen() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [userProgress, setUserProgress] = useState(0);

  useEffect(() => {
    if (!subjectId) {
      setError('Не выбран предмет (subjectId отсутствует)');
      setLoading(false);
      return;
    }
    const fetchRoadmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/roadmap/${subjectId}/`, {
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Роадмап не найден');
        }

        const data = await response.json();
        if (!data.roadmap) throw new Error('Нет данных roadmap');
        setRoadmap(data.roadmap);
        if (data.roadmap.weeks && data.roadmap.weeks.length) {
          setSelectedWeek(data.roadmap.weeks[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchUserProgress = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/user-syllabuses/`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        
        const data = await response.json();
        if (data && data.syllabuses) {
          const syllabus = data.syllabuses.find(s => String(s.id) === String(subjectId));
          if (syllabus && syllabus.user_progress) {
            setCompletedTopics(syllabus.user_progress.completed_topics || []);
            setUserProgress(syllabus.user_progress.progress || 0);
          } else {
            const user = data.user;
            if (user && user.user_progress) {
              const up = user.user_progress.find(up => String(up.syllabus_id) === String(subjectId));
              setCompletedTopics(up?.completed_topics || []);
              setUserProgress(up?.progress || 0);
            }
          }
        }
      } catch (e) {
        // silent
      }
    };
    fetchRoadmap();
    fetchUserProgress();
  }, [subjectId]);

  const getTopicsForWeek = (weekId) => {
    if (!roadmap?.subtopics) return [];
    return roadmap.subtopics.filter(topic => topic.week_id === weekId);
  };

  const isTopicCompleted = (topicId) => completedTopics.includes(topicId);

  const handleTopicComplete = async (topicId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const newCompletedTopics = [...completedTopics, topicId];
      setCompletedTopics(newCompletedTopics);
      
      // Обновляем прогресс на сервере
      await fetch(`${API_BASE_URL}/api/user-syllabuses/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          syllabus_id: subjectId,
          completed_topics: newCompletedTopics
        })
      });

      // Пересчитываем прогресс
      const totalTopics = roadmap?.subtopics?.length || 1;
      const newProgress = Math.round((newCompletedTopics.length / totalTopics) * 100);
      setUserProgress(newProgress);
      
      Alert.alert('Успех!', 'Тема отмечена как завершённая');
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось обновить прогресс');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5656D6" />
        <Text style={styles.loadingText}>Загрузка роадмапа...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
        <Text style={styles.errorTitle}>Ошибка загрузки</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!roadmap) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-outline" size={80} color="#D1D5DB" />
        <Text style={styles.errorTitle}>Курс не найден</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#5656D6', '#7B68EE']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{roadmap.subject?.label}</Text>
          <Text style={styles.courseDescription}>{roadmap.subject?.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Прогресс изучения</Text>
              <Text style={styles.progressValue}>{userProgress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${userProgress}%` }]} />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Weeks Navigation */}
      <View style={styles.weeksContainer}>
        <Text style={styles.sectionTitle}>Недели курса</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weeksScroll}>
          {roadmap.weeks?.map((week, index) => (
            <TouchableOpacity
              key={week.id}
              style={[
                styles.weekCard,
                selectedWeek?.id === week.id && styles.weekCardActive
              ]}
              onPress={() => {
                setSelectedWeek(week);
                setSelectedTopic(null);
              }}
            >
              <View style={styles.weekNumber}>
                <Text style={styles.weekNumberText}>{week.week_number}</Text>
              </View>
              <Text style={styles.weekTitle} numberOfLines={2}>{week.main_topic}</Text>
              <Text style={styles.weekDescription} numberOfLines={3}>{week.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Topics */}
      {selectedWeek && (
        <View style={styles.topicsContainer}>
          <Text style={styles.sectionTitle}>
            Темы недели {selectedWeek.week_number}
          </Text>
          <View style={styles.topicsList}>
            {getTopicsForWeek(selectedWeek.id).map(topic => (
              <TouchableOpacity
                key={topic.id}
                style={[
                  styles.topicCard,
                  isTopicCompleted(topic.id) && styles.topicCardCompleted,
                  selectedTopic?.id === topic.id && styles.topicCardSelected
                ]}
                onPress={() => setSelectedTopic(topic)}
              >
                <View style={styles.topicHeader}>
                  <View style={[
                    styles.topicIcon,
                    isTopicCompleted(topic.id) && styles.topicIconCompleted
                  ]}>
                    <Ionicons 
                      name={isTopicCompleted(topic.id) ? "checkmark" : "document-text-outline"} 
                      size={20} 
                      color={isTopicCompleted(topic.id) ? "#FFFFFF" : "#5656D6"} 
                    />
                  </View>
                  <View style={styles.topicContent}>
                    <Text style={styles.topicTitle}>{topic.label}</Text>
                    <Text style={styles.topicDescription} numberOfLines={2}>
                      {topic.description}
                    </Text>
                  </View>
                  {isTopicCompleted(topic.id) && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Topic Details */}
      {selectedTopic && (
        <View style={styles.topicDetailsContainer}>
          <View style={styles.topicDetails}>
            <Text style={styles.topicDetailsTitle}>{selectedTopic.label}</Text>
            <Text style={styles.topicDetailsDescription}>{selectedTopic.description}</Text>
            
            {selectedTopic.material && (
              <View style={styles.materialSection}>
                <Text style={styles.materialTitle}>📚 Материалы для изучения</Text>
                <TouchableOpacity style={styles.materialLink}>
                  <Ionicons name="link-outline" size={20} color="#5656D6" />
                  <Text style={styles.materialText}>Открыть материалы</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedTopic.assignment && (
              <View style={styles.assignmentSection}>
                <Text style={styles.assignmentTitle}>📝 Задание</Text>
                <Text style={styles.assignmentText}>{selectedTopic.assignment}</Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              {!isTopicCompleted(selectedTopic.id) ? (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleTopicComplete(selectedTopic.id)}
                >
                  <LinearGradient
                    colors={['#10B981', '#34D399']}
                    style={styles.completeButtonGradient}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.completeButtonText}>Отметить как завершённое</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.completedStatus}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.completedStatusText}>Тема завершена</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
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
  header: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  courseInfo: { alignItems: 'center' },
  courseTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  courseDescription: { fontSize: 16, color: '#E8E8FF', textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  progressContainer: { width: '100%' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 16, color: '#E8E8FF' },
  progressValue: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  progressBarContainer: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: 8, backgroundColor: '#41CB63', borderRadius: 4 },
  weeksContainer: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  weeksScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  weekCard: { width: 200, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginRight: 16, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  weekCardActive: { borderColor: '#5656D6', backgroundColor: '#EEF2FF' },
  weekNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#5656D6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  weekNumberText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  weekTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  weekDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  topicsContainer: { paddingHorizontal: 20, paddingBottom: 24 },
  topicsList: { gap: 12 },
  topicCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  topicCardCompleted: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  topicCardSelected: { borderColor: '#5656D6', backgroundColor: '#EEF2FF' },
  topicHeader: { flexDirection: 'row', alignItems: 'center' },
  topicIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  topicIconCompleted: { backgroundColor: '#10B981' },
  topicContent: { flex: 1 },
  topicTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  topicDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  completedBadge: { marginLeft: 8 },
  topicDetailsContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  topicDetails: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  topicDetailsTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  topicDetailsDescription: { fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 20 },
  materialSection: { marginBottom: 20 },
  materialTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  materialLink: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#EEF2FF', borderRadius: 12 },
  materialText: { fontSize: 14, color: '#5656D6', marginLeft: 8, fontWeight: '600' },
  assignmentSection: { marginBottom: 20 },
  assignmentTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  assignmentText: { fontSize: 14, color: '#6B7280', lineHeight: 22, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12 },
  actionButtons: { alignItems: 'center' },
  completeButton: { width: '100%' },
  completeButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16 },
  completeButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 8 },
  completedStatus: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  completedStatusText: { fontSize: 16, fontWeight: 'bold', color: '#10B981', marginLeft: 8 },
  backButton: { backgroundColor: '#5656D6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  backButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});
