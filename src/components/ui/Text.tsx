// src/components/ui/Text.tsx
import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native'
import { colors, typography } from '@/theme/tokens'

type TextVariant = 'display' | 'heading' | 'subheading' | 'body' | 'caption' | 'mono'
type TextColor   = 'primary' | 'secondary' | 'tertiary' | 'teal' | 'gold' | 'coral'

interface TextProps extends RNTextProps {
  variant?: TextVariant
  color?:   TextColor
  bold?:    boolean
  center?:  boolean
}

export function AppText({
  variant = 'body',
  color   = 'primary',
  bold    = false,
  center  = false,
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        styles[`color_${color}`],
        bold   && styles.bold,
        center && styles.center,
        style,
      ]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    color:    colors.textPrimary,
    fontSize: typography.sizes.base,
  },

  // Variantes
  display: {
    fontSize:      typography.sizes['3xl'],
    fontWeight:    typography.weights.extrabold,
    letterSpacing: typography.letterSpacings.tight,
    lineHeight:    typography.sizes['3xl'] * typography.lineHeights.tight,
  },
  heading: {
    fontSize:   typography.sizes.xl,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  subheading: {
    fontSize:   typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  body: {
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  caption: {
    fontSize:      typography.sizes.xs,
    fontWeight:    typography.weights.regular,
    color:         colors.textSecondary,
    letterSpacing: typography.letterSpacings.wide,
  },
  mono: {
    fontSize:      typography.sizes.sm,
    fontWeight:    typography.weights.medium,
    letterSpacing: typography.letterSpacings.normal,
  },

  // Colores
  color_primary:   { color: colors.textPrimary },
  color_secondary: { color: colors.textSecondary },
  color_tertiary:  { color: colors.textTertiary },
  color_teal:      { color: colors.teal },
  color_gold:      { color: colors.gold },
  color_coral:     { color: colors.coral },

  bold:   { fontWeight: typography.weights.bold },
  center: { textAlign: 'center' },
})