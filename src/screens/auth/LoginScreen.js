import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CarFront } from 'lucide-react-native';
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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});
export function LoginScreen({ navigation }) {
  const [error, setError] = useState('');
  const setSession = useAuthStore(s => s.setSession);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const submit = async values => {
    setError('');
    try {
      const session = await api.post('/auth/login', values);
      if (session.user.role !== 'CUSTOMER')
        throw new Error('Please use the Vendor/Admin web portal.');
      await setSession(session);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.logo}>
          <CarFront color="white" size={30} />
        </View>
        <Text style={styles.brand}>SmartRide</Text>
        <Text style={styles.title}>Your next ride starts here.</Text>
        <Text style={styles.subtitle}>
          Sign in to discover trusted vehicles near you.
        </Text>
        <View style={styles.form}>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Email address"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton
            title="Sign in"
            onPress={handleSubmit(submit)}
            loading={isSubmitting}
          />
          <AppButton
            title="Create a new account"
            variant="secondary"
            style={styles.secondary}
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 12,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    color: colors.text,
    marginTop: 22,
    maxWidth: 320,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.muted,
    marginTop: 10,
    maxWidth: 310,
  },
  form: { marginTop: spacing.xl },
  secondary: { marginTop: 10 },
  error: { color: colors.danger, fontSize: 12, marginBottom: 10 },
});
