import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { tripStore } from '@/store/tripStore';
import { generateRecoveryPlan } from '@/engine/recoveryEngine';
import { TravelerPreference } from '@/engine/types';
import { useThemeColor } from '@/hooks/use-theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import { alertsStore } from '@/store/alertsStore';

interface PreferenceTabProps {
  value: TravelerPreference;
  label: string;
  currentPreference: TravelerPreference;
  onPress: (val: TravelerPreference) => void;
}

function PreferenceTab({ value, label, currentPreference, onPress }: PreferenceTabProps) {
  const primaryAccent = useThemeColor('tint');
  const secondaryText = useThemeColor('secondaryText');
  const borderCol = useThemeColor('border');
  const accentSurface = useThemeColor('accentSurface');

  const isSelected = currentPreference === value;

  return (
    <Pressable
      style={[
        styles.prefTab,
        { 
          backgroundColor: isSelected ? accentSurface : 'transparent',
          borderColor: isSelected ? primaryAccent : borderCol,
        }
      ]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.prefText, { color: isSelected ? primaryAccent : secondaryText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

export default function RecoveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [preference, setPreference] = useState<TravelerPreference>('balanced');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryText = useThemeColor('secondaryText');
  const primaryAccent = useThemeColor('tint');
  const borderCol = useThemeColor('border');
  const accentSurface = useThemeColor('accentSurface');
  const options = useMemo(() => {
    const currentTrip = tripStore.getTrip();
    if (!tripStore.impactReport || !currentTrip) return [];
    return generateRecoveryPlan(currentTrip.bookings, tripStore.impactReport, preference);
  }, [tripStore.impactReport, preference]);

  const handleRecover = async () => {
    if (isUpdating || options.length === 0) return;
    setIsUpdating(true);
    
    const option = options[activeIndex];
    
    if (option) {
      for (const [updateBookingId, updates] of Object.entries(option.suggestedUpdates)) {
        const finalUpdates = { ...updates };
        
        if (updateBookingId === option.bookingId && option.timeDelta > 0) {
          const currentTrip = tripStore.getTrip();
          const currentBooking = currentTrip?.bookings.find(b => b.id === updateBookingId);
          if (currentBooking) {
            const start = new Date(currentBooking.startTime);
            start.setMinutes(start.getMinutes() + option.timeDelta);
            finalUpdates.startTime = start.toISOString();
            
            const end = new Date(currentBooking.endTime);
            end.setMinutes(end.getMinutes() + option.timeDelta);
            finalUpdates.endTime = end.toISOString();
          }
        }

        const success = await tripStore.updateBooking(updateBookingId, finalUpdates);
        if (!success) {
          console.error(`Failed to update booking ${updateBookingId}.`);
        }
      }

      tripStore.clearSimulation();
      await tripStore.fetchLatestTrip();
      
      Toast.show({
        type: 'success',
        text1: 'Itinerary Restored',
        text2: 'Recovery plan applied successfully.'
      });

      alertsStore.addAlert({
        title: 'Recovery Applied',
        message: 'Your itinerary has been updated automatically based on your chosen recovery strategy.',
        type: 'success'
      });
    }

    setIsUpdating(false);
    // Push to a success screen or go back to trip
    const updatedTrip = tripStore.getTrip();
    if (updatedTrip) {
      router.replace(`/trip/${updatedTrip.id}`);
    } else {
      router.replace('/');
    }
  };



  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={[styles.suptitle, { color: secondaryText }]}>RECOVERY OPTIONS</Text>
          <Text style={[styles.title, { color: textColor }]}>Find a way forward</Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            Your flight delay impacted downstream bookings. Select a strategy to repair the itinerary.
          </Text>
        </View>

        {/* Preferences */}
        <View style={styles.prefsContainer}>
          <Text style={[styles.prefsLabel, { color: textColor }]}>What matters most?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <PreferenceTab value="balanced" label="Balance" currentPreference={preference} onPress={setPreference} />
            <PreferenceTab value="cost" label="Save Money" currentPreference={preference} onPress={setPreference} />
            <PreferenceTab value="speed" label="Get there fastest" currentPreference={preference} onPress={setPreference} />
            <PreferenceTab value="minimal_change" label="Minimize Changes" currentPreference={preference} onPress={setPreference} />
          </ScrollView>
        </View>

        <View style={styles.swipeHintContainer}>
          <Feather name="arrow-left" size={14} color={secondaryText} />
          <Text style={[styles.swipeHintText, { color: secondaryText }]}>SWIPE TO COMPARE</Text>
          <Feather name="arrow-right" size={14} color={secondaryText} />
        </View>

        <View style={styles.deckWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={CARD_WIDTH + 16} // card width + gap
            decelerationRate="fast"
            contentContainerStyle={styles.deckContent}
            onMomentumScrollEnd={(e) => {
              const slideSize = CARD_WIDTH + 16;
              const index = Math.round(e.nativeEvent.contentOffset.x / slideSize);
              setActiveIndex(index);
            }}
          >
            {options.map((option, index) => {
              const isRecommended = index === 0;
              const isActive = index === activeIndex;

              return (
                <View key={option.id} style={styles.cardWrapper}>
                  <Card variant={isActive ? 'outline' : 'default'} style={{ borderColor: isActive ? primaryAccent : borderCol, height: '100%' }}>
                    
                    {isRecommended && (
                      <View style={styles.recommendedBadgeWrap}>
                        <Badge status="protected" label="⭐ BEST FIT" />
                      </View>
                    )}

                    <View style={styles.optionHeader}>
                      <View>
                        <Text style={[styles.optionScore, { color: primaryAccent }]}>{option.finalScore}/100 Match</Text>
                        <Text style={[styles.optionTitle, { color: textColor }]}>{option.title}</Text>
                      </View>
                      <Text style={[styles.optionPrice, { color: textColor }]}>+₹{option.costDelta}</Text>
                    </View>

                    <Text style={[styles.optionDesc, { color: secondaryText }]}>{option.description}</Text>

                    <View style={[styles.divider, { backgroundColor: borderCol }]} />

                    <View style={styles.statsGrid}>
                      <View style={styles.statCell}>
                        <Text style={[styles.statLabel, { color: secondaryText }]}>Time Impact</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>+{option.timeDelta} min</Text>
                      </View>
                      <View style={styles.statCell}>
                        <Text style={[styles.statLabel, { color: secondaryText }]}>Bookings Changed</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>{option.bookingsChanged}</Text>
                      </View>
                      <View style={styles.statCell}>
                        <Text style={[styles.statLabel, { color: secondaryText }]}>Risk</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>{option.riskScore < 25 ? 'Low' : option.riskScore < 50 ? 'Medium' : 'High'}</Text>
                      </View>
                    </View>

                    {isRecommended && option.explanation && (
                      <View style={[styles.explanation, { backgroundColor: accentSurface }]}>
                        <Text style={[styles.explTitle, { color: primaryAccent }]}>Why Best Fit?</Text>
                        <Text style={[styles.explText, { color: primaryAccent }]}>{option.explanation}</Text>
                      </View>
                    )}
                  </Card>
                </View>
              );
            })}
          </ScrollView>
          
          <View style={styles.pagination}>
            {options.map((_, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.dot, 
                  { backgroundColor: idx === activeIndex ? primaryAccent : borderCol }
                ]} 
              />
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Floating Action */}
      <View style={[styles.footer, { backgroundColor: bgColor, borderTopColor: borderCol }]}>
        <Button 
          label={isUpdating ? 'Applying Recovery...' : 'Confirm Recovery'}
          isLoading={isUpdating}
          disabled={options.length === 0}
          onPress={handleRecover}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 140 },
  header: { marginBottom: 32 },
  suptitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22 },

  prefsContainer: { marginBottom: 32 },
  prefsLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  prefTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  prefText: { fontSize: 14, fontWeight: '600' },

  swipeHintContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 8 },
  swipeHintText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  deckWrapper: { alignItems: 'center' },
  deckContent: { paddingHorizontal: 0 },
  cardWrapper: { width: CARD_WIDTH, marginRight: 16 },
  
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  
  recommendedBadgeWrap: { position: 'absolute', top: -12, left: 16, zIndex: 10 },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, marginTop: 4 },
  optionScore: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  optionTitle: { fontSize: 18, fontWeight: '700' },
  optionPrice: { fontSize: 18, fontWeight: '700' },
  optionDesc: { fontSize: 14, lineHeight: 20 },

  divider: { height: 1, marginVertical: 16 },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCell: { flex: 1 },
  statLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '600' },

  explanation: { marginTop: 24, padding: 16, borderRadius: 8 },
  explTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  explText: { fontSize: 13, lineHeight: 20 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, borderTopWidth: 1 },
});
