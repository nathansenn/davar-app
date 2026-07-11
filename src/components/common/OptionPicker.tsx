/**
 * OptionPicker — reusable bottom-sheet single-select.
 * Replaces tap-to-cycle / multi-button Alert pickers (the latter is broken on
 * Android with >3 options). Values are strings; callers cast as needed.
 */

import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

export interface PickerOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface OptionPickerProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function OptionPicker({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: OptionPickerProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: 12 + insets.bottom,
            maxHeight: '70%',
          }}
          accessibilityViewIsModal
          accessibilityLabel={title}
        >
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingBottom: 8,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const isSelected = opt.value === selected;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={opt.sublabel ? `${opt.label}, ${opt.sublabel}` : opt.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 24,
                    paddingVertical: 16,
                    backgroundColor: isSelected ? theme.primary + '12' : 'transparent',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 16, fontWeight: isSelected ? '600' : '400' }}>
                      {opt.label}
                    </Text>
                    {opt.sublabel && (
                      <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
                        {opt.sublabel}
                      </Text>
                    )}
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={22} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default OptionPicker;
