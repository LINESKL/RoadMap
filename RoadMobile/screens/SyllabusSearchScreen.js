import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function SyllabusSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/syllabus-search/?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Ошибка поиска');
      setResults(data.results || []);
    } catch (e) {
      setError(e.message || 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.85}>
      <View style={styles.resultHeader}>
        <View style={styles.resultIcon}>
          <Ionicons name="document-text-outline" size={20} color="#5656D6" />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.resultDesc} numberOfLines={3}>{item.description}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add-outline" size={20} color="#5656D6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#5656D6" />
        </TouchableOpacity>
        <Text style={styles.title}>Поиск курсов</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Найти курсы..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              placeholderTextColor="#8E8E93"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Найти</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>Ошибка поиска</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleSearch}>
            <Text style={styles.retryText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            !loading && query.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#E5E5EA" />
                <Text style={styles.emptyTitle}>Ничего не найдено</Text>
                <Text style={styles.emptyDesc}>Попробуйте изменить поисковый запрос</Text>
              </View>
            ) : !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="library-outline" size={64} color="#E5E5EA" />
                <Text style={styles.emptyTitle}>Начните поиск</Text>
                <Text style={styles.emptyDesc}>Введите название курса или тему для поиска</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backBtn: { padding: 8, borderRadius: 20, backgroundColor: '#F2F2F7' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1D1D1F' },
  searchContainer: { backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  searchRow: { flexDirection: 'row', gap: 12 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#1D1D1F' },
  clearBtn: { padding: 4 },
  searchBtn: { backgroundColor: '#5656D6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', minWidth: 80 },
  searchBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  listContainer: { padding: 16, paddingBottom: 100 },
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  resultIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  resultContent: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D1D1F', marginBottom: 4 },
  resultDesc: { fontSize: 14, color: '#8E8E93', lineHeight: 20 },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D1D1F', marginTop: 16 },
  errorText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 8 },
  retryBtn: { backgroundColor: '#5656D6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 20 },
  retryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D1D1F', marginTop: 16 },
  emptyDesc: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 8, marginHorizontal: 32 },
});
