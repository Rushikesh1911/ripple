import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'outline' | 'elevated';
}

export function Card({ style, variant = 'default', children, ...props }: CardProps) {
  const backgroundColor = useThemeColor('card');
  const borderColor = useThemeColor('border');

  return (
    <View
      style={[
        styles.card,
        { backgroundColor },
        variant === 'outline' && { borderWidth: 1, borderColor },
        variant === 'elevated' && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
