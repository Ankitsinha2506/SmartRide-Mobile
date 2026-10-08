import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BadgeCheck, UserRound } from 'lucide-react-native';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { api } from '../../services/api';
import { colors, radius, spacing } from '../../theme';

export function HireDriverScreen({ navigation }) {
  const [form, setForm] = useState({
    make: '',
    model: '',
    registrationNumber: '',
    pickupAddress: '',
    dropAddress: '',
    startDate: '',
    endDate: '',
  });
  const [driverId, setDriverId] = useState('');
  const drivers = useQuery({
    queryKey: ['available-drivers'],
    queryFn: () => api.get('/drivers/available'),
  });
  const booking = useMutation({
    mutationFn: () =>
      api.post('/bookings', {
        serviceType: 'DRIVER_ONLY',
        driverId: driverId || undefined,
        customerVehicle: {
          make: form.make,
          model: form.model,
          registrationNumber: form.registrationNumber,
        },
        trip: {
          pickupAddress: form.pickupAddress,
          dropAddress: form.dropAddress || undefined,
        },
        startDate: form.startDate,
        endDate: form.endDate,
      }),
    onSuccess: data =>
      navigation.replace('BookingDetails', { bookingId: data.id }),
  });
  const set = name => value =>
    setForm(current => ({ ...current, [name]: value }));
  const valid =
    form.make &&
    form.model &&
    form.registrationNumber &&
    form.pickupAddress &&
    form.startDate &&
    form.endDate;
  return (
    <Screen>
      <Text style={styles.eyebrow}>YOUR CAR · OUR PROFESSIONAL</Text>
      <Text style={styles.title}>Hire a verified driver</Text>
      <Text style={styles.copy}>
        Tell us about your car and trip, then select an available approved
        driver.
      </Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Your vehicle</Text>
        <AppInput
          label="Make"
          value={form.make}
          onChangeText={set('make')}
          placeholder="Hyundai"
        />
        <AppInput
          label="Model"
          value={form.model}
          onChangeText={set('model')}
          placeholder="Creta"
        />
        <AppInput
          label="Registration number"
          value={form.registrationNumber}
          onChangeText={set('registrationNumber')}
          placeholder="MH 01 AB 1234"
          autoCapitalize="characters"
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Trip details</Text>
        <AppInput
          label="Pickup address"
          value={form.pickupAddress}
          onChangeText={set('pickupAddress')}
          placeholder="Full pickup address"
        />
        <AppInput
          label="Drop address (optional)"
          value={form.dropAddress}
          onChangeText={set('dropAddress')}
          placeholder="Destination"
        />
        <AppInput
          label="Start"
          value={form.startDate}
          onChangeText={set('startDate')}
          placeholder="2026-09-10"
        />
        <AppInput
          label="End"
          value={form.endDate}
          onChangeText={set('endDate')}
          placeholder="2026-09-11"
        />
      </View>
      <Text style={styles.heading}>Available drivers</Text>
      {drivers.isLoading ? (
        <Text style={styles.copy}>Finding available drivers…</Text>
      ) : (
        (drivers.data || []).map(driver => (
          <Pressable
            key={driver.id}
            onPress={() => setDriverId(driver.id)}
            style={[styles.driver, driverId === driver.id && styles.selected]}
          >
            <View style={styles.avatar}>
              <UserRound color={colors.primary} />
            </View>
            <View style={styles.driverCopy}>
              <Text style={styles.driverName}>{driver.user?.name}</Text>
              <Text style={styles.copy}>
                {driver.yearsOfExperience} years ·{' '}
                {driver.serviceCity || 'All areas'}
              </Text>
            </View>
            <View>
              <BadgeCheck color={colors.success} size={18} />
              <Text style={styles.rate}>₹{driver.ratePerDay}/day</Text>
            </View>
          </Pressable>
        ))
      )}
      {booking.error ? (
        <Text style={styles.error}>{booking.error.message}</Text>
      ) : null}
      <AppButton
        title={driverId ? 'Book selected driver' : 'Request driver assignment'}
        disabled={!valid}
        loading={booking.isPending}
        onPress={() => booking.mutate()}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: { fontSize: 30, fontWeight: '900', color: colors.text, marginTop: 6 },
  copy: { color: colors.muted, lineHeight: 20, marginTop: 5 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  heading: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: 8,
  },
  driver: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  selected: { borderColor: colors.primary, backgroundColor: '#EAF4F0' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E2F0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverCopy: { flex: 1, marginLeft: 12 },
  driverName: { fontWeight: '900', color: colors.text },
  rate: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  error: { color: colors.danger, marginTop: 10 },
  button: { marginTop: spacing.md, marginBottom: 30 },
});
