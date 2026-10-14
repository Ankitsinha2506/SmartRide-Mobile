import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  CalendarDays,
  CarFront,
  ChevronRight,
  MapPin,
  Search,
  UserRound,
  WalletCards,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';
import { VehicleCard } from '../../components/VehicleCard';
import { colors, radius, shadow, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';

const activeStatuses = new Set([
  'PENDING_ASSIGNMENT',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'ACTIVE',
]);
const emptyList = [];

const formatDate = date =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

const formatMoney = amount =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

export function HomeScreen({ navigation }) {
  const user = useAuthStore(state => state.user);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles'),
  });
  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings/me'),
  });

  const allVehicles = vehiclesQuery.data || emptyList;
  const bookings = bookingsQuery.data || emptyList;
  const categories = useMemo(
    () => [...new Set(allVehicles.map(vehicle => vehicle.category).filter(Boolean))],
    [allVehicles],
  );
  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return allVehicles.filter(vehicle => {
      const matchesCategory =
        category === 'ALL' || vehicle.category === category;
      const searchableText =
        `${vehicle.brand} ${vehicle.model} ${vehicle.city} ${vehicle.category} ${vehicle.fuelType}`.toLowerCase();
      return matchesCategory && searchableText.includes(normalizedSearch);
    });
  }, [allVehicles, category, search]);
  const displayedVehicles = showAllVehicles
    ? filteredVehicles
    : filteredVehicles.slice(0, 3);
  const activeBooking = bookings.find(booking =>
    activeStatuses.has(booking.status),
  );
  const activeBookingCount = bookings.filter(
    booking => booking.status === 'ACTIVE',
  ).length;
  const totalSpent = bookings
    .filter(booking => booking.paymentStatus === 'PAID')
    .reduce(
      (total, booking) => total + Number(booking.pricing?.totalAmount || 0),
      0,
    );
  const refreshing = vehiclesQuery.isRefetching || bookingsQuery.isRefetching;

  const openBooking = booking => {
    if (booking?.id) {
      navigation.navigate('BookingDetails', { bookingId: booking.id });
    } else {
      navigation.navigate('Bookings');
    }
  };

  const refresh = () =>
    Promise.all([vehiclesQuery.refetch(), bookingsQuery.refetch()]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <CarFront size={20} color={colors.ink} />
            </View>
            <Text style={styles.brandName}>SmartRide</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open updates"
              onPress={() => navigation.navigate('Updates')}
              style={styles.iconButton}
            >
              <Bell size={19} color={colors.ink} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.trim()?.[0]?.toUpperCase() || 'S'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>YOUR NEXT JOURNEY STARTS HERE</Text>
          <Text style={styles.title}>
            Good {getTimeOfDay()}, {user?.name?.trim()?.split(/\s+/)[0] || 'rider'}.
          </Text>
          <Text style={styles.subtitle}>
            Find a ride that fits your plans.
          </Text>
        </View>

        <View style={styles.search}>
          <Search size={19} color={colors.muted} />
          <TextInput
            accessibilityLabel="Search vehicles"
            value={search}
            onChangeText={setSearch}
            placeholder="Search by car, category or city"
            placeholderTextColor="#929E9A"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <View style={styles.stats}>
          <StatCard
            icon={CalendarDays}
            label="Bookings"
            value={bookingsQuery.isLoading ? '—' : bookings.length}
            onPress={() => navigation.navigate('Bookings')}
          />
          <StatCard
            icon={CarFront}
            label="Active rentals"
            value={bookingsQuery.isLoading ? '—' : activeBookingCount}
            onPress={() => navigation.navigate('Bookings')}
          />
          <StatCard
            icon={WalletCards}
            label="Total spent"
            value={bookingsQuery.isLoading ? '—' : formatMoney(totalSpent)}
            onPress={() => navigation.navigate('Bookings')}
          />
        </View>

        <SectionHeading
          title="Active booking"
          action="View all"
          onPress={() => navigation.navigate('Bookings')}
        />
        {bookingsQuery.isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Checking your bookings…</Text>
          </View>
        ) : bookingsQuery.error ? (
          <QueryError
            message={bookingsQuery.error.message}
            onRetry={() => bookingsQuery.refetch()}
          />
        ) : activeBooking ? (
          <ActiveBookingCard
            booking={activeBooking}
            onPress={() => openBooking(activeBooking)}
          />
        ) : (
          <View style={styles.emptyBooking}>
            <View style={styles.emptyBookingIcon}>
              <CarFront size={25} color={colors.primaryDark} />
            </View>
            <View style={styles.emptyBookingCopy}>
              <Text style={styles.emptyBookingTitle}>Ready for a new ride?</Text>
              <Text style={styles.emptyBookingText}>
                Your next booking will show up here.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowAllVehicles(true)}
              style={styles.smallAction}
            >
              <Text style={styles.smallActionText}>Explore</Text>
            </Pressable>
          </View>
        )}

        <SectionHeading
          title="Recent bookings"
          action="See all"
          onPress={() => navigation.navigate('Bookings')}
        />
        {bookingsQuery.isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Loading recent trips…</Text>
          </View>
        ) : bookingsQuery.error ? null : bookings.length ? (
          <View style={styles.recentList}>
            {bookings.slice(0, 3).map(booking => (
              <RecentBooking
                key={booking.id}
                booking={booking}
                onPress={() => openBooking(booking)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.mutedEmpty}>
            Once you book a vehicle, your trips will appear here.
          </Text>
        )}

        <View style={styles.vehicleHeading}>
          <View style={styles.sectionTitleGroup}>
            <Text style={styles.sectionTitle}>Find your ride</Text>
            <Text style={styles.sectionSubtitle}>
              {vehiclesQuery.isLoading
                ? 'Finding available vehicles…'
                : `${filteredVehicles.length} vehicles available`}
            </Text>
          </View>
          {filteredVehicles.length > 3 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowAllVehicles(current => !current)}
              hitSlop={8}
            >
              <Text style={styles.link}>
                {showAllVehicles ? 'Show less' : 'Browse all'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {categories.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {['ALL', ...categories].map(item => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: category === item }}
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryChip,
                  category === item && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.categoryTextActive,
                  ]}
                >
                  {item === 'ALL' ? 'All rides' : titleCase(item)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {vehiclesQuery.isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Finding rides near you…</Text>
          </View>
        ) : vehiclesQuery.error ? (
          <QueryError
            message={vehiclesQuery.error.message}
            onRetry={() => vehiclesQuery.refetch()}
          />
        ) : displayedVehicles.length ? (
          displayedVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle._id || vehicle.id}
              vehicle={vehicle}
              onPress={() =>
                navigation.navigate('VehicleDetails', {
                  vehicleId: vehicle._id || vehicle.id,
                })
              }
            />
          ))
        ) : (
          <Text style={styles.mutedEmpty}>
            No vehicles match your search. Try another name, city or category.
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('HireDriver')}
          style={styles.driverCard}
        >
          <View style={styles.driverIcon}>
            <UserRound color={colors.ink} size={21} />
          </View>
          <View style={styles.driverCopy}>
            <Text style={styles.driverTitle}>Already have a car?</Text>
            <Text style={styles.driverText}>
              Hire a verified driver for your own vehicle.
            </Text>
          </View>
          <ChevronRight color={colors.ink} size={20} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function titleCase(value) {
  return value.toLowerCase().replace(/(^|\s)\S/g, character =>
    character.toUpperCase(),
  );
}

function StatCard({ icon: Icon, label, value, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}
    >
      <View style={styles.statIcon}>
        <Icon size={16} color={colors.primaryDark} />
      </View>
      <Text numberOfLines={1} style={styles.statValue}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.statLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeading({ title, action, onPress }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        hitSlop={8}
        style={styles.sectionAction}
      >
        <Text style={styles.link}>{action}</Text>
        <ChevronRight size={15} color={colors.primary} />
      </Pressable>
    </View>
  );
}

function ActiveBookingCard({ booking, onPress }) {
  const vehicle = booking.vehicle || {};
  const image = vehicle.images?.[0];
  const vehicleName =
    [vehicle.brand, vehicle.model].filter(Boolean).join(' ') ||
    booking.customerVehicle?.make ||
    'Your driver booking';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.activeCard, pressed && styles.pressed]}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.activeImage} />
      ) : (
        <View style={[styles.activeImage, styles.activeImagePlaceholder]}>
          <CarFront size={34} color={colors.primaryDark} />
        </View>
      )}
      <View style={styles.activeBody}>
        <View style={styles.activeTopline}>
          <Text style={styles.bookingCode}>{booking.bookingCode}</Text>
          <Text style={styles.statusBadge}>
            {titleCase((booking.status || 'IN PROGRESS').replaceAll('_', ' '))}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.activeVehicle}>
          {vehicleName}
        </Text>
        <View style={styles.activeMeta}>
          <View style={styles.metaItem}>
            <CalendarDays size={14} color={colors.muted} />
            <Text style={styles.metaText}>
              {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
            </Text>
          </View>
          {vehicle.city ? (
            <View style={styles.metaItem}>
              <MapPin size={14} color={colors.muted} />
              <Text numberOfLines={1} style={styles.metaText}>
                {vehicle.city}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.activeFooter}>
          <Text style={styles.amount}>
            {formatMoney(booking.pricing?.totalAmount)}
          </Text>
          <View style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View details</Text>
            <ChevronRight size={14} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function RecentBooking({ booking, onPress }) {
  const vehicle = booking.vehicle || {};
  const name =
    [vehicle.brand, vehicle.model].filter(Boolean).join(' ') ||
    booking.customerVehicle?.make ||
    'Driver service';
  const isCancelled = ['CANCELLED', 'EXPIRED'].includes(booking.status);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.recentRow, pressed && styles.pressed]}
    >
      <View style={styles.recentIcon}>
        <CarFront size={19} color={colors.primaryDark} />
      </View>
      <View style={styles.recentBody}>
        <Text numberOfLines={1} style={styles.recentName}>
          {name}
        </Text>
        <Text style={styles.recentDate}>
          {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
        </Text>
      </View>
      <View style={styles.recentTrailing}>
        <Text
          style={[
            styles.recentStatus,
            isCancelled && styles.cancelledStatus,
          ]}
        >
          {titleCase((booking.status || '').replaceAll('_', ' '))}
        </Text>
        <Text style={styles.recentAmount}>
          {formatMoney(booking.pricing?.totalAmount)}
        </Text>
      </View>
    </Pressable>
  );
}

function QueryError({ message, onRetry }) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>We couldn’t load this right now.</Text>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.retryButton}
      >
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 112 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 17, fontWeight: '900', color: colors.ink },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '900', color: colors.ink },
  greeting: { marginBottom: spacing.md },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: colors.primary,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 5,
  },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4 },
  search: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, color: colors.text, marginLeft: 10, paddingVertical: 0 },
  stats: { flexDirection: 'row', gap: 9, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  statValue: { fontSize: 17, fontWeight: '900', color: colors.ink },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 3 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: colors.ink },
  sectionSubtitle: { fontSize: 11, color: colors.muted, marginTop: 3 },
  link: { fontSize: 11, fontWeight: '800', color: colors.primary },
  stateCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  stateText: { color: colors.muted, fontSize: 12 },
  activeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
    ...shadow,
  },
  activeImage: { width: '100%', height: 145 },
  activeImagePlaceholder: {
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBody: { padding: spacing.md },
  activeTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingCode: { fontSize: 10, fontWeight: '900', color: colors.muted },
  statusBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primaryDark,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeVehicle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 7,
  },
  activeMeta: { gap: 7, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11, color: colors.muted, flexShrink: 1 },
  activeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 13,
    paddingTop: 11,
  },
  amount: { fontSize: 16, fontWeight: '900', color: colors.ink },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  emptyBooking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  emptyBookingIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  emptyBookingCopy: { flex: 1 },
  emptyBookingTitle: { fontSize: 12, fontWeight: '900', color: colors.ink },
  emptyBookingText: { fontSize: 10, color: colors.muted, marginTop: 3 },
  smallAction: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  smallActionText: { fontSize: 10, fontWeight: '900', color: colors.ink },
  recentList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  recentIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentBody: { flex: 1, marginHorizontal: 10 },
  recentName: { fontSize: 12, fontWeight: '800', color: colors.ink },
  recentDate: { fontSize: 10, color: colors.muted, marginTop: 3 },
  recentTrailing: { alignItems: 'flex-end', maxWidth: 105 },
  recentStatus: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
    textAlign: 'right',
  },
  cancelledStatus: { color: colors.danger },
  recentAmount: { fontSize: 11, fontWeight: '900', color: colors.ink, marginTop: 5 },
  vehicleHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 10,
  },
  sectionTitleGroup: { flex: 1 },
  categoryList: { gap: 8, paddingBottom: 12 },
  categoryChip: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: colors.muted },
  categoryTextActive: { color: colors.accent },
  mutedEmpty: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  errorCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorTitle: { fontSize: 13, fontWeight: '900', color: colors.ink },
  errorText: { fontSize: 11, lineHeight: 16, color: colors.muted, marginTop: 5 },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  retryText: { fontSize: 11, color: colors.ink, fontWeight: '900' },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    marginTop: spacing.sm,
  },
  driverIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverCopy: { flex: 1 },
  driverTitle: { color: 'white', fontSize: 13, fontWeight: '900' },
  driverText: { color: '#C8CCC3', fontSize: 10, lineHeight: 15, marginTop: 3 },
  pressed: { opacity: 0.78 },
});
