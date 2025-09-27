import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

/**
 * Option interface for Select component
 */
export interface SelectOption {
  /** Display text for the option */
  label: string
  /** Value associated with the option */
  value: string
}

/**
 * Select component props interface
 */
interface SelectProps {
  /** Optional label displayed above the select */
  label?: string
  /** Optional description text displayed below the label */
  description?: string
  /** Array of selectable options */
  options: SelectOption[]
  /** Currently selected value */
  selectedValue: string
  /** Function called when selection changes */
  onValueChange: (value: string) => void
  /** Placeholder text when no option is selected */
  placeholder?: string
  /** Error message to display */
  error?: string
  /** Whether the select is disabled */
  disabled?: boolean
}

/**
 * Modal-based select component with dropdown functionality
 * 
 * Features:
 * - Modal-based dropdown for better mobile UX
 * - Supports custom options with label/value pairs
 * - Error state styling and messaging
 * - Disabled state with appropriate styling
 * - Label and description support
 * - Theme-aware styling for light/dark modes
 * - Scrollable options list for large datasets
 * - Accessible with proper roles and labels
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Language"
 *   options={[
 *     { label: 'English', value: 'en' },
 *     { label: 'Spanish', value: 'es' }
 *   ]}
 *   selectedValue={currentLanguage}
 *   onValueChange={setLanguage}
 *   placeholder="Select a language"
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = observer(({
  label,
  description,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  error,
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, !!error, disabled)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const selectedOption = options.find(option => option.value === selectedValue)
  const displayText = selectedOption?.label || placeholder

  const handleOptionSelect = (value: string) => {
    onValueChange(value)
    setIsModalVisible(false)
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.selectButton,
          pressed && styles.selectButtonPressed
        ]}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={`Current selection: ${displayText}`}
      >
        <Text style={styles.selectText}>
          {displayText}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaWrapper>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.option,
                    option.value === selectedValue && styles.selectedOption,
                    pressed && styles.optionPressed
                  ]}
                  onPress={() => handleOptionSelect(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === selectedValue && styles.selectedOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.value === selectedValue && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </SafeAreaWrapper>
      </Modal>
    </View>
  )
})

// Simple wrapper to avoid importing SafeAreaView in this component
const SafeAreaWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      {children}
    </View>
  )
}

const createStyles = (theme: Theme, hasError: boolean, disabled: boolean) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.caption.lineHeight
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: hasError ? theme.colors.status.error : theme.colors.border.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
    opacity: disabled ? 0.5 : 1
  } as ViewStyle,
  selectButtonPressed: {
    backgroundColor: theme.colors.background.tertiary,
    transform: [{ scale: 0.98 }]
  },
  selectText: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '400'
  } as TextStyle,
  chevron: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm
  } as TextStyle,
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary
  },
  modalTitle: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight,
    color: theme.colors.text.primary
  } as TextStyle,
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.sm
  },
  closeButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '600'
  } as TextStyle,
  optionsList: {
    flex: 1
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.secondary
  },
  selectedOption: {
    backgroundColor: theme.colors.background.tertiary
  },
  optionPressed: {
    backgroundColor: theme.colors.background.secondary
  },
  optionText: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '400'
  } as TextStyle,
  selectedOptionText: {
    fontWeight: '600',
    color: theme.colors.interactive.primary
  } as TextStyle,
  checkmark: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.interactive.primary,
    fontWeight: '600'
  } as TextStyle
})