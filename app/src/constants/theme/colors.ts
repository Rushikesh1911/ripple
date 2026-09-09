/**
 * Colors for Ripple UI
 */

const tintColorLight = '#0F8A8B'; // Primary Accent Light
const tintColorDark = '#19C7C2'; // Primary Accent Dark

export const Colors = {
  light: {
    text: '#1C1C1E',
    secondaryText: '#475467',
    background: '#F7F6F2', // Warm Sand / Cream
    card: '#FFFFFF',
    border: '#D0D5DD',
    tint: tintColorLight,
    icon: '#475467',
    tabIconDefault: '#475467',
    tabIconSelected: tintColorLight,
    accentHover: '#0C6E6F',
    accentSurface: '#E4F7F6',
    
    // Status colors
    protected: '#0F9D58',
    atRisk: '#D97706',
    disrupted: '#DC2626',
  },
  dark: {
    text: '#FFFFFF',
    secondaryText: '#AEAEB2',
    background: '#1C1C1E',
    card: '#2C2C2E',
    border: '#3A3A3C',
    tint: tintColorDark,
    icon: '#AEAEB2',
    tabIconDefault: '#AEAEB2',
    tabIconSelected: tintColorDark,
    accentHover: '#0F8A8B',
    accentSurface: '#12312F',
    
    // Status colors
    protected: '#3DDC97',
    atRisk: '#F5A524',
    disrupted: '#F0506E',
  },
};
