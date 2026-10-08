import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCheck } from 'lucide-react-native';
import { api } from '../../services/api';
import { connectRealtime } from '../../services/realtime';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing } from '../../theme';
export function NotificationsScreen() {
  const token = useAuthStore(s => s.token);
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications/me'),
  });
  const readAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  useEffect(
    () =>
      connectRealtime(token, () =>
        qc.invalidateQueries({ queryKey: ['notifications'] }),
      ),
    [token, qc],
  );
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>INBOX</Text>
          <Text style={styles.title}>Updates</Text>
        </View>
        <CheckCheck color={colors.primary} onPress={() => readAll.mutate()} />
      </View>
      <FlatList
        data={query.data || []}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: n }) => (
          <View style={[styles.item, !n.isRead && styles.unread]}>
            <View style={styles.icon}>
              <Bell size={18} color={colors.primary} />
            </View>
            <View style={styles.body}>
              <Text style={styles.itemTitle}>{n.title}</Text>
              <Text style={styles.copy}>{n.body}</Text>
              <Text style={styles.time}>
                {new Date(n.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.isLoading
              ? 'Checking for updates…'
              : 'You are all caught up.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  title: { fontSize: 30, color: colors.text, fontWeight: '900', marginTop: 4 },
  list: { padding: spacing.md, paddingTop: 4, paddingBottom: 100 },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  unread: { backgroundColor: '#ECF7F3', borderColor: '#C9E4DC' },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DDEDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, marginLeft: 12 },
  itemTitle: { fontWeight: '900', color: colors.text },
  copy: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    marginVertical: 4,
  },
  time: { fontSize: 9, color: '#96A19D' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 90 },
});
