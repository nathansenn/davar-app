/**
 * FontSizeControl Component
 * Aa button with slider for adjusting reading font size
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import type { FontSize } from '../../types';
import { FONT_SIZES } from '../../types';

interface FontSizeControlProps {
  value: FontSize;
  onChange: (size: FontSize) => void;
}

export function FontSizeControl({ value, onChange }: FontSizeControlProps) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  }, []);

  const handleSelect = useCallback(
    (size: FontSize) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(size);
    },
    [onChange]
  );

  const handleClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <>
      {/* Aa Button */}
      <TouchableOpacity
        onPress={handleOpen}
        style={[
          styles.button,
          { backgroundColor: theme.surfaceSecondary },
        ]}
        accessibilityLabel="Adjust font size"
        accessibilityHint="Opens font size selector"
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>Aa</Text>
      </TouchableOpacity>

      {/* Font Size Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Font Size
            </Text>

            {/* Size Preview */}
            <View
              style={[
                styles.preview,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Text
                style={[
                  styles.previewText,
                  { color: theme.text, fontSize: value },
                ]}
              >
                For God so loved the world...
              </Text>
            </View>

            {/* Size Buttons */}
            <View style={styles.sizeButtons}>
              {FONT_SIZES.map((size) => (
                <FontSizeButton
                  key={size.value}
                  size={size}
                  isSelected={value === size.value}
                  onPress={() => handleSelect(size.value)}
                  theme={theme}
                />
              ))}
            </View>

            {/* Visual Slider */}
            <View style={styles.slider}>
              <Text style={[styles.sliderLabel, { color: theme.textMuted }]}>
                A
              </Text>
              <View
                style={[
                  styles.sliderTrack,
                  { backgroundColor: theme.surfaceSecondary },
                ]}
              >
                {FONT_SIZES.map((size, index) => (
                  <TouchableOpacity
                    key={size.value}
                    onPress={() => handleSelect(size.value)}
                    style={[
                      styles.sliderDot,
                      {
                        left: `${(index / (FONT_SIZES.length - 1)) * 100}%`,
                        backgroundColor:
                          value === size.value
                            ? theme.primary
                            : theme.textMuted,
                        transform: [
                          { translateX: -6 },
                          { scale: value === size.value ? 1.3 : 1 },
                        ],
                      },
                    ]}
                  />
                ))}
                <View
                  style={[
                    styles.sliderFill,
                    {
                      backgroundColor: theme.primary,
                      width: `${
                        (FONT_SIZES.findIndex((s) => s.value === value) /
                          (FONT_SIZES.length - 1)) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.sliderLabel,
                  styles.sliderLabelLarge,
                  { color: theme.textMuted },
                ]}
              >
                A
              </Text>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.doneButton, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.doneButtonText, { color: theme.primaryText }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

interface FontSizeButtonProps {
  size: { value: FontSize; label: string };
  isSelected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}

function FontSizeButton({
  size,
  isSelected,
  onPress,
  theme,
}: FontSizeButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View
        style={[
          styles.sizeButton,
          {
            backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
            borderColor: isSelected ? theme.primary : theme.border,
          },
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.sizeButtonText,
            {
              color: isSelected ? theme.primaryText : theme.text,
              fontSize: 10 + size.value * 0.3,
            },
          ]}
        >
          {size.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Preview
  preview: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    minHeight: 80,
    justifyContent: 'center',
  },
  previewText: {
    fontFamily: 'System',
    lineHeight: 28,
  },

  // Size buttons
  sizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  sizeButtonText: {
    fontWeight: '600',
  },

  // Slider
  slider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 20,
    textAlign: 'center',
  },
  sliderLabelLarge: {
    fontSize: 22,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 12,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  sliderDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -4,
  },

  // Done button
  doneButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FontSizeControl;
