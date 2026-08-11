// src/components/ui/PinPad.tsx
import { View, Pressable, StyleSheet, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Delete } from 'lucide-react-native'
import { colors, typography, radii, spacing } from '@/theme/tokens'

interface PinPadProps {
  value:       string
  onChange:    (value: string) => void
  maxLength?:  number
  disabled?:   boolean
}

const TECLAS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
]

export function PinPad({
  value,
  onChange,
  maxLength = 4,
  disabled  = false,
}: PinPadProps) {

  async function handleTecla(tecla: string) {
    if (disabled) return

    if (tecla === 'del') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onChange(value.slice(0, -1))
      return
    }

    if (tecla === '') return

    if (value.length >= maxLength) return

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(value + tecla)
  }

  return (
    <View style={styles.container}>
      {/* Indicadores de dígitos */}
      <View style={styles.indicadores}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicador,
              i < value.length && styles.indicadorActivo,
            ]}
          />
        ))}
      </View>

      {/* Teclado */}
      <View style={styles.teclado}>
        {TECLAS.map((fila, fi) => (
          <View key={fi} style={styles.fila}>
            {fila.map((tecla, ti) => (
              <Pressable
                key={ti}
                onPress={() => handleTecla(tecla)}
                disabled={disabled || tecla === ''}
                style={({ pressed }) => [
                  styles.tecla,
                  tecla === '' && styles.teclaVacia,
                  pressed && tecla !== '' && styles.teclaPresionada,
                  disabled && styles.teclaDeshabilitada,
                ]}
              >
                {tecla === 'del' ? (
                  <Delete size={22} color={colors.textPrimary} />
                ) : (
                  <Text style={styles.teclaTexto}>{tecla}</Text>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width:      '100%',
    alignItems: 'center',
    gap:        spacing[8],
  },
  indicadores: {
    flexDirection: 'row',
    gap:           spacing[4],
  },
  indicador: {
    width:           16,
    height:          16,
    borderRadius:    8,
    borderWidth:     2,
    borderColor:     colors.borderStrong,
    backgroundColor: colors.transparent,
  },
  indicadorActivo: {
    backgroundColor: colors.teal,
    borderColor:     colors.teal,
  },
  teclado: {
    width: '100%',
    gap:   spacing[3],
  },
  fila: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    gap:            spacing[3],
  },
  tecla: {
    flex:            1,
    height:          64,
    borderRadius:    radii.lg,
    backgroundColor: colors.ink2,
    borderWidth:     1,
    borderColor:     colors.borderSubtle,
    alignItems:      'center',
    justifyContent:  'center',
  },
  teclaVacia: {
    backgroundColor: colors.transparent,
    borderColor:     colors.transparent,
  },
  teclaPresionada: {
    backgroundColor: colors.ink3,
    borderColor:     colors.teal,
  },
  teclaDeshabilitada: {
    opacity: 0.4,
  },
  teclaTexto: {
    fontSize:   typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color:      colors.textPrimary,
  },
})