import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { api } from '../../services/api';
import { colors, radius, spacing } from '../../theme';
export function ReviewScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const [vehicleRating, setVehicleRating] = useState(5);
  const [vendorRating, setVendorRating] = useState(5);
  const [comment, setComment] = useState('');
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      api.post('/reviews', { bookingId, vehicleRating, vendorRating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      navigation.goBack();
    },
  });
  return (
    <Screen>
      <Text style={styles.title}>How was your ride?</Text>
      <Text style={styles.subtitle}>
        Your feedback helps everyone travel with confidence.
      </Text>
      <Rating
        label="Vehicle experience"
        value={vehicleRating}
        onChange={setVehicleRating}
      />
      <Rating
        label="Vendor experience"
        value={vendorRating}
        onChange={setVendorRating}
      />
      <Text style={styles.label}>Share a few details</Text>
      <TextInput
        style={styles.comment}
        multiline
        numberOfLines={5}
        value={comment}
        onChangeText={setComment}
        placeholder="What stood out about your experience?"
        placeholderTextColor="#94A09C"
      />
      {mutation.error ? (
        <Text style={styles.error}>{mutation.error.message}</Text>
      ) : null}
      <AppButton
        title="Submit review"
        loading={mutation.isPending}
        onPress={() => mutation.mutate()}
      />
    </Screen>
  );
}
function Rating({ label, value, onChange }) {
  return (
    <View style={styles.rating}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(n => (
          <Star
            key={n}
            size={30}
            color={colors.secondary}
            fill={n <= value ? colors.secondary : 'transparent'}
            onPress={() => onChange(n)}
          />
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 29, fontWeight: '900', color: colors.text, marginTop: 10 },
  subtitle: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 7,
    marginBottom: spacing.lg,
  },
  rating: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  stars: { flexDirection: 'row', justifyContent: 'space-between' },
  comment: {
    minHeight: 130,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  error: { color: colors.danger, marginBottom: 10 },
});
