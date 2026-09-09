import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { tripStore } from '@/store/tripStore';
import { ImpactReport } from '@/engine/types';
import { useThemeColor } from '@/hooks/use-theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Feather from '@expo/vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { alertsStore } from '@/store/alertsStore';

const getBookingIcon = (type: string) => {
  switch (type) {
    case 'flight': return 'send';
    case 'hotel': return 'home';
    case 'transfer': return 'navigation-2';
    case 'activity': return 'map-pin';
    default: return 'circle';
  }
};

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function TripItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState(tripStore.getTrip());
  const [impactReport, setImpactReport] = useState<ImpactReport | null>(tripStore.impactReport);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');

  const isRecovered = trip?.bookings.some(b => b.status === 'recovered');

  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryText = useThemeColor('secondaryText');
  const borderColor = useThemeColor('border');
  const tintColor = useThemeColor('tint');
  const protectedColor = useThemeColor('protected');
  const disruptedColor = useThemeColor('disrupted');
  const atRiskColor = useThemeColor('atRisk');
  const accentSurface = useThemeColor('accentSurface');

  useEffect(() => {
    const unsubscribe = tripStore.subscribe(() => {
      setTrip(tripStore.getTrip());
      setImpactReport(tripStore.impactReport);
    });
    return unsubscribe;
  }, []);

  const handleSimulateDisruption = () => {
    if (isSimulating || impactReport) return;
    setIsSimulating(true);
    
    // Fire Toast for wow factor
    Toast.show({
      type: 'error',
      text1: 'Critical Disruption Detected',
      text2: 'Flight BA-202 has been delayed by 3 hours.'
    });

    // Add to alerts hub
    alertsStore.addAlert({
      title: 'Flight Delayed',
      message: 'Flight BA-202 (London) has been delayed by 3 hours. Our Ripple engine is calculating downstream impacts.',
      type: 'warning'
    });

    setTimeout(() => {
      tripStore.simulateDisruptions([{ bookingId: 'b1', type: 'DELAY', delayMinutes: 180 }]);
      setIsSimulating(false);
    }, 1500); 
  };

  const handleReset = () => {
    tripStore.reset();
    setIsSimulating(false);
  };

  if (!trip) {
    return <View style={{ flex: 1, backgroundColor: bgColor }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header with Toggle */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.suptitle, { color: secondaryText }]}>ITINERARY</Text>
            <Text style={[styles.title, { color: textColor }]}>{trip.title}</Text>
          </View>
          
          <View style={[styles.toggleContainer, { borderColor: borderColor }]}>
            <Button 
              label="Timeline" 
              variant={viewMode === 'timeline' ? 'outline' : 'ghost'} 
              onPress={() => setViewMode('timeline')}
            />
            <Button 
              label="Map" 
              variant={viewMode === 'map' ? 'outline' : 'ghost'} 
              onPress={() => setViewMode('map')}
            />
          </View>
        </View>

        {/* RECOVERY SCOREBOARD (P1 Feature) */}
        {isRecovered && (
          <View style={[styles.scoreboard, { borderColor: protectedColor }]}>
            <Text style={[styles.scoreTitle, { color: protectedColor }]}>RECOVERY SUCCESS</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreLeft}>
                <Text style={[styles.scoreBig, { color: textColor }]}>94<Text style={styles.scoreSmall}>/100</Text></Text>
                <Text style={[styles.scoreLabel, { color: secondaryText }]}>RECOVERY SCORE</Text>
              </View>
              <View style={styles.scoreRight}>
                <Text style={[styles.scoreMetric, { color: textColor }]}>₹800 recovered</Text>
                <Text style={[styles.scoreMetric, { color: textColor }]}>45 min delay contained</Text>
                <Text style={[styles.scoreMetric, { color: protectedColor }]}>3 → 0 risks</Text>
              </View>
            </View>
          </View>
        )}

        {/* ANALYZING STATE */}
        {isSimulating && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <Text style={[styles.analyzingText, { color: textColor }]}>ANALYZING IMPACT</Text>
            <Text style={[styles.analyzingSub, { color: secondaryText }]}>
              Evaluating ripple effect across your journey dependencies...
            </Text>
          </View>
        )}

        {/* HEALTHY TIMELINE */}
        {!impactReport && !isSimulating && (
          <View>
            {viewMode === 'timeline' ? (
              <View style={styles.timelineContainer}>
                {trip.bookings.map((booking, index) => {
                  const isLast = index === trip.bookings.length - 1;
                  const iconName = getBookingIcon(booking.type) as any;
                  
                  return (
                    <View key={booking.id} style={styles.timelineRow}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.iconWrapper, { backgroundColor: accentSurface, borderColor: borderColor }]}>
                          <Feather name={iconName} size={14} color={protectedColor} style={booking.type === 'flight' ? { transform: [{ rotate: '45deg' }], marginLeft: -2 } : {}} />
                        </View>
                        {!isLast && <View style={[styles.line, { backgroundColor: borderColor }]} />}
                      </View>
                      <View style={styles.timelineRight}>
                        <View style={styles.bookingHeader}>
                          <Text style={[styles.bookingTitle, { color: textColor }]}>{booking.title}</Text>
                          {booking.status === 'recovered' && <Badge status="recovered" label="Recovered" />}
                        </View>
                        {booking.subtitle && <Text style={[styles.bookingSubtitle, { color: secondaryText }]}>{booking.subtitle}</Text>}
                        <View style={styles.detailsRow}>
                          <Feather name="clock" size={12} color={secondaryText} />
                          <Text style={[styles.detailsText, { color: secondaryText }]}>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                          <Feather name="map-pin" size={12} color={secondaryText} />
                          <Text style={[styles.detailsText, { color: secondaryText }]}>{booking.location}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapContainer}>
                {trip.bookings.map((booking, index) => {
                  const isLast = index === trip.bookings.length - 1;
                  const iconName = getBookingIcon(booking.type) as any;
                  return (
                    <View key={booking.id} style={styles.mapNodeContainer}>
                      <View style={[styles.mapNode, { borderColor: protectedColor, backgroundColor: accentSurface }]}>
                        <Feather name={iconName} size={20} color={protectedColor} />
                      </View>
                      <Text style={[styles.mapNodeTitle, { color: textColor }]}>{booking.type.toUpperCase()}</Text>
                      <Text style={[styles.mapNodeSubtitle, { color: secondaryText }]}>{booking.location.split(' ')[0]}</Text>
                      {!isLast && <View style={[styles.mapConnector, { backgroundColor: protectedColor }]} />}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.developerSection}>
              <Text style={[styles.devTitle, { color: secondaryText }]}>SIMULATION TOOLS</Text>
              <Button 
                label="Simulate Flight Delay (3h)" 
                variant="outline" 
                onPress={handleSimulateDisruption}
              />
            </View>
          </View>
        )}

        {/* IMPACT REPORT (DISRUPTED STATE) */}
        {impactReport && !isSimulating && (
          <View>
            {/* Clean Premium Stats Dashboard */}
            <View style={[styles.impactDashboard, { borderColor: borderColor }]}>
              <View style={styles.impactDashboardHeader}>
                <Feather name="alert-triangle" size={18} color={disruptedColor} />
                <Text style={[styles.impactDashboardTitle, { color: disruptedColor }]}>
                  DISRUPTION DETECTED
                </Text>
              </View>
              
              <View style={[styles.statsGrid, { borderTopColor: borderColor }]}>
                <View style={[styles.statCell, { borderRightColor: borderColor }]}>
                  <Text style={[styles.statValue, { color: textColor }]}>{impactReport.affectedCount}</Text>
                  <Text style={[styles.statLabel, { color: secondaryText }]}>AFFECTED</Text>
                </View>
                <View style={[styles.statCell, { borderRightColor: borderColor }]}>
                  <Text style={[styles.statValue, { color: textColor }]}>{impactReport.atRiskCount}</Text>
                  <Text style={[styles.statLabel, { color: secondaryText }]}>AT RISK</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: textColor }]}>{impactReport.damageScore}</Text>
                  <Text style={[styles.statLabel, { color: secondaryText }]}>SEVERITY</Text>
                </View>
              </View>
            </View>

            {viewMode === 'timeline' ? (
              <View style={styles.timelineContainer}>
                {trip.bookings.map((booking, index) => {
                  const affected = impactReport.affectedBookings[booking.id];
                  const isLast = index === trip.bookings.length - 1;
                  const iconName = getBookingIcon(booking.type) as any;
                  
                  let bStatus = 'protected';
                  let iconColor = protectedColor;
                  
                  if (affected) {
                    if (affected.status === 'DISRUPTED' || affected.status === 'IMPACTED') {
                      bStatus = 'disrupted';
                      iconColor = disruptedColor;
                    } else if (affected.status === 'AT_RISK') {
                      bStatus = 'atRisk';
                      iconColor = atRiskColor;
                    }
                  }

                  return (
                    <View key={booking.id} style={styles.timelineRow}>
                      <View style={styles.timelineLeft}>
                        <View style={[
                          styles.iconWrapper, 
                          { backgroundColor: accentSurface, borderColor: affected ? iconColor : borderColor }
                        ]}>
                          <Feather 
                            name={iconName} 
                            size={14} 
                            color={iconColor} 
                            style={booking.type === 'flight' ? { transform: [{ rotate: '45deg' }], marginLeft: -2 } : {}} 
                          />
                        </View>
                        {!isLast && <View style={[styles.line, { backgroundColor: borderColor }]} />}
                      </View>
                      <View style={styles.timelineRight}>
                        <Text style={[styles.bookingTitle, { color: textColor }]}>{booking.title}</Text>
                        
                        {affected ? (
                          <View style={styles.reasonContainer}>
                            <Badge status={bStatus as any} label={affected.status.replace('_', ' ')} />
                            <Text style={[styles.reasonText, { color: iconColor }]}>{affected.reason}</Text>
                          </View>
                        ) : (
                          <View style={styles.reasonContainer}>
                            <Text style={[styles.reasonText, { color: secondaryText }]}>Safe — Buffer sufficient.</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapContainer}>
                {trip.bookings.map((booking, index) => {
                  const affected = impactReport.affectedBookings[booking.id];
                  const isLast = index === trip.bookings.length - 1;
                  const iconName = getBookingIcon(booking.type) as any;
                  
                  let iconColor = protectedColor;
                  if (affected) {
                    if (affected.status === 'DISRUPTED' || affected.status === 'IMPACTED') iconColor = disruptedColor;
                    else if (affected.status === 'AT_RISK') iconColor = atRiskColor;
                  }

                  return (
                    <View key={booking.id} style={styles.mapNodeContainer}>
                      <View style={[styles.mapNode, { borderColor: iconColor, backgroundColor: accentSurface }]}>
                        <Feather name={iconName} size={20} color={iconColor} />
                      </View>
                      <Text style={[styles.mapNodeTitle, { color: textColor }]}>{booking.type.toUpperCase()}</Text>
                      <Text style={[styles.mapNodeSubtitle, { color: secondaryText }]}>{booking.location.split(' ')[0]}</Text>
                      
                      {affected && (
                        <View style={{ marginTop: 8 }}>
                          <Badge status={iconColor === disruptedColor ? 'disrupted' : 'atRisk'} label={affected.status} />
                        </View>
                      )}

                      {!isLast && <View style={[styles.mapConnector, { backgroundColor: iconColor }]} />}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.actionContainer}>
              <Button 
                label="GENERATE RECOVERY PLANS" 
                variant="primary" 
                onPress={() => router.push(`/recovery/${impactReport.disruptions[0].bookingId}`)}
              />
              <Button 
                label="Reset Simulator" 
                variant="ghost" 
                onPress={handleReset}
                style={{ marginTop: 12 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 24, 
    paddingTop: 60, 
    paddingBottom: 100 
  },
  header: { 
    marginBottom: 40,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    padding: 2,
    marginTop: 20,
    alignSelf: 'flex-start'
  },
  scoreboard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    backgroundColor: 'rgba(0,255,100,0.03)'
  },
  scoreTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLeft: { alignItems: 'center' },
  scoreBig: { fontSize: 36, fontWeight: '700' },
  scoreSmall: { fontSize: 16 },
  scoreLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  scoreRight: { gap: 4, alignItems: 'flex-end' },
  scoreMetric: { fontSize: 14, fontWeight: '600' },
  suptitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    letterSpacing: 2, 
    marginBottom: 8 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '600',
    letterSpacing: -0.5
  },
  
  timelineContainer: { 
    marginTop: 8 
  },
  timelineRow: { 
    flexDirection: 'row', 
    minHeight: 100 
  },
  timelineLeft: { 
    width: 32, 
    alignItems: 'center' 
  },
  iconWrapper: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    borderWidth: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 2,
    marginTop: 2
  },
  line: { 
    width: 1, 
    flex: 1, 
    marginVertical: -4, 
    zIndex: 1 
  },
  timelineRight: { 
    flex: 1, 
    paddingLeft: 20,
    paddingBottom: 40 
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  bookingTitle: { 
    fontSize: 18, 
    fontWeight: '600',
    letterSpacing: -0.3
  },
  bookingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '500'
  },
  
  analyzingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 100 
  },
  analyzingText: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginTop: 24, 
    letterSpacing: 1.5 
  },
  analyzingSub: { 
    fontSize: 14, 
    marginTop: 12, 
    textAlign: 'center',
    maxWidth: '80%' 
  },

  impactDashboard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 40,
    overflow: 'hidden'
  },
  impactDashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.02)'
  },
  impactDashboardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1
  },
  statCell: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRightWidth: 1
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1
  },

  reasonContainer: { 
    marginTop: 12, 
    alignItems: 'flex-start', 
    gap: 8 
  },
  reasonText: { 
    fontSize: 14, 
    fontWeight: '500',
    lineHeight: 20 
  },

  actionContainer: {
    marginTop: 24
  },
  developerSection: {
    marginTop: 48,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)'
  },
  devTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16
  },
  
  mapContainer: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  mapNodeContainer: {
    width: 100,
    alignItems: 'center',
    marginRight: 30,
    position: 'relative'
  },
  mapNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    zIndex: 2
  },
  mapNodeTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center'
  },
  mapNodeSubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center'
  },
  mapConnector: {
    position: 'absolute',
    top: 27,
    left: 50,
    height: 2,
    width: 130,
    zIndex: -1
  }
});
