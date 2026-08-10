// src/components/shared/OfflineBanner.tsx
import { View, Text, StyleSheet } from 'react-native'
import { WifiOff } from 'lucide-react-native'
import { useOfflineStore } from '@/stores/offlineStore'
import { colors, typography, spacing } from '@/theme/tokens'

export function OfflineBanner() {
  const online = useOfflineStore(s => s.online)

  if (online) return null

  return (
    <View style={styles.banner}>
      <WifiOff size={14} color={colors.gold} />
      <Text style={styles.texto}>
        Sin conexión — mostrando último saldo conocido
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor:   colors.goldLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
    paddingVertical:   spacing[2],
    paddingHorizontal: spacing[5],
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[2],
  },
  texto: {
    fontSize:   typography.sizes.xs,
    color:      colors.gold,
    fontWeight: typography.weights.medium,
    flex:       1,
  },
})