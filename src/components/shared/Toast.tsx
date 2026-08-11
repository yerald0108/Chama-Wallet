// src/components/shared/Toast.tsx
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View, Pressable } from 'react-native'
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUIStore } from '@/stores/uiStore'
import { colors, typography, spacing, radii, zIndex, shadows } from '@/theme/tokens'

export function Toast() {
  const toast        = useUIStore(s => s.toast)
  const ocultarToast = useUIStore(s => s.ocultarToast)
  const insets       = useSafeAreaInsets()
  const opacity      = useRef(new Animated.Value(0)).current
  const translateY   = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.spring(opacity,    { toValue: 1, useNativeDriver: true, tension: 100 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 100 }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [toast])

  if (!toast) return null

  const config = {
    exito:       { color: colors.teal,  bg: '#0A2420', border: colors.tealDark, Icon: CheckCircle  },
    error:       { color: colors.coral, bg: '#2A1010', border: colors.coral,    Icon: AlertCircle  },
    advertencia: { color: colors.gold,  bg: '#2A1E00', border: colors.gold,     Icon: AlertTriangle },
  }[toast.tipo]

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform:   [{ translateY }],
          top:         insets.top + spacing[3],
          backgroundColor: config.bg,
          borderColor:     config.border,
        },
      ]}
    >
      <config.Icon size={18} color={config.color} strokeWidth={2} />
      <Text style={[styles.mensaje, { color: config.color }]}>
        {toast.mensaje}
      </Text>
      <Pressable onPress={ocultarToast} hitSlop={8}>
        <X size={16} color={config.color} />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position:          'absolute',
    left:              spacing[4],
    right:             spacing[4],
    zIndex:            zIndex.toast,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[3],
    paddingVertical:   spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius:      radii.lg,
    borderWidth:       1.5,
    ...shadows.lg,
  },
  mensaje: {
    flex:       1,
    fontSize:   typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    lineHeight: 20,
  },
})