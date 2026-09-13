import { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../lib/theme';

// ---- Screen ----

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}) {
  const content = (
    <View style={[padded && styles.screenPadding, style]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flexFill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          style={styles.flexFill}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flexFill}>{content}</View>
      )}
    </KeyboardAvoidingView>
  );
}

// ---- Card ----

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---- Buttons ----

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        buttonVariantStyles[variant],
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.primary : colors.white} />
      ) : (
        <View style={styles.buttonContent}>
          {icon}
          <Text style={[styles.buttonText, buttonTextVariantStyles[variant]]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const buttonVariantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryMuted },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
};

const buttonTextVariantStyles: Record<ButtonVariant, { color: string }> = {
  primary: { color: colors.white },
  secondary: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.white },
};

// ---- Text input ----

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={styles.fieldWrap}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={[styles.input, error ? styles.inputError : undefined]}
        {...props}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ---- Badge ----

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.badge, badgeToneStyles[tone].wrap]}>
      <Text style={[styles.badgeText, badgeToneStyles[tone].text]}>{label}</Text>
    </View>
  );
}

const badgeToneStyles: Record<BadgeTone, { wrap: ViewStyle; text: { color: string } }> = {
  neutral: { wrap: { backgroundColor: colors.surfaceMuted }, text: { color: colors.textMuted } },
  success: { wrap: { backgroundColor: colors.successMuted }, text: { color: colors.success } },
  warning: { wrap: { backgroundColor: colors.warningMuted }, text: { color: colors.warning } },
  danger: { wrap: { backgroundColor: colors.dangerMuted }, text: { color: colors.danger } },
  primary: { wrap: { backgroundColor: colors.primaryMuted }, text: { color: colors.primary } },
};

// ---- Empty / error / loading states ----

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.emptyWrap}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.emptySubtitle, { marginTop: spacing.md }]}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>Couldn't load this</Text>
      <Text style={styles.emptySubtitle}>{message}</Text>
      {onRetry && <Button title="Try again" variant="secondary" onPress={onRetry} style={{ marginTop: spacing.md }} />}
    </View>
  );
}

// ---- Section header ----

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  flexFill: { flex: 1 },
  screenPadding: { padding: spacing.lg },
  scrollContent: { flexGrow: 1, backgroundColor: colors.bg },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },

  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: '600' },

  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: { ...typography.label, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 12, marginTop: 4 },

  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyTitle: { ...typography.h3, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle: { ...typography.bodyMuted, textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3 },
});
