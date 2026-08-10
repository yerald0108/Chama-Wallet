// src/components/ui/Card.tsx
import { View, StyleSheet, type ViewProps } from 'react-native'
import { colors, radii, layout, shadows } from '@/theme/tokens'

type CardVariant = 'default' | 'elevated' | 'outlined' | 'teal'

interface CardProps extends ViewProps {
  variant?: CardVariant
  padding?: number
}

export function Card({
  variant = 'default',
  padding = layout.cardPadding,
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    width:        '100%',
  },
  default: {
    backgroundColor: colors.ink2,
    borderWidth:     1,
    borderColor:     colors.borderSubtle,
  },
  elevated: {
    backgroundColor: colors.ink2,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.transparent,
    borderWidth:     1.5,
    borderColor:     colors.borderDefault,
  },
  teal: {
    backgroundColor: colors.tealLight,
    borderWidth:     1,
    borderColor:     colors.teal,
  },
})