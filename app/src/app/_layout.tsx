import { DarkTheme, DefaultTheme, ThemeProvider, Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { useEffect } from 'react';
import { 
  useFonts, 
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold 
} from '@expo-google-fonts/outfit';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BottomTabBar } from '@/components/ui/BottomTabBar';

import { AppThemeProvider, useThemeContext } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { CustomToastProvider } from '@/components/ui/CustomToast';

SplashScreen.preventAutoHideAsync();

function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/');
    }
  }, [user, isLoading, segments]);

  // If loading auth, just show the splash overlay background or nothing
  if (isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {user && <BottomTabBar />}
    </View>
  );
}

function RootLayoutNav() {
  const { activeTheme } = useThemeContext();
  return (
    <ThemeProvider value={activeTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <ProtectedLayout />
      <CustomToastProvider />
    </ThemeProvider>
  );
}

export default function TabLayout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <AppThemeProvider>
        <RootLayoutNav />
      </AppThemeProvider>
    </AuthProvider>
  );
}
