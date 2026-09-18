import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  disabled,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputError : null,
          disabled ? styles.inputDisabled : null,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor="#64748b"
          editable={!disabled}
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 8 } : null,
            rightIcon ? { paddingRight: 8 } : null,
            disabled ? styles.textDisabled : null,
            style,
          ]}
          {...props}
        />
        {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputDisabled: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    height: 48,
    color: '#f8fafc',
    fontSize: 15,
  },
  textDisabled: {
    color: '#64748b',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    marginLeft: 6,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
});
