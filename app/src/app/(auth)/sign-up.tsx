import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { supabase } from '@/lib/supabase';
import { useThemeColor } from '@/hooks/use-theme';
import { Button } from '@/components/ui/Button';
import Feather from '@expo/vector-icons/Feather';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  
  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryColor = useThemeColor('secondaryText');
  const borderColor = useThemeColor('border');
  const primaryColor = useThemeColor('tint');

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match.'
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: error.message
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Redirecting to verification...'
      });
      // Redirect to verification screen
      router.push(`/(auth)/verify?email=${encodeURIComponent(email)}`);
    }
    
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo_light.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: textColor }]}>Create an account</Text>
        <Text style={[styles.subtitle, { color: secondaryColor }]}>Start managing your journeys</Text>
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Full Name"
            placeholderTextColor={secondaryColor}
            onChangeText={setFullName}
            value={fullName}
          />
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Email Address"
            placeholderTextColor={secondaryColor}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <View style={[styles.phoneContainer, { borderColor }]}>
            <View style={styles.countryCode}>
              <Text style={{ color: textColor }}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, { color: textColor }]}
              placeholder="Phone Number"
              placeholderTextColor={secondaryColor}
              onChangeText={setPhone}
              value={phone}
              keyboardType="phone-pad"
            />
          </View>

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
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { color: textColor, borderColor }]}
              placeholder="Confirm Password"
              placeholderTextColor={secondaryColor}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={secondaryColor} />
            </TouchableOpacity>
          </View>
          
          <Button 
            label={loading ? "Signing up..." : "Sign Up"} 
            onPress={signUpWithEmail} 
            disabled={loading}
            style={styles.button}
          />
          
          <Button 
            label="Already have an account? Sign In" 
            variant="ghost"
            onPress={() => router.back()} 
            style={styles.linkButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 32,
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
  phoneContainer: {
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  countryCode: {
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(150, 150, 150, 0.2)',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 8,
  }
});
