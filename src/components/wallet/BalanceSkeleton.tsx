// src/components/wallet/BalanceSkeleton.tsx
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { colors, radii, spacing } from '@/theme/tokens'

export function BalanceSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue:         1,
          duration:        800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue:         0.3,
          duration:        800,
          useNativeDriver: true,
        }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.label} />
      <View style={styles.balance} />
      <View style={styles.sublabel} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap:        spacing[3],
    width:      '100%',
    padding:    spacing[5],
  },
  label: {
    height:          12,
    width:           120,
    backgroundColor: colors.ink3,
    borderRadius:    radii.full,
  },
  balance: {
    height:          52,
    width:           180,
    backgroundColor: colors.ink3,
    borderRadius:    radii.md,
  },
  sublabel: {
    height:          12,
    width:           80,
    backgroundColor: colors.ink3,
    borderRadius:    radii.full,
  },
})