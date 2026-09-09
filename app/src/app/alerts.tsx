import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme';
import { alertsStore, Alert } from '@/store/alertsStore';
import Feather from '@expo/vector-icons/Feather';

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'warning': return 'alert-triangle';
    case 'success': return 'check-circle';
    case 'info': return 'info';
    default: return 'bell';
  }
};

const getAlertColor = (type: string, themeColors: any) => {
  switch (type) {
    case 'warning': return themeColors.disrupted;
    case 'success': return themeColors.protected;
    case 'info': return themeColors.tint;
    default: return themeColors.text;
  }
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString();
};

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<Alert[]>(alertsStore.getAlerts());

  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const secondaryText = useThemeColor('secondaryText');
  const borderColor = useThemeColor('border');
  const accentSurface = useThemeColor('accentSurface');
  
  const themeColors = {
    disrupted: useThemeColor('disrupted'),
    protected: useThemeColor('protected'),
    tint: useThemeColor('tint'),
    text: useThemeColor('text')
  };

  useEffect(() => {
    const unsubscribe = alertsStore.subscribe(() => {
      setAlerts([...alertsStore.getAlerts()]);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Alerts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={32} color={secondaryText} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No alerts yet</Text>
            <Text style={[styles.emptySubtitle, { color: secondaryText }]}>
              You're all caught up! We'll notify you here if anything changes in your itinerary.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => {
            const iconColor = getAlertColor(alert.type, themeColors);
            return (
              <View key={alert.id} style={[styles.alertCard, { borderBottomColor: borderColor }]}>
                <View style={[styles.iconWrapper, { backgroundColor: accentSurface }]}>
                  <Feather name={getAlertIcon(alert.type) as any} size={20} color={iconColor} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTime, { color: secondaryText }]}>{formatTime(alert.timestamp)}</Text>
                  <Text style={[styles.alertTitle, { color: textColor }]}>{alert.title}</Text>
                  <Text style={[styles.alertMessage, { color: secondaryText }]}>{alert.message}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 100,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
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
  alertCard: {
    flexDirection: 'row',
    padding: 24,
    borderBottomWidth: 1,
    gap: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTime: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
  }
});
