import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

interface DownloadItem {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'document';
  size: string;
  downloadDate: string;
  filePath?: string;
}

export default function DownloadsScreen() {
  const router = useRouter();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const savedDownloads = await AsyncStorage.getItem('downloads');
      if (savedDownloads) {
        setDownloads(JSON.parse(savedDownloads));
      } else {
        // Демо данные
        const demoDownloads: DownloadItem[] = [
          {
            id: '1',
            title: 'Основы программирования.pdf',
            type: 'pdf',
            size: '2.5 МБ',
            downloadDate: '2025-01-15',
          },
          {
            id: '2',
            title: 'Введение в JavaScript',
            type: 'video',
            size: '15.2 МБ',
            downloadDate: '2025-01-14',
          },
          {
            id: '3',
            title: 'Алгоритмы и структуры данных.docx',
            type: 'document',
            size: '1.8 МБ',
            downloadDate: '2025-01-13',
          },
        ];
        setDownloads(demoDownloads);
        await AsyncStorage.setItem('downloads', JSON.stringify(demoDownloads));
      }
    } catch (e) {
      console.log('Error loading downloads:', e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'document-text-outline';
      case 'video': return 'play-circle-outline';
      case 'document': return 'document-outline';
      default: return 'download-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'pdf': return '#EF4444';
      case 'video': return '#8B5CF6';
      case 'document': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const openFile = (item: DownloadItem) => {
    Alert.alert(
      'Открыть файл',
      `Открыть "${item.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Открыть', onPress: () => {
          // Здесь будет логика открытия файла
          Alert.alert('Файл открыт', `Открываем: ${item.title}`);
        }}
      ]
    );
  };

  const deleteFile = async (item: DownloadItem) => {
    Alert.alert(
      'Удалить файл',
      `Удалить "${item.title}" из загрузок?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              const newDownloads = downloads.filter(d => d.id !== item.id);
              setDownloads(newDownloads);
              await AsyncStorage.setItem('downloads', JSON.stringify(newDownloads));
              
              // Удаляем файл с устройства если есть путь
              if (item.filePath) {
                await FileSystem.deleteAsync(item.filePath, { idempotent: true });
              }
            } catch (e) {
              Alert.alert('Ошибка', 'Не удалось удалить файл');
            }
          }
        }
      ]
    );
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => (
    <TouchableOpacity style={styles.downloadItem} onPress={() => openFile(item)}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(item.type)}15` }]}>
          <Ionicons name={getIcon(item.type) as any} size={24} color={getIconColor(item.type)} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.itemDetails}>{item.size} • {new Date(item.downloadDate).toLocaleDateString('ru-RU')}</Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => deleteFile(item)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Загрузки</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {downloads.length > 0 ? (
          <FlatList
            data={downloads}
            renderItem={renderDownloadItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="download-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Нет загрузок</Text>
            <Text style={styles.emptyText}>Загруженные материалы будут отображаться здесь</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  downloadItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  itemDetails: { fontSize: 14, color: '#6B7280' },
  deleteButton: { padding: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#374151', marginTop: 24 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 12 },
});
