/**
 * TranslationPicker Component
 * Selector for Bible translations (KJV/WEB/ASV)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import type { Translation, TranslationInfo } from '../../types';
import { TRANSLATIONS } from '../../types';

interface TranslationPickerProps {
  value: Translation;
  onChange: (translation: Translation) => void;
  variant?: 'button' | 'inline';
}

export function TranslationPicker({
  value,
  onChange,
  variant = 'button',
}: TranslationPickerProps) {
  const { theme, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const currentTranslation = TRANSLATIONS[value];
  const translations = Object.values(TRANSLATIONS);

  const handleSelect = useCallback(
    (translation: Translation) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(translation);
      setModalVisible(false);
    },
    [onChange]
  );

  const openModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  }, []);

  // Inline variant - horizontal buttons
  if (variant === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        {translations.map((trans) => (
          <TouchableOpacity
            key={trans.id}
            onPress={() => handleSelect(trans.id)}
            style={[
              styles.inlineButton,
              {
                backgroundColor:
                  value === trans.id ? theme.primary : theme.surfaceSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.inlineButtonText,
                {
                  color: value === trans.id ? theme.primaryText : theme.text,
                },
              ]}
            >
              {trans.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Button variant - opens modal
  return (
    <>
      <TouchableOpacity
        onPress={openModal}
        style={[
          styles.button,
          {
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>
          {currentTranslation.name}
        </Text>
        <Text style={[styles.chevron, { color: theme.textMuted }]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Translation
            </Text>

            {translations.map((trans) => (
              <TranslationOption
                key={trans.id}
                translation={trans}
                isSelected={value === trans.id}
                onPress={() => handleSelect(trans.id)}
                theme={theme}
              />
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

interface TranslationOptionProps {
  translation: TranslationInfo;
  isSelected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}

function TranslationOption({
  translation,
  isSelected,
  onPress,
  theme,
}: TranslationOptionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.optionContainer,
        {
          backgroundColor: isSelected
            ? theme.surfaceSecondary
            : 'transparent',
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.optionHeader}>
        <Text style={[styles.optionName, { color: theme.text }]}>
          {translation.fullName}
        </Text>
        <Text
          style={[
            styles.optionBadge,
            {
              backgroundColor: theme.primary,
              color: theme.primaryText,
            },
          ]}
        >
          {translation.name}
        </Text>
      </View>
      <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
        {translation.description}
      </Text>
      <Text style={[styles.optionMeta, { color: theme.textMuted }]}>
        {translation.year} • {translation.copyright}
      </Text>
      
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={{ color: theme.primary, fontSize: 18 }}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  inlineButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  inlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Button variant
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 10,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Option
  optionContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  optionBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  optionMeta: {
    fontSize: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

export default TranslationPicker;
