import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor, useThemeContext, ThemeType } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from '@/lib/supabase';

interface ThemeOptionProps {
  value: ThemeType;
  label: string;
  icon: any;
  currentTheme: ThemeType;
  onPress: (val: ThemeType) => void;
}

function ThemeOption({ value, label, icon, currentTheme, onPress }: ThemeOptionProps) {
  const isSelected = currentTheme === value;
  const tintColor = useThemeColor('tint');
  const borderCol = useThemeColor('border');
  const secondaryText = useThemeColor('secondaryText');
  const textColor = useThemeColor('text');
  const accentSurface = useThemeColor('accentSurface');

  return (
    <Pressable 
      style={[
        styles.themeOption, 
        { borderColor: isSelected ? tintColor : borderCol },
        isSelected && { backgroundColor: accentSurface }
      ]}
      onPress={() => onPress(value)}
    >
      <Feather name={icon} size={20} color={isSelected ? tintColor : secondaryText} />
      <Text style={[styles.themeLabel, { color: isSelected ? tintColor : textColor }]}>{label}</Text>
      {isSelected && <Feather name="check" size={16} color={tintColor} style={{ marginLeft: 'auto' }} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { themePref, setThemePref } = useThemeContext();
  const { user } = useAuth();
  
  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryText = useThemeColor('secondaryText');
  const tintColor = useThemeColor('tint');
  const borderCol = useThemeColor('border');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };


  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Profile</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>APPEARANCE</Text>
        <Card variant="default">
          <ThemeOption value="light" label="Light Mode" icon="sun" currentTheme={themePref} onPress={setThemePref} />
          <View style={[styles.divider, { backgroundColor: borderCol }]} />
          <ThemeOption value="dark" label="Dark Mode" icon="moon" currentTheme={themePref} onPress={setThemePref} />
          <View style={[styles.divider, { backgroundColor: borderCol }]} />
          <ThemeOption value="system" label="System Default" icon="smartphone" currentTheme={themePref} onPress={setThemePref} />
        </Card>

        <Text style={[styles.sectionTitle, { color: secondaryText, marginTop: 32 }]}>ACCOUNT</Text>
        <Card variant="default" style={styles.accountCard}>
          <View style={styles.userInfo}>
            <Text style={[styles.userEmail, { color: textColor }]}>{user?.email}</Text>
          </View>
          <Button 
            label="Sign Out" 
            variant="ghost" 
            onPress={handleSignOut} 
            style={styles.signOutButton}
          />
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 8,
    opacity: 0.5,
  },
  accountCard: {
    padding: 16,
  },
  userInfo: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    marginTop: 8,
  }
});
