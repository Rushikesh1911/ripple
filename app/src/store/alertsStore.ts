export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  timestamp: string; // ISO String
}

class AlertsStore {
  private alerts: Alert[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Add some initial mock alerts for the hackathon
    this.alerts = [
      {
        id: 'mock1',
        title: 'System Active',
        message: 'Ripple travel engine is actively monitoring your itinerary.',
        type: 'info',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'mock2',
        title: 'Weather Update',
        message: 'Light rain expected in London tomorrow afternoon.',
        type: 'info',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }

  addAlert(alert: Omit<Alert, 'id' | 'timestamp'>) {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    };
    
    // Add to top of list
    this.alerts = [newAlert, ...this.alerts];
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const alertsStore = new AlertsStore();
