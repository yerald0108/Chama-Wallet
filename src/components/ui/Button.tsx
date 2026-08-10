// src/components/ui/Button.tsx
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, typography, radii, layout, durations } from '@/theme/tokens'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize    = 'md' | 'sm'

interface ButtonProps {
  label:      string
  onPress:    () => void
  variant?:   ButtonVariant
  size?:      ButtonSize
  loading?:   boolean
  disabled?:  boolean
  fullWidth?: boolean
  icon?:      React.ReactNode
  style?:     ViewStyle
}

export function Button({
  label,
  onPress,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  fullWidth = true,
  icon,
  style,
}: ButtonProps) {

  const isDisabled = disabled || loading

  async function handlePress() {
    if (isDisabled) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.ink : colors.teal}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius:   radii.lg,
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'row',
  },
  fullWidth: {
    width: '100%',
  },

  // Variantes
  primary: {
    backgroundColor: colors.teal,
  },
  secondary: {
    backgroundColor: colors.transparent,
    borderWidth:     1.5,
    borderColor:     colors.teal,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.coralLight,
    borderWidth:     1,
    borderColor:     colors.coral,
  },

  // Tamaños
  md: {
    height:            layout.buttonHeight,
    paddingHorizontal: 24,
  },
  sm: {
    height:            layout.buttonHeightSm,
    paddingHorizontal: 16,
  },

  // Estados
  pressed: {
    opacity:   0.82,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.38,
  },

  // Labels
  content: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  iconWrapper: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight:    typography.weights.bold,
    letterSpacing: typography.letterSpacings.wide,
  },
  label_primary: {
    color: colors.ink,
  },
  label_secondary: {
    color: colors.teal,
  },
  label_ghost: {
    color: colors.textSecondary,
  },
  label_danger: {
    color: colors.coral,
  },
  label_md: {
    fontSize: typography.sizes.base,
  },
  label_sm: {
    fontSize: typography.sizes.sm,
  },
})