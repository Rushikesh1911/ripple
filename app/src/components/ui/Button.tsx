import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export function Button({ label, variant = 'primary', isLoading, style, disabled, ...props }: ButtonProps) {
  const primaryColor = useThemeColor('tint');
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');
  const dangerColor = useThemeColor('disrupted');
  const accentSurface = useThemeColor('accentSurface');
  const secondaryText = useThemeColor('secondaryText');

  let bg = primaryColor;
  let textCol = '#FFFFFF';
  let border = 'transparent';

  if (variant === 'secondary') {
    bg = accentSurface;
    textCol = primaryColor;
  } else if (variant === 'outline') {
    bg = 'transparent';
    textCol = textColor;
    border = borderColor;
  } else if (variant === 'danger') {
    bg = dangerColor;
    textCol = '#FFFFFF';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textCol = primaryColor;
  }

  if (disabled) {
    bg = borderColor;
    textCol = secondaryText;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === 'outline' ? 1 : 0 },
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={textCol} />
      ) : (
        <Text style={[styles.text, { color: textCol }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
