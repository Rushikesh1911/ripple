import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { tripStore } from '@/store/tripStore';
import { useThemeColor } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [trip, setTrip] = useState(tripStore.getTrip());
  const [isLoading, setIsLoading] = useState(tripStore.isLoading);
  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryColor = useThemeColor('secondaryText');

  useEffect(() => {
    tripStore.fetchLatestTrip();
    const unsubscribe = tripStore.subscribe(() => {
      setTrip(tripStore.getTrip());
      setIsLoading(tripStore.isLoading);
    });
    return unsubscribe;
  }, []);



  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: secondaryColor }}>Loading your trips...</Text>
      </View>
    );
  }

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] 
    || user?.email?.split('@')[0] 
    || 'Traveler';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: textColor }]}>RIPPLE</Text>
      </View>
      
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: secondaryColor }]}>Good morning, {displayName}</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>Your journey, under control.</Text>
      </View>

      {!trip ? (
        <Card variant="default" style={styles.emptyCard}>
          <Feather name="map" size={32} color={secondaryColor} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No active trips</Text>
          <Text style={[styles.emptySubtitle, { color: secondaryColor }]}>
            It looks like you don't have any upcoming journeys planned.
          </Text>
          <Button 
            label="Plan a new trip" 
            variant="outline"
            onPress={() => {}}
            style={{ marginTop: 24 }}
          />
        </Card>
      ) : (
        <Card variant="default" style={styles.tripCard}>
          <Text style={[styles.tripTitle, { color: textColor }]}>{trip.title}</Text>
          
          <View style={styles.tripStats}>
            <Feather name="shield" size={14} color={useThemeColor('protected')} />
            <Text style={[styles.tripStatText, { color: useThemeColor('protected') }]}>On track</Text>
            
            <View style={[styles.dot, { backgroundColor: secondaryColor }]} />
            
            <Feather name="layers" size={14} color={secondaryColor} />
            <Text style={[styles.tripStatText, { color: secondaryColor }]}>{trip.bookings.length} Bookings</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricBadge, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
              <Feather name="clock" size={14} color={useThemeColor('tint')} />
              <Text style={[styles.metricText, { color: textColor }]}>45m saved</Text>
            </View>
            <View style={[styles.metricBadge, { backgroundColor: 'rgba(0,255,100,0.05)' }]}>
              <Feather name="dollar-sign" size={14} color={useThemeColor('protected')} />
              <Text style={[styles.metricText, { color: textColor }]}>₹800 recovered</Text>
            </View>
          </View>

          {trip.bookings.length > 0 && (
            <View style={styles.nextUp}>
              <Text style={[styles.nextUpLabel, { color: secondaryColor }]}>Next:</Text>
              <Text style={[styles.nextUpValue, { color: textColor }]}>
                {trip.bookings[0].title} · {new Date(trip.bookings[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}

          <Button 
            label="View itinerary" 
            variant="outline"
            onPress={() => router.push(`/trip/${trip.id}`)}
            style={{ marginTop: 24 }}
          />
        </Card>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  header: {
    marginBottom: 40,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
  },
  tripCard: {
    padding: 24,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  tripStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  tripStatText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nextUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
  },
  nextUpLabel: {
    fontSize: 14,
  },
  nextUpValue: {
    fontSize: 14,
    fontWeight: '500',
  }
});
