import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { supabase } from '@/lib/supabase';
import { useThemeColor } from '@/hooks/use-theme';
import { Button } from '@/components/ui/Button';
import Feather from '@expo/vector-icons/Feather';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryColor = useThemeColor('secondaryText');
  const borderColor = useThemeColor('border');
  const primaryColor = useThemeColor('tint');

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Sign In Failed',
        text2: error.message
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Signed in successfully.'
      });
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
        <Text style={[styles.title, { color: textColor }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: secondaryColor }]}>Sign in to your Ripple account</Text>
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Email Address"
            placeholderTextColor={secondaryColor}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { color: textColor, borderColor }]}
              placeholder="Password"
              placeholderTextColor={secondaryColor}
              onChangeText={setPassword}
              value={password}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={secondaryColor} />
            </TouchableOpacity>
          </View>
          
          <Button 
            label={loading ? "Signing in..." : "Sign In"} 
            onPress={signInWithEmail} 
            disabled={loading}
            style={styles.button}
          />
          
          <Button 
            label="Don't have an account? Sign Up" 
            variant="ghost"
            onPress={() => router.push('/(auth)/sign-up')} 
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
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 8,
  }
});
