import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, UserRound } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';
import { VehicleCard } from '../../components/VehicleCard';
import { colors, radius, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export function HomeScreen({ navigation }) {
  const user = useAuthStore(s => s.user);
  const [search, setSearch] = useState('');
  const query = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles'),
  });
  const vehicles = useMemo(
    () =>
      (query.data || []).filter(v =>
        `${v.brand} ${v.model} ${v.city} ${v.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [query.data, search],
  );
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={vehicles}
        keyExtractor={v => v._id || v.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() =>
              navigation.navigate('VehicleDetails', {
                vehicleId: item._id || item.id,
              })
            }
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.hello}>
                  Hello, {user?.name?.split(' ')[0] || 'rider'} 👋
                </Text>
                <Text style={styles.title}>
                  Find a ride that fits your day.
                </Text>
              </View>
              <View style={styles.avatar}>
                <Text>{user?.name?.[0] || 'S'}</Text>
              </View>
            </View>
            <View style={styles.search}>
              <Search size={19} color={colors.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search vehicle, city, category"
                placeholderTextColor="#929E9A"
                style={styles.searchInput}
              />
              <SlidersHorizontal size={18} color={colors.primary} />
            </View>
            <View style={styles.banner}>
              <Text style={styles.bannerEyebrow}>SMARTER MOBILITY</Text>
              <Text style={styles.bannerTitle}>
                Verified vehicles. Transparent pricing.
              </Text>
              <Text style={styles.bannerCopy}>
                No hidden turns. Just choose, book, and ride.
              </Text>
            </View>
            <Pressable
              style={styles.driverBanner}
              onPress={() => navigation.navigate('HireDriver')}
            >
              <View style={styles.driverIcon}>
                <UserRound color={colors.primary} />
              </View>
              <View style={styles.driverText}>
                <Text style={styles.driverTitle}>Already have a car?</Text>
                <Text style={styles.driverCopy}>
                  Hire a verified driver for your own vehicle
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available near you</Text>
              <Text style={styles.count}>{vehicles.length} rides</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.isLoading
              ? 'Finding great rides…'
              : 'No matching vehicles found.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  hello: { fontSize: 12, color: colors.primary, fontWeight: '800' },
  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '900',
    color: colors.text,
    maxWidth: 280,
    marginTop: 4,
  },
  avatar: {
    marginLeft: 'auto',
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: { flex: 1, color: colors.text, marginHorizontal: 9 },
  banner: {
    marginVertical: 20,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: 22,
  },
  bannerEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.secondary,
  },
  bannerTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    color: 'white',
    marginVertical: 9,
  },
  bannerCopy: { fontSize: 12, color: '#BBD0CA' },
  driverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 20,
  },
  driverIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#E2F0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverText: { flex: 1, marginLeft: 13 },
  driverTitle: { fontWeight: '900', fontSize: 16, color: colors.text },
  driverCopy: { color: colors.muted, fontSize: 12, marginTop: 3 },
  arrow: { fontSize: 30, color: colors.primary },
  section: { flexDirection: 'row', alignItems: 'center', marginBottom: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  count: { marginLeft: 'auto', color: colors.muted, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.muted, padding: 40 },
});
