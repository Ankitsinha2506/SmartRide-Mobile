import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, CarFront, ChevronRight } from 'lucide-react-native';
import { api } from '../../services/api';
import { colors, radius, spacing } from '../../theme';
export function BookingsScreen({ navigation }) {
  const query = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings/me'),
  });
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR JOURNEYS</Text>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>
          Every reservation, all in one place.
        </Text>
      </View>
      <FlatList
        data={query.data || []}
        keyExtractor={b => b.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: b }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('BookingDetails', { bookingId: b.id })
            }
          >
            <View style={styles.icon}>
              <CarFront color={colors.primary} />
            </View>
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={styles.code}>{b.bookingCode}</Text>
                <Text style={styles.status}>
                  {b.status?.replaceAll('_', ' ')}
                </Text>
              </View>
              <Text style={styles.vehicle}>
                {b.vehicle?.brand} {b.vehicle?.model}
              </Text>
              <View style={styles.date}>
                <CalendarDays size={14} color={colors.muted} />
                <Text>
                  {new Date(b.startDate).toLocaleDateString()} –{' '}
                  {new Date(b.endDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <ChevronRight size={19} color={colors.muted} />
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.isLoading
              ? 'Loading your journeys…'
              : 'You have no bookings yet.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingBottom: 10 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.primary,
  },
  title: { fontSize: 30, fontWeight: '900', color: colors.text, marginTop: 5 },
  subtitle: { color: colors.muted, marginTop: 3 },
  list: { padding: spacing.md, paddingTop: 8, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#DDEDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, marginHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  code: { fontWeight: '900', color: colors.text, fontSize: 12 },
  status: {
    marginLeft: 'auto',
    fontSize: 8,
    fontWeight: '900',
    color: colors.primary,
  },
  vehicle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 5,
  },
  date: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: colors.muted },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 80 },
});
