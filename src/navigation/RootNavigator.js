import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, CalendarDays, Home, UserRound } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { VehicleDetailsScreen } from '../screens/home/VehicleDetailsScreen';
import { HireDriverScreen } from '../screens/home/HireDriverScreen';
import { BookingsScreen } from '../screens/bookings/BookingsScreen';
import { BookingDetailsScreen } from '../screens/bookings/BookingDetailsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ReviewScreen } from '../screens/reviews/ReviewScreen';
const Stack = createNativeStackNavigator(),
  Tab = createBottomTabNavigator();
const options = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { fontWeight: '800', color: colors.text },
  headerTintColor: colors.primary,
};
const icons = {
  Discover: Home,
  Bookings: CalendarDays,
  Updates: Bell,
  Profile: UserRound,
};
function TabIcon({ name, color, size }) {
  const Icon = icons[name];
  return <Icon color={color} size={size} />;
}
const tabOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: '#8A9692',
  tabBarStyle: styles.tab,
  tabBarLabelStyle: styles.label,
  tabBarIcon: props => <TabIcon name={route.name} {...props} />,
});
function Tabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Discover" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Updates" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
export function RootNavigator() {
  const { token, hydrated } = useAuthStore();
  if (!hydrated)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  return (
    <Stack.Navigator screenOptions={options}>
      {token ? (
        <>
          <Stack.Screen
            name="Main"
            component={Tabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VehicleDetails"
            component={VehicleDetailsScreen}
            options={{ title: 'Vehicle details' }}
          />
          <Stack.Screen
            name="HireDriver"
            component={HireDriverScreen}
            options={{ title: 'Hire a driver' }}
          />
          <Stack.Screen
            name="BookingDetails"
            component={BookingDetailsScreen}
            options={{ title: 'Booking details' }}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ title: 'Rate your ride' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create account' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  tab: {
    height: 68,
    paddingTop: 7,
    paddingBottom: 8,
    borderTopColor: '#E2E8E4',
  },
  label: { fontWeight: '700', fontSize: 10 },
});
