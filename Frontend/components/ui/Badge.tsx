import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = colors.primary }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontWeight: '700', textTransform: 'capitalize' },
});
