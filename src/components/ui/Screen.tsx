// src/components/ui/Screen.tsx
import { View, ScrollView, StyleSheet, type ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, layout } from '@/theme/tokens'

interface ScreenProps extends ViewProps {
  scroll?:   boolean
  padded?:   boolean
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

  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            padded   && styles.padded,
            centered && styles.centered,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.base,
          padded   && styles.padded,
          centered && styles.centered,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: colors.ink,
  },
  base: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical:   layout.screenPaddingV,
  },
  centered: {
    alignItems:     'center',
    justifyContent: 'center',
  },
})