import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useThemeColor } from '@/hooks/use-theme';

export function BottomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const backgroundColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const secondaryText = useThemeColor('secondaryText');
  const tint = useThemeColor('tint');
  const accentSurface = useThemeColor('accentSurface');

  const navItems = [
    { name: 'Overview', icon: 'grid', route: '/' },
    { name: 'Itinerary', icon: 'map', route: '/trip/t1' },
    { name: 'Alerts', icon: 'bell', route: '/alerts' },
    { name: 'Profile', icon: 'user', route: '/profile' }, 
  ];

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16, backgroundColor }]}>
      <View style={styles.container}>
        {navItems.map((item, index) => {
            const isActive = pathname === item.route;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.navItem,
                  isActive && { backgroundColor: accentSurface }
                ]}
                onPress={() => item.route && router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <Feather 
                  name={item.icon as any} 
                  size={20} 
                  color={isActive ? tint : secondaryText} 
                />
                <Text style={[
                  styles.navLabel, 
                  { color: isActive ? tint : secondaryText },
                  isActive && { fontWeight: '600' }
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          
        <TouchableOpacity 
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push('/analytics')}
        >
          <View style={[styles.fabInner, { backgroundColor: tint }]}>
            <Feather name="bar-chart-2" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 64,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  fabInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
