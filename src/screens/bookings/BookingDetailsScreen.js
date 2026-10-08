import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import RazorpayCheckout from 'react-native-razorpay';
import {
  CalendarDays,
  CarFront,
  CircleCheckBig,
  IndianRupee,
  MapPin,
} from 'lucide-react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { api } from '../../services/api';
import { colors, radius, spacing } from '../../theme';
export function BookingDetailsScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => api.get(`/bookings/${bookingId}`),
  });
  const pay = useMutation({
    mutationFn: async () => {
      const order = await api.post('/payments/create-order', { bookingId });
      const result = await RazorpayCheckout.open({
        key: order.checkout.key,
        amount: order.checkout.amount,
        currency: order.checkout.currency,
        name: 'SmartRide',
        description: `Booking ${order.booking.bookingCode}`,
        order_id: order.checkout.orderId,
        theme: { color: colors.primary },
      });
      return api.post('/payments/verify', { bookingId, ...result });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', bookingId] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      Alert.alert('Payment successful', 'Your booking is confirmed.');
    },
    onError: e => Alert.alert('Payment unsuccessful', e.message),
  });
  const b = query.data;
  if (!b)
    return (
      <Screen>
        <Text style={styles.empty}>
          {query.error?.message || 'Loading booking…'}
        </Text>
      </Screen>
    );
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <CarFront size={40} color={colors.primary} />
        </View>
        <Text style={styles.code}>{b.bookingCode}</Text>
        <Text style={styles.vehicle}>
          {b.vehicle?.brand} {b.vehicle?.model}
        </Text>
        <Text style={styles.status}>{b.status?.replaceAll('_', ' ')}</Text>
      </View>
      <View style={styles.card}>
        <Row
          icon={CalendarDays}
          label="Rental period"
          value={`${new Date(b.startDate).toLocaleDateString()} – ${new Date(
            b.endDate,
          ).toLocaleDateString()}`}
        />
        <Row
          icon={MapPin}
          label="Pickup city"
          value={b.vehicle?.city || 'See vendor details'}
        />
        <Row
          icon={IndianRupee}
          label="Total amount"
          value={`₹${b.pricing?.totalAmount?.toLocaleString('en-IN')}`}
        />
        <Row icon={CircleCheckBig} label="Payment" value={b.paymentStatus} />
      </View>
      {b.status === 'PENDING_PAYMENT' && (
        <AppButton
          title="Pay securely with Razorpay"
          loading={pay.isPending}
          onPress={() => pay.mutate()}
        />
      )}{' '}
      {b.status === 'COMPLETED' && (
        <AppButton
          title="Rate this ride"
          onPress={() => navigation.navigate('Review', { bookingId })}
        />
      )}
    </Screen>
  );
}
function Row({ icon: Icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon size={19} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  empty: { textAlign: 'center', marginTop: 70, color: colors.muted },
  hero: { alignItems: 'center', paddingVertical: 20 },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: '#DDEDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 14,
  },
  vehicle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    marginTop: 5,
  },
  status: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EDF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: { fontSize: 10, color: colors.muted },
  value: { fontSize: 14, color: colors.text, fontWeight: '800', marginTop: 3 },
});
