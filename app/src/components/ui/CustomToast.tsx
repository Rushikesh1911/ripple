import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast, { ToastConfig, BaseToastProps } from 'react-native-toast-message';
import Feather from '@expo/vector-icons/Feather';
import { useThemeColor } from '@/hooks/use-theme';

export function CustomToastProvider() {
  const bgColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const secondaryColor = useThemeColor('secondaryText');
  const borderColor = useThemeColor('border');
  const primaryColor = useThemeColor('tint');

  const toastConfig: ToastConfig = {
    success: ({ text1, text2 }: BaseToastProps) => (
      <View style={[styles.toastContainer, { backgroundColor: bgColor, borderColor: primaryColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
          <Feather name="check-circle" size={20} color={primaryColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.text1, { color: textColor }]}>{text1}</Text>
          {text2 ? <Text style={[styles.text2, { color: secondaryColor }]}>{text2}</Text> : null}
        </View>
      </View>
    ),
    error: ({ text1, text2 }: BaseToastProps) => (
      <View style={[styles.toastContainer, { backgroundColor: bgColor, borderColor: '#ef4444' }]}>
        <View style={[styles.iconContainer, { backgroundColor: '#ef444420' }]}>
          <Feather name="alert-circle" size={20} color="#ef4444" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.text1, { color: textColor }]}>{text1}</Text>
          {text2 ? <Text style={[styles.text2, { color: secondaryColor }]}>{text2}</Text> : null}
        </View>
      </View>
    ),
    info: ({ text1, text2 }: BaseToastProps) => (
      <View style={[styles.toastContainer, { backgroundColor: bgColor, borderColor: borderColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: borderColor }]}>
          <Feather name="info" size={20} color={textColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.text1, { color: textColor }]}>{text1}</Text>
          {text2 ? <Text style={[styles.text2, { color: secondaryColor }]}>{text2}</Text> : null}
        </View>
      </View>
    )
  };

  return <Toast config={toastConfig} />;
}

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Outfit_600SemiBold',
  },
  text2: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
  }
});
