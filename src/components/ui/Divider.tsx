// src/components/ui/Divider.tsx
import { View, StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme/tokens'

interface DividerProps {
  marginV?: number
}

export function Divider({ marginV = spacing[4] }: DividerProps) {
  return (
    <View style={[styles.line, { marginVertical: marginV }]} />
  )
}

const styles = StyleSheet.create({
  line: {
    height:          1,
    width:           '100%',
    backgroundColor: colors.borderSubtle,
  },
})