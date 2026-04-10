/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  // Primary Colors
  primary: '#22c55e',      // Verde fútbol
  primaryDark: '#16a34a',
  
  // Backgrounds
  dark: '#0f172a',         // Fondo principal
  darkSecondary: '#1e293b', // Cards y secciones
  
  // Text
  white: '#ffffff',
  gray: '#94a3b8',
  lightGray: '#cbd5e1',
  
  // Accents
  success: '#10b981',      // Verde éxito
  warning: '#f59e0b',      // Amarillo alerta
  danger: '#ef4444',       // Rojo peligro
  info: '#3b82f6',         // Azul info
  
  // Borders
  border: '#334155',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};
