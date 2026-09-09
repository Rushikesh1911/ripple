import React from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';
import { Card } from '@/components/ui/Card';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  
  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryText = useThemeColor('secondaryText');
  const tintColor = useThemeColor('tint');
  const protectedColor = useThemeColor('protected');
  const borderCol = useThemeColor('border');
  const accentSurface = useThemeColor('accentSurface');

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.suptitle, { color: secondaryText }]}>INSIGHTS</Text>
          <Text style={[styles.title, { color: textColor }]}>Your Analytics</Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            See the value Ripple is delivering across your journeys.
          </Text>
        </View>

        {/* Hero Stat */}
        <Card variant="outline" style={[styles.heroCard, { borderColor: tintColor }]}>
          <View style={[styles.iconBox, { backgroundColor: accentSurface }]}>
            <Feather name="shield" size={24} color={tintColor} />
          </View>
          <Text style={[styles.heroMetric, { color: textColor }]}>14</Text>
          <Text style={[styles.heroLabel, { color: secondaryText }]}>Disruptions Managed</Text>
          <View style={[styles.trendBadge, { backgroundColor: 'rgba(0,255,100,0.1)' }]}>
            <Feather name="trending-up" size={12} color={protectedColor} />
            <Text style={[styles.trendText, { color: protectedColor }]}>This year</Text>
          </View>
        </Card>

        {/* Grid Stats */}
        <View style={styles.grid}>
          <Card variant="default" style={styles.gridCard}>
            <Feather name="clock" size={20} color={tintColor} style={styles.gridIcon} />
            <Text style={[styles.gridMetric, { color: textColor }]}>28.5h</Text>
            <Text style={[styles.gridLabel, { color: secondaryText }]}>Time Saved</Text>
          </Card>
          <Card variant="default" style={styles.gridCard}>
            <Feather name="dollar-sign" size={20} color={protectedColor} style={styles.gridIcon} />
            <Text style={[styles.gridMetric, { color: textColor }]}>$450</Text>
            <Text style={[styles.gridLabel, { color: secondaryText }]}>Value Recovered</Text>
          </Card>
        </View>

        {/* Performance Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Performance Breakdown</Text>
          
          <Card variant="default" style={styles.listCard}>
            <View style={styles.listItem}>
              <View style={styles.listLeft}>
                <View style={[styles.listIconBox, { backgroundColor: 'rgba(50,50,50,0.05)' }]}>
                  <Feather name="navigation-2" size={16} color={textColor} />
                </View>
                <Text style={[styles.listTitle, { color: textColor }]}>Transfers Rebooked</Text>
              </View>
              <Text style={[styles.listValue, { color: textColor }]}>8</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: borderCol }]} />
            
            <View style={styles.listItem}>
              <View style={styles.listLeft}>
                <View style={[styles.listIconBox, { backgroundColor: 'rgba(50,50,50,0.05)' }]}>
                  <Feather name="home" size={16} color={textColor} />
                </View>
                <Text style={[styles.listTitle, { color: textColor }]}>Hotels Adjusted</Text>
              </View>
              <Text style={[styles.listValue, { color: textColor }]}>4</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: borderCol }]} />
            
            <View style={styles.listItem}>
              <View style={styles.listLeft}>
                <View style={[styles.listIconBox, { backgroundColor: 'rgba(50,50,50,0.05)' }]}>
                  <Feather name="map-pin" size={16} color={textColor} />
                </View>
                <Text style={[styles.listTitle, { color: textColor }]}>Activities Rescheduled</Text>
              </View>
              <Text style={[styles.listValue, { color: textColor }]}>2</Text>
            </View>
          </Card>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  suptitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  heroCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
    borderWidth: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroMetric: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 16,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  gridCard: {
    flex: 1,
    padding: 20,
  },
  gridIcon: {
    marginBottom: 16,
  },
  gridMetric: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  listValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  }
});
