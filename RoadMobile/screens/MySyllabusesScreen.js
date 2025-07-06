import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function MySyllabusesScreen() {
  const [syllabuses, setSyllabuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSyllabuses = async () => {
      setLoading(true);
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
          setSyllabuses(data.syllabuses);
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchSyllabuses();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/roadmap', params: { subjectId: item.id } })}
      activeOpacity={0.85}
    >
      <Ionicons name="document-text-outline" size={28} color="#5656D6" style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.roadmap?.subject?.label}</Text>
        <Text style={styles.desc}>{item.roadmap?.subject?.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#5656D6" />
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#5656D6" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Мои силлабусы</Text>
      <FlatList
        data={syllabuses}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={<Text style={styles.empty}>Нет силлабусов</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#5656D6', marginBottom: 24, alignSelf: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, elevation: 3, shadowColor: '#5656D6', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 2 },
  desc: { fontSize: 15, color: '#4a5568' },
  empty: { color: '#4a5568', textAlign: 'center', marginTop: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
