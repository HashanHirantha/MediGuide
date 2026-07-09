import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

type Variant = 'primary' | 'outline' | 'danger' | 'black';
type Shape = 'default' | 'pill';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  shape?: Shape;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', shape = 'default', loading = false, disabled = false, style }: ButtonProps) {
  const containerStyle = [
    styles.base,
    shape === 'pill' && styles.pill,
    variant === 'outline' && styles.outline,
    variant === 'danger' && styles.danger,
    variant === 'black' && styles.black,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'outline' && styles.textOutline,
    variant === 'danger' && styles.textDanger,
    variant === 'black' && styles.textBlack,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: 9999,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.accent,
  },
  black: {
    backgroundColor: colors.black,
  },
  disabled: { opacity: 0.5 },
  text: { ...typography.body, color: '#fff', fontWeight: '700' },
  textOutline: { color: colors.primary },
  textDanger: { color: '#fff' },
  textBlack: { color: '#fff' },
});
