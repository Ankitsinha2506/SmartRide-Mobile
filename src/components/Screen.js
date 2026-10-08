import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
export function Screen({ children, scroll = true, style }) {
  const content = <View style={[styles.content, style]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { flex: 1, padding: spacing.md },
});
