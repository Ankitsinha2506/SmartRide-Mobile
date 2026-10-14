import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';
export function AppButton({
  title,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.ink : colors.primary}
        />
      ) : (
        <Text style={[styles.text, variant !== 'primary' && styles.altText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.accentSoft },
  danger: { backgroundColor: '#F7E4E4' },
  text: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  altText: { color: colors.primaryDark },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
});
