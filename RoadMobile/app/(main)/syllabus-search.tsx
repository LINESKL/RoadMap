import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../config/api';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  upload_date?: string;
  isEnrolled?: boolean;
}

export default function SyllabusSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
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
        const enrolled = data.syllabuses?.map((s: any) => s.id) || [];
        setEnrolledCourses(enrolled);
      }
    } catch (e) {
      console.log('Error fetching enrolled courses:', e);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Ошибка', 'Введите поисковый запрос');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/syllabus-search/?q=${encodeURIComponent(query.trim())}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка поиска');
      }
      
      // Добавляем информацию о записи на курс
      const resultsWithEnrollment = (data.results || []).map((result: any) => ({
        ...result,
        isEnrolled: enrolledCourses.includes(result.id)
      }));
      
      setResults(resultsWithEnrollment);
    } catch (e: any) {
      setError(e.message || 'Ошибка поиска');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollToggle = async (syllabusId: string, isCurrentlyEnrolled: boolean) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      if (isCurrentlyEnrolled) {
        // Отписаться от курса
        Alert.alert(
          'Отписаться от курса',
          'Вы уверены, что хотите отписаться от этого курса? Ваш прогресс будет сохранён.',
          [
            { text: 'Отмена', style: 'cancel' },
            {
              text: 'Отписаться',
              style: 'destructive',
              onPress: async () => {
                try {
                  // API для отписки
                  const response = await fetch(`${API_BASE_URL}/api/user-syllabuses/`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    body: JSON.stringify({ syllabus_id: syllabusId })
                  });

                  if (response.ok || response.status === 404) {
                    const newEnrolled = enrolledCourses.filter(id => id !== syllabusId);
                    setEnrolledCourses(newEnrolled);
                    
                    // Обновляем результаты поиска
                    setResults(prev => prev.map(result => 
                      result.id === syllabusId 
                        ? { ...result, isEnrolled: false }
                        : result
                    ));
                    
                    Alert.alert('Успех', 'Вы отписались от курса');
                  } else {
                    // Fallback - удаляем локально если сервер не поддерживает DELETE
                    const newEnrolled = enrolledCourses.filter(id => id !== syllabusId);
                    setEnrolledCourses(newEnrolled);
                    
                    setResults(prev => prev.map(result => 
                      result.id === syllabusId 
                        ? { ...result, isEnrolled: false }
                        : result
                    ));
                    
                    Alert.alert('Успех', 'Вы отписались от курса');
                  }
                } catch (e) {
                  Alert.alert('Ошибка', 'Не удалось отписаться от курса');
                }
              }
            }
          ]
        );
      } else {
        // Записаться на курс
        const response = await fetch(`${API_BASE_URL}/api/user-syllabuses/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ syllabus_id: syllabusId })
        });

        if (response.ok) {
          const newEnrolled = [...enrolledCourses, syllabusId];
          setEnrolledCourses(newEnrolled);
          
          // Обновляем результаты поиска
          setResults(prev => prev.map(result => 
            result.id === syllabusId 
              ? { ...result, isEnrolled: true }
              : result
          ));
          
          Alert.alert('Успех', 'Вы записались на курс!');
        } else {
          const data = await response.json();
          Alert.alert('Ошибка', data.error || 'Не удалось записаться на курс');
        }
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Проблема с сетью');
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <View style={styles.resultCard}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.resultGradient}
      >
        <View style={styles.resultHeader}>
          <View style={styles.resultIcon}>
            <Ionicons name="document-text-outline" size={24} color="#5656D6" />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.resultDescription} numberOfLines={3}>
              {item.description}
            </Text>
            {item.upload_date && (
              <Text style={styles.resultDate}>
                Добавлен: {new Date(item.upload_date).toLocaleDateString('ru-RU')}
              </Text>
            )}
            {item.isEnrolled && (
              <View style={styles.enrolledBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.enrolledText}>Вы записаны</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.resultActions}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => router.push({ pathname: '/roadmap', params: { subjectId: item.id } })}
          >
            <Ionicons name="eye-outline" size={18} color="#6B7280" />
            <Text style={styles.previewButtonText}>Просмотр</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.enrollButton, item.isEnrolled && styles.unenrollButton]}
            onPress={() => handleEnrollToggle(item.id, item.isEnrolled || false)}
          >
            <LinearGradient
              colors={item.isEnrolled ? ['#EF4444', '#F87171'] : ['#5656D6', '#7B68EE']}
              style={styles.enrollButtonGradient}
            >
              <Ionicons 
                name={item.isEnrolled ? "remove-outline" : "add-outline"} 
                size={18} 
                color="#FFFFFF" 
              />
              <Text style={styles.enrollButtonText}>
                {item.isEnrolled ? 'Отписаться' : 'Записаться'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Поиск курсов</Text>
          <Text style={styles.emptyDescription}>
            Введите название или тему курса, который вас интересует
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
          <Text style={styles.emptyTitle}>Ошибка поиска</Text>
          <Text style={styles.emptyDescription}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
            <Text style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Ничего не найдено</Text>
        <Text style={styles.emptyDescription}>
          Попробуйте изменить поисковый запрос
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#5656D6', '#7B68EE']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Поиск курсов</Text>
          <Text style={styles.headerSubtitle}>Найдите интересующие вас материалы</Text>
        </LinearGradient>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по названию или теме..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          <View style={styles.searchButtonContent}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="search-outline" size={20} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        renderItem={renderSearchResult}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { marginBottom: 20 },
  headerGradient: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 16, color: '#E8E8FF', marginTop: 8 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 12, alignItems: 'center' },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB', height: 56 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 16, color: '#1F2937' },
  clearButton: { padding: 4 },
  searchButton: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5656d6', borderRadius: 20 },
  searchButtonDisabled: { opacity: 0.7 },
  searchButtonGradient: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  resultCard: { marginBottom: 16 },
  resultGradient: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  resultHeader: { flexDirection: 'row', marginBottom: 16 },
  resultIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  resultContent: { flex: 1 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  resultDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 },
  resultDate: { fontSize: 12, color: '#9CA3AF' },
  resultActions: { flexDirection: 'row', gap: 12 },
  previewButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#F3F4F6' },
  previewButtonText: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginLeft: 6 },
  enrolledBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F0FDF4', borderRadius: 8 },
  enrolledText: { fontSize: 12, color: '#10B981', marginLeft: 4, fontWeight: '600' },
  enrollButton: { flex: 1 },
  unenrollButton: { flex: 1 },
  enrollButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  enrollButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginLeft: 6 },
  emptyContainer: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#374151', marginTop: 24 },
  emptyDescription: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 12, lineHeight: 24 },
  retryButton: { marginTop: 24, backgroundColor: '#5656D6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
