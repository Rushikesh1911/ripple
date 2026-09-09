import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { supabase } from '@/lib/supabase';
import { useThemeColor } from '@/hooks/use-theme';
import { Button } from '@/components/ui/Button';

export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryColor = useThemeColor('secondaryText');
  const borderColor = useThemeColor('border');

  async function verifyCode() {
    if (otp.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter the code sent to your email.'
      });
      return;
    }

    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email address is missing.'
      });
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Email verified successfully!'
      });
      // The auth listener will automatically detect the new session and redirect to /
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo_light.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: textColor }]}>Verify your email</Text>
        <Text style={[styles.subtitle, { color: secondaryColor }]}>
          We sent a code to {email || 'your email'}
        </Text>
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Enter code"
            placeholderTextColor={secondaryColor}
            onChangeText={setOtp}
            value={otp}
            keyboardType="number-pad"
            maxLength={8}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <Button 
            label={loading ? "Verifying..." : "Verify"} 
            onPress={verifyCode} 
            disabled={loading || otp.length < 6}
            style={styles.button}
          />
          
          <Button 
            label="Back to Sign In" 
            variant="ghost"
            onPress={() => router.replace('/(auth)/sign-in')} 
            style={styles.linkButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
  },
  linkButton: {
    marginTop: 8,
  }
});
