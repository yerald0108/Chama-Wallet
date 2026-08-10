// src/components/ui/Badge.tsx
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, radii, spacing } from '@/theme/tokens'

type BadgeStatus = 'success' | 'warning' | 'error' | 'pending' | 'neutral'

interface BadgeProps {
  label:   string
  status?: BadgeStatus
}

export function Badge({ label, status = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[status]]}>
      <View style={[styles.dot, styles[`dot_${status}`]]} />
      <Text style={[styles.label, styles[`label_${status}`]]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing[1],
    paddingVertical:   4,
    paddingHorizontal: 10,
    borderRadius:   radii.full,
    alignSelf:      'flex-start',
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: radii.full,
  },
  label: {
    fontSize:      typography.sizes.xs,
    fontWeight:    typography.weights.semibold,
    letterSpacing: typography.letterSpacings.wide,
  },

  // Fondos
  success: { backgroundColor: colors.tealLight },
  warning: { backgroundColor: colors.goldLight },
  error:   { backgroundColor: colors.coralLight },
  pending: { backgroundColor: colors.goldLight },
  neutral: { backgroundColor: colors.borderSubtle },

  // Puntos
  dot_success: { backgroundColor: colors.teal },
  dot_warning: { backgroundColor: colors.gold },
  dot_error:   { backgroundColor: colors.coral },
  dot_pending: { backgroundColor: colors.gold },
  dot_neutral: { backgroundColor: colors.textTertiary },

  // Textos
  label_success: { color: colors.teal },
  label_warning: { color: colors.gold },
  label_error:   { color: colors.coral },
  label_pending: { color: colors.gold },
  label_neutral: { color: colors.textSecondary },
})