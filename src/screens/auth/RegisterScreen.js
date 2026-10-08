import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen } from '../../components/Screen';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing } from '../../theme';
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
});
export function RegisterScreen() {
  const [error, setError] = useState('');
  const setSession = useAuthStore(s => s.setSession);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });
  const submit = async values => {
    try {
      await setSession(
        await api.post('/auth/register', { ...values, role: 'CUSTOMER' }),
      );
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <Screen>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        Book verified vehicles with transparent pricing.
      </Text>
      {['name', 'email', 'phone', 'password'].map(name => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={name[0].toUpperCase() + name.slice(1)}
              value={value}
              onChangeText={onChange}
              secureTextEntry={name === 'password'}
              autoCapitalize={name === 'email' ? 'none' : 'sentences'}
              keyboardType={
                name === 'phone'
                  ? 'phone-pad'
                  : name === 'email'
                  ? 'email-address'
                  : 'default'
              }
              error={errors[name]?.message}
            />
          )}
        />
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton
        title="Create account"
        onPress={handleSubmit(submit)}
        loading={isSubmitting}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: { color: colors.muted, lineHeight: 22, marginVertical: spacing.lg },
  error: { color: colors.danger, marginBottom: 10 },
});
