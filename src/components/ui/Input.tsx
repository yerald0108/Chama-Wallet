// src/components/ui/Input.tsx
import { useState } from 'react'
import {
  View, TextInput, Text, Pressable, StyleSheet,
  type TextInputProps, type StyleProp, type TextStyle,
} from 'react-native'
import { colors, typography, radii, layout, spacing } from '@/theme/tokens'

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?:            string
  error?:            string
  hint?:             string
  icon?:             React.ReactNode
  iconRight?:        React.ReactNode
  onIconRightPress?: () => void
}

export function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  onIconRightPress,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false)

  const hasError = Boolean(error)

  const inputStyles: StyleProp<TextStyle>[] = [styles.input]
  if (icon)      inputStyles.push(styles.inputWithIconLeft)
  if (iconRight) inputStyles.push(styles.inputWithIconRight)

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[
        styles.container,
        focused  && styles.containerFocused,
        hasError && styles.containerError,
        props.editable === false && styles.containerDisabled,
      ]}>
        {icon && (
          <View style={styles.iconLeft}>{icon}</View>
        )}

        <TextInput
          style={inputStyles}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {iconRight && (
          <Pressable
            onPress={onIconRightPress}
            style={styles.iconRight}
            hitSlop={8}
          >
            {iconRight}
          </Pressable>
        )}
      </View>

      {hasError && (
        <Text style={styles.error}>{error}</Text>
      )}
      {!hasError && hint && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap:   spacing[1],
  },
  label: {
    fontSize:     typography.sizes.sm,
    fontWeight:   typography.weights.medium,
    color:        colors.textSecondary,
    marginBottom: spacing[1],
  },
  container: {
    height:            layout.inputHeight,
    backgroundColor:   colors.ink2,
    borderRadius:      radii.lg,
    borderWidth:       1.5,
    borderColor:       colors.borderDefault,
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: spacing[4],
  },
  containerFocused: {
    borderColor: colors.teal,
  },
  containerError: {
    borderColor: colors.coral,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex:       1,
    color:      colors.textPrimary,
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.regular,
    height:     '100%',
  },
  inputWithIconLeft: {
    marginLeft: spacing[2],
  },
  inputWithIconRight: {
    marginRight: spacing[2],
  },
  iconLeft: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  iconRight: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  error: {
    fontSize:  typography.sizes.xs,
    color:     colors.coral,
    marginTop: spacing[1],
  },
  hint: {
    fontSize:  typography.sizes.xs,
    color:     colors.textTertiary,
    marginTop: spacing[1],
  },
})