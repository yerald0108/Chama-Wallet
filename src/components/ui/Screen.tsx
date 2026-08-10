// src/components/ui/Screen.tsx
import { View, ScrollView, StyleSheet, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, layout } from '@/theme/tokens'

interface ScreenProps extends ViewProps {
  scroll?:  boolean
  padded?:  boolean
  centered?: boolean
}

export function Screen({
  scroll   = false,
  padded   = true,
  centered = false,
  style,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets()

  const containerStyle = [
    styles.base,
    {
      paddingTop:    insets.top,
      paddingBottom: insets.bottom,
    },
    padded && styles.padded,
    centered && styles.centered,
    style,
  ]

  if (scroll) {
    return (
      <ScrollView
        style={styles.base}
        contentContainerStyle={[
          styles.scrollContent,
          padded   && styles.padded,
          centered && styles.centered,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex:            1,
    backgroundColor: colors.ink,
  },
  padded: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical:   layout.screenPaddingV,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    alignItems:     'center',
    justifyContent: 'center',
  },
})