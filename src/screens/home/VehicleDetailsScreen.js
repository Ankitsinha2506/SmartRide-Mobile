import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CarFront, Fuel, MapPin, Users } from 'lucide-react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { api } from '../../services/api';
import { colors, radius, spacing } from '../../theme';

export function VehicleDetailsScreen({ route, navigation }) {
  const { vehicleId } = route.params;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serviceType, setServiceType] = useState('CAR_ONLY');
  const [pickupAddress, setPickupAddress] = useState('');
  const [driverId, setDriverId] = useState('');
  const query = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => api.get(`/vehicles/${vehicleId}`),
  });
  const drivers = useQuery({
    queryKey: ['available-drivers'],
    queryFn: () => api.get('/drivers/available'),
    enabled: serviceType === 'CAR_WITH_DRIVER',
  });
  const booking = useMutation({
    mutationFn: () =>
      api.post('/bookings', {
        vehicleId,
        startDate,
        endDate,
        serviceType,
        ...(serviceType === 'CAR_WITH_DRIVER'
          ? { driverId: driverId || undefined, trip: { pickupAddress } }
          : {}),
      }),
    onSuccess: data =>
      navigation.replace('BookingDetails', { bookingId: data.id }),
  });
  const v = query.data;
  if (!v)
    return (
      <Screen>
        <Text style={styles.loading}>
          {query.error?.message || 'Loading vehicle…'}
        </Text>
      </Screen>
    );
  return (
    <Screen>
      <View style={styles.visual}>
        {v.images?.[0] ? (
          <Image source={{ uri: v.images[0] }} style={styles.image} />
        ) : (
          <CarFront size={70} color={colors.primary} />
        )}
      </View>
      <Text style={styles.eyebrow}>
        {v.category} · {v.transmission}
      </Text>
      <Text style={styles.title}>
        {v.brand} {v.model}
      </Text>
      <View style={styles.meta}>
        <View>
          <MapPin />
          <Text>{v.city}</Text>
        </View>
        <View>
          <Fuel />
          <Text>{v.fuelType}</Text>
        </View>
        <View>
          <Users />
          <Text>{v.seats} seats</Text>
        </View>
      </View>
      <View style={styles.price}>
        <Text>₹{v.pricePerDay}</Text>
        <Text>/ day</Text>
      </View>
      <View style={styles.booking}>
        <Text style={styles.heading}>Choose rental dates</Text>
        <View style={styles.modes}>
          <Pressable
            onPress={() => setServiceType('CAR_ONLY')}
            style={[
              styles.mode,
              serviceType === 'CAR_ONLY' && styles.modeActive,
            ]}
          >
            <Text style={styles.modeText}>Self drive</Text>
          </Pressable>
          <Pressable
            onPress={() => setServiceType('CAR_WITH_DRIVER')}
            style={[
              styles.mode,
              serviceType === 'CAR_WITH_DRIVER' && styles.modeActive,
            ]}
          >
            <Text style={styles.modeText}>With driver</Text>
          </Pressable>
        </View>
        <Text style={styles.help}>Use ISO format, for example 2026-09-10.</Text>
        <AppInput
          label="Start date"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />
        {serviceType === 'CAR_WITH_DRIVER' ? (
          <>
            <AppInput
              label="Pickup address"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Full pickup address"
            />
            <Text style={styles.heading}>Choose an available driver</Text>
            {(drivers.data || []).map(driver => (
              <Pressable
                key={driver.id}
                onPress={() => setDriverId(driver.id)}
                style={[
                  styles.driver,
                  driverId === driver.id && styles.driverActive,
                ]}
              >
                <Text style={styles.driverName}>{driver.user?.name}</Text>
                <Text style={styles.driverRate}>₹{driver.ratePerDay}/day</Text>
              </Pressable>
            ))}
          </>
        ) : null}
        <AppInput
          label="End date"
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
        />
        {booking.error ? (
          <Text style={styles.error}>{booking.error.message}</Text>
        ) : null}
        <AppButton
          title="Reserve this vehicle"
          loading={booking.isPending}
          disabled={
            !startDate ||
            !endDate ||
            (serviceType === 'CAR_WITH_DRIVER' && (!pickupAddress || !driverId))
          }
          onPress={() => booking.mutate()}
        />
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  loading: { textAlign: 'center', marginTop: 60, color: colors.muted },
  visual: {
    height: 230,
    borderRadius: radius.lg,
    backgroundColor: '#DDEDE8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: spacing.lg,
  },
  title: { fontSize: 30, fontWeight: '900', color: colors.text, marginTop: 5 },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  metaItem: { alignItems: 'center' },
  price: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 20 },
  booking: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  heading: { fontSize: 18, fontWeight: '900', color: colors.text },
  help: { fontSize: 11, color: colors.muted, marginVertical: 6 },
  modes: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  mode: {
    flex: 1,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: '#EDF1EF',
    alignItems: 'center',
  },
  modeActive: {
    backgroundColor: '#D9EEE7',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeText: { fontWeight: '800', color: colors.primaryDark },
  driver: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 8,
  },
  driverActive: { borderColor: colors.primary, backgroundColor: '#EAF4F0' },
  driverName: { fontWeight: '800', color: colors.text },
  driverRate: { fontWeight: '800', color: colors.primary },
  error: { color: colors.danger, marginBottom: 10 },
});
