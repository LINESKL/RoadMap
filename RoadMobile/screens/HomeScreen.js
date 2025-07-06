import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

function TruncatedText({ text, maxLines = 2 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  return (
    <View>
      <Text
        style={styles.subjectDescription}
        numberOfLines={expanded ? undefined : maxLines}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
      {text.length > 80 && !expanded && (
        <TouchableOpacity onPress={() => setExpanded(true)} style={styles.showMoreBtn}>
          <Text style={styles.showMore}>Показать больше</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchSubjects = async () => {
    try {
      let token = global.token;
      if (!token) {
        token = await AsyncStorage.getItem('token');
        global.token = token;
      }
      if (!token) return;
      const response = await fetch('http://localhost:8000/api/user-syllabuses/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data && data.syllabuses) {
        const user = data.user || {};
        const userProgressArr = user.user_progress || [];
        setSubjects(data.syllabuses.map(s => {
          const up = userProgressArr.find(up => up.syllabus_id === s.id);
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
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
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

  const renderQuickAction = (icon, title, onPress, color = '#5656D6') => (
    <TouchableOpacity style={[styles.quickAction, { borderColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/roadmap', params: { subjectId: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="book-outline" size={22} color="#5656D6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.subjectTitle}>{item.title}</Text>
          <TruncatedText text={item.description} maxLines={2} />
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.linkText}>Продолжить изучение</Text>
        <Ionicons name="chevron-forward" size={16} color="#5656D6" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5656D6" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Мои курсы</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn}>
              <Ionicons name="settings-outline" size={20} color="#5656D6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.headerBtn}>
              <Ionicons name="person-circle-outline" size={24} color="#5656D6" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.quickActions}>
          {renderQuickAction('search-outline', 'Поиск', () => router.push('/(main)/syllabus-search'))}
          {renderQuickAction('library-outline', 'Мои курсы', () => router.push('/my-syllabuses'), '#FF6B6B')}
          {renderQuickAction('stats-chart-outline', 'Статистика', () => {}, '#4ECDC4')}
        </View>
      </View>

      <FlatList
        data={subjects}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5656D6']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#E5E5EA" />
            <Text style={styles.emptyTitle}>Пока нет курсов</Text>
            <Text style={styles.emptyDesc}>Найдите интересующий вас курс в разделе поиска</Text>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => router.push('/(main)/syllabus-search')}
            >
              <Text style={styles.searchButtonText}>Найти курсы</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#FFFFFF', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1D1D1F' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 8, borderRadius: 20, backgroundColor: '#F2F2F7' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  quickAction: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, backgroundColor: '#FFFFFF' },
  quickActionText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  listContainer: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  subjectTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D1D1F', marginBottom: 4 },
  subjectDescription: { fontSize: 13, color: '#8E8E93', lineHeight: 18 },
  showMoreBtn: { marginTop: 4 },
  showMore: { color: '#5656D6', fontSize: 12, fontWeight: '600' },
  progressContainer: { alignItems: 'flex-end' },
  progressText: { fontSize: 14, color: '#5656D6', fontWeight: 'bold' },
  progressBarContainer: { height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, overflow: 'hidden', marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: '#5656D6', borderRadius: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkText: { color: '#5656D6', fontSize: 14, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#8E8E93' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D1D1F', marginTop: 16 },
  emptyDesc: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 8, marginHorizontal: 32 },
  searchButton: { backgroundColor: '#5656D6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 20 },
  searchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
