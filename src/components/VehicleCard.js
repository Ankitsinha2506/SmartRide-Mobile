import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CarFront, MapPin } from 'lucide-react-native';
import { colors, radius, shadow, spacing } from '../theme';
export function VehicleCard({ vehicle, onPress }) {
  const image = vehicle.images?.[0];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <CarFront color={colors.primary} size={44} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.category}>
          {vehicle.category} · {vehicle.fuelType}
        </Text>
        <Text style={styles.title}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <View style={styles.row}>
          <MapPin size={14} color={colors.muted} />
          <Text style={styles.city}>{vehicle.city}</Text>
          <Text style={styles.price}>
            ₹{vehicle.pricePerDay}
            <Text style={styles.per}>/day</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow,
  },
  image: { width: '100%', height: 165 },
  placeholder: {
    backgroundColor: '#DDEDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.md },
  category: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  city: { fontSize: 12, color: colors.muted, marginLeft: 4 },
  price: {
    marginLeft: 'auto',
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  per: { fontSize: 10, color: colors.muted, fontWeight: '500' },
});
