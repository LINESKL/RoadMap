import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Выйти из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            global.token = null;
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: icon.bgColor || '#F2F2F7' }]}>
          <Ionicons name={icon.name} size={20} color={icon.color || '#5656D6'} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#5656D6" />
        </TouchableOpacity>
        <Text style={styles.title}>Настройки</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основные</Text>
          
          <SettingItem
            icon={{ name: 'person-outline', color: '#5656D6', bgColor: '#E8E8FF' }}
            title="Профиль"
            subtitle="Управление аккаунтом"
            onPress={() => router.push('/profile')}
          />
          
          <SettingItem
            icon={{ name: 'notifications-outline', color: '#FF9500', bgColor: '#FFF3E0' }}
            title="Уведомления"
            subtitle="Настройка оповещений"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#F2F2F7', true: '#5656D6' }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon={{ name: 'moon-outline', color: '#5856D6', bgColor: '#E8E8FF' }}
            title="Темная тема"
            subtitle="Переключение темы"
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#F2F2F7', true: '#5656D6' }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Обучение</Text>
          
          <SettingItem
            icon={{ name: 'library-outline', color: '#34C759', bgColor: '#E8F5E8' }}
            title="Мои курсы"
            subtitle="Список изучаемых курсов"
            onPress={() => router.push('/my-syllabuses')}
          />
          
          <SettingItem
            icon={{ name: 'stats-chart-outline', color: '#FF6B6B', bgColor: '#FFE8E8' }}
            title="Статистика"
            subtitle="Прогресс обучения"
            onPress={() => Alert.alert('Статистика', 'Функция в разработке')}
          />
          
          <SettingItem
            icon={{ name: 'download-outline', color: '#007AFF', bgColor: '#E8F4FF' }}
            title="Загрузки"
            subtitle="Оффлайн материалы"
            onPress={() => Alert.alert('Загрузки', 'Функция в разработке')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поддержка</Text>
          
          <SettingItem
            icon={{ name: 'help-circle-outline', color: '#FF9500', bgColor: '#FFF3E0' }}
            title="Помощь"
            subtitle="FAQ и поддержка"
            onPress={() => Alert.alert('Помощь', 'Свяжитесь с нами: support@roadmap.com')}
          />
          
          <SettingItem
            icon={{ name: 'information-circle-outline', color: '#5856D6', bgColor: '#E8E8FF' }}
            title="О приложении"
            subtitle="Версия 1.0.0"
            onPress={() => Alert.alert('О приложении', 'RoadMap Mobile v1.0.0\nПриложение для изучения курсов')}
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backBtn: { padding: 8, borderRadius: 20, backgroundColor: '#F2F2F7' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1D1D1F' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 2 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#1D1D1F' },
  settingSubtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FF3B30' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#FF3B30', marginLeft: 8 },
});
