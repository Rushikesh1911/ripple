import React from 'react';
import { View, StyleSheet, ViewProps, Text } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme';

export type BadgeStatus = 'disrupted' | 'atRisk' | 'protected' | 'recovered' | 'neutral' | 'impacted';

export interface BadgeProps extends ViewProps {
  status: BadgeStatus;
  label: string;
}

export function Badge({ status, label, style, ...props }: BadgeProps) {
  // Map status to theme color key
  let colorKey: string = 'text';
  if (status === 'disrupted' || status === 'impacted') colorKey = 'disrupted';
  else if (status === 'atRisk') colorKey = 'atRisk';
  else if (status === 'protected' || status === 'recovered') colorKey = 'protected';

  const color = useThemeColor(colorKey as any);

  // We want a subtle background. A common trick is opacity.
  // For Expo/React Native, it's easier to just pass the color and apply opacity to the bg, 
  // but since we only have hex codes, we'll use a generic neutral subtle bg if we don't have rgba.
  // Alternatively, we use the accentSurface. Let's just use the raw color with opacity for web, 
  // or a fallback subtle border. We'll just use a solid border and subtle text color or vice-versa.
  
  return (
    <View
      style={[
        styles.badge,
        { borderColor: color, backgroundColor: `${color}1A` }, // 10% opacity hex
        style,
      ]}
      {...props}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
