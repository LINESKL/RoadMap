// Этот файл удален - Expo Router управляет навигацией
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RoadmapScreen from './screens/RoadmapScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import SyllabusSearchScreen from './screens/SyllabusSearchScreen';
import MySyllabusesScreen from './screens/MySyllabusesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Roadmap" component={RoadmapScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SyllabusSearch" component={SyllabusSearchScreen} />
        <Stack.Screen name="MySyllabuses" component={MySyllabusesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
