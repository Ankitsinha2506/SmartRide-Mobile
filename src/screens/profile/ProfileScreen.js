import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { FileBadge, Mail, Phone } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing } from '../../theme';
export function ProfileScreen() {
  const logout = useAuthStore(s => s.logout);
  const fallback = useAuthStore(s => s.user);
  const query = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => api.get('/customers/me'),
  });
  const p = query.data || {};
  const user = p.user || fallback || {};
  const upload = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    const asset = result.assets?.[0];
    if (!asset) return;
    const data = new FormData();
    data.append('file', {
      uri: asset.uri,
      type: asset.type,
      name: asset.fileName || 'profile.jpg',
    });
    try {
      await api.post('/uploads/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Uploaded', 'Your profile image was updated.');
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    }
  };
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text>{user.name?.[0] || 'S'}</Text>
        </View>
        <Text style={styles.name}>{user.name || 'SmartRide customer'}</Text>
        <Text style={styles.role}>CUSTOMER</Text>
      </View>
      <View style={styles.card}>
        <Item icon={Mail} label="Email" value={user.email} />
        <Item icon={Phone} label="Phone" value={user.phone || 'Not provided'} />
        <Item
          icon={FileBadge}
          label="Driving licence"
          value={p.drivingLicense?.verificationStatus || 'NOT SUBMITTED'}
        />
      </View>
      <AppButton
        title="Update profile photo"
        variant="secondary"
        onPress={upload}
      />
      <AppButton
        title="Sign out"
        variant="danger"
        style={styles.signout}
        onPress={() => logout()}
      />
    </Screen>
  );
}
function Item({ icon: Icon, label, value }) {
  return (
    <View style={styles.item}>
      <Icon size={19} color={colors.primary} />
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 25 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 24, fontWeight: '900', color: colors.text, marginTop: 13 },
  role: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.primary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  label: { fontSize: 10, color: colors.muted },
  value: { fontWeight: '800', color: colors.text, marginTop: 3 },
  signout: { marginTop: 10 },
});
