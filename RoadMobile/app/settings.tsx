import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Appearance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: true,
    darkTheme: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    checkNotificationPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        
        // Применяем темную тему если включена
        if (parsed.darkTheme) {
          Appearance.setColorScheme('dark');
        } else {
          Appearance.setColorScheme('light');
        }
      }
    } catch (e) {
      console.log('Error loading settings:', e);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (e) {
      console.log('Error saving settings:', e);
    }
  };

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      setSettings(prev => ({ ...prev, notifications: false }));
    }
  };

  const toggleNotifications = async () => {
    setLoading(true);
    
    if (!settings.notifications) {
      // Включаем уведомления
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const newSettings = { ...settings, notifications: true };
        saveSettings(newSettings);
        
        // Настройка уведомлений
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
        
        Alert.alert('Успех!', 'Уведомления включены');
      } else {
        Alert.alert('Ошибка', 'Разрешение на уведомления не предоставлено');
      }
    } else {
      // Выключаем уведомления
      const newSettings = { ...settings, notifications: false };
      saveSettings(newSettings);
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('Уведомления отключены', 'Все запланированные уведомления отменены');
    }
    
    setLoading(false);
  };

  const toggleDarkTheme = async () => {
    const newSettings = { ...settings, darkTheme: !settings.darkTheme };
    saveSettings(newSettings);
    
    // Применяем тему
    if (newSettings.darkTheme) {
      Appearance.setColorScheme('dark');
      Alert.alert('Темная тема', 'Темная тема включена. Перезапустите приложение для полного применения.');
    } else {
      Appearance.setColorScheme('light');
      Alert.alert('Светлая тема', 'Светлая тема включена. Перезапустите приложение для полного применения.');
    }
  };

  const settingsItems = [
    {
      section: 'ОСНОВНЫЕ',
      items: [
        {
          icon: 'person-outline',
          iconColor: '#5656D6',
          title: 'Профиль',
          subtitle: 'Управление аккаунтом',
          onPress: () => router.push('/(main)/profile'),
          showArrow: true,
        },
        {
          icon: 'notifications-outline',
          iconColor: '#FF9500',
          title: 'Уведомления',
          subtitle: settings.notifications ? 'Включены' : 'Отключены',
          showSwitch: true,
          switchValue: settings.notifications,
          onSwitchToggle: toggleNotifications,
          disabled: loading,
        },
        {
          icon: 'moon-outline',
          iconColor: '#5E5CE6',
          title: 'Темная тема',
          subtitle: settings.darkTheme ? 'Включена' : 'Отключена',
          showSwitch: true,
          switchValue: settings.darkTheme,
          onSwitchToggle: toggleDarkTheme,
        },
      ]
    },
    {
      section: 'ПОДДЕРЖКА',
      items: [
        {
          icon: 'help-circle-outline',
          iconColor: '#FF9500',
          title: 'Помощь',
          subtitle: 'FAQ и поддержка',
          onPress: () => showHelp(),
          showArrow: true,
        },
        {
          icon: 'information-circle-outline',
          iconColor: '#5E5CE6',
          title: 'О приложении',
          subtitle: 'Версия 1.0.0',
          onPress: () => showAbout(),
          showArrow: true,
        },
      ]
    }
  ];

  const showStatistics = () => {
    router.push('/(main)/statistics');
  };

  const showDownloads = () => {
    router.push('/(main)/downloads');
  };

  const showHelp = () => {
    Alert.alert(
      'Помощь',
      'Если у вас возникли вопросы:\n\n• Проверьте раздел FAQ\n• Свяжитесь с поддержкой: support@roadmap.com\n• Telegram: @roadmap_support',
      [{ text: 'ОК' }]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'О приложении RoadMap',
      'Версия: 1.0.0\nДата выпуска: Июль 2025\n\nRoadMap - это персональные учебные маршруты для эффективного обучения.\n\n© 2025 RoadMap Team',
      [{ text: 'ОК' }]
    );
  };

  const renderSettingsItem = (item: any, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      style={[styles.settingsItem, isLast && styles.lastItem]}
      onPress={item.onPress}
      disabled={!item.onPress || item.disabled}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
          <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      <View style={styles.itemRight}>
        {item.showSwitch && (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchToggle}
            trackColor={{ false: '#E5E7EB', true: '#34C759' }}
            thumbColor="#FFFFFF"
            disabled={item.disabled}
          />
        )}
        {item.showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        )}
      </View>
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
          <Text style={styles.headerTitle}>Настройки</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionItems}>
              {section.items.map((item, itemIndex) => 
                renderSettingsItem(item, itemIndex, itemIndex === section.items.length - 1)
              )}
            </View>
          </View>
        ))}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 12, marginLeft: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
  sectionItems: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  lastItem: { borderBottomWidth: 0 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  itemSubtitle: { fontSize: 14, color: '#6B7280' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  bottomPadding: { height: 100 },
});
