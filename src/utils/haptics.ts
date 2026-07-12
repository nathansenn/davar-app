/**
 * Safe haptics wrapper. expo-haptics throws on platforms without a haptics
 * native module (e.g. web) — haptic feedback is a non-essential enhancement and
 * must never throw or reject into a component. This drop-in wrapper preserves
 * the `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.X)` call shape while
 * no-oping on web and swallowing any error.
 */

import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;

export function impactAsync(style?: ExpoHaptics.ImpactFeedbackStyle): Promise<void> {
  if (Platform.OS === 'web') return Promise.resolve();
  return ExpoHaptics.impactAsync(style).catch(() => {});
}

export function notificationAsync(type?: ExpoHaptics.NotificationFeedbackType): Promise<void> {
  if (Platform.OS === 'web') return Promise.resolve();
  return ExpoHaptics.notificationAsync(type).catch(() => {});
}

export function selectionAsync(): Promise<void> {
  if (Platform.OS === 'web') return Promise.resolve();
  return ExpoHaptics.selectionAsync().catch(() => {});
}
