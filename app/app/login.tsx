import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { initializeTelegramLogin } from '@/services/telegramApi';
import {
  setStorageItem,
  getStoredAuth,
  StorageKeys,
} from '@/services/storage';

export default function LoginScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [showApiHash, setShowApiHash] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [connectingState, setConnectingState] = useState('Initializing MTProto...');

  const phoneCodeResolver = useRef<((code: string) => void) | null>(null);
  const passwordResolver = useRef<((pass: string) => void) | null>(null);

  // Load existing credentials if available
  useEffect(() => {
    const loadSaved = async () => {
      const { apiId: savedId, apiHash: savedHash, token } = await getStoredAuth();
      if (savedId) setApiId(savedId);
      if (savedHash) setApiHash(savedHash);
      if (token) {
        router.replace('/(tabs)');
      }
    };
    loadSaved();
  }, [router]);

  // Dynamic connecting message effect
  useEffect(() => {
    let timer1: NodeJS.Timeout, timer2: NodeJS.Timeout, timer3: NodeJS.Timeout;
    if (step === 2) {
      setConnectingState('Connecting to Telegram DC servers...');
      timer1 = setTimeout(() => {
        setConnectingState('Establishing end-to-end cryptographic tunnel...');
      }, 1500);
      timer2 = setTimeout(() => {
        setConnectingState('Awaiting official MTProto authentication handshake...');
      }, 3000);
      timer3 = setTimeout(() => {
        setConnectingState('Requesting verification code dispatch...');
      }, 4500);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [step]);

  const startLogin = async () => {
    if (!apiId.trim() || !apiHash.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please provide API ID, API Hash, and Phone Number.');
      return;
    }
    setErrorMsg('');
    setStep(2);

    try {
      const { token } = await initializeTelegramLogin({
        apiId: apiId.trim(),
        apiHash: apiHash.trim(),
        phoneNumber: phoneNumber.trim(),
        phoneCodeCallback: async () => {
          setStep(3);
          return new Promise((resolve) => {
            phoneCodeResolver.current = resolve;
          });
        },
        passwordCallback: async () => {
          setStep(4);
          return new Promise((resolve) => {
            passwordResolver.current = resolve;
          });
        },
        onErrorCallback: (err) => {
          setErrorMsg(err.message || 'An error occurred during Telegram authentication.');
        },
      });

      await setStorageItem(StorageKeys.API_ID, apiId.trim());
      await setStorageItem(StorageKeys.API_HASH, apiHash.trim());
      await setStorageItem(StorageKeys.TOKEN, token);

      setStep(5);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize Telegram client. Check credentials.');
      setStep(1);
    }
  };

  const submitCode = () => {
    if (!phoneCode.trim()) return;
    if (phoneCodeResolver.current) {
      phoneCodeResolver.current(phoneCode.trim());
      setStep(2);
    }
  };

  const submitPassword = () => {
    if (!password.trim()) return;
    if (passwordResolver.current) {
      passwordResolver.current(password.trim());
      setStep(2);
    }
  };

  const resetToStepOne = () => {
    setStep(1);
    setErrorMsg('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="cloud" size={28} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>NexGenStorage</Text>
            <Text style={styles.brandSubtitle}>Direct MTProto Telegram Cloud Storage</Text>
          </View>

          {/* Stepper Progress */}
          <View style={styles.stepperContainer}>
            {['Credentials', 'Connecting', 'Verify', '2FA'].map((title, idx) => {
              const num = idx + 1;
              const isCurrent = step === num;
              const isPassed = step > num;
              return (
                <View key={title} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCurrent && styles.stepCircleActive,
                      isPassed && styles.stepCirclePassed,
                    ]}
                  >
                    {isPassed ? (
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNum,
                          isCurrent && styles.stepNumActive,
                          isPassed && styles.stepNumPassed,
                        ]}
                      >
                        {num}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCurrent && styles.stepLabelActive,
                      isPassed && styles.stepLabelPassed,
                    ]}
                  >
                    {title}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Error Banner */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.dark.errorLight} />
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity onPress={() => setErrorMsg('')}>
                <Ionicons name="close" size={16} color={Colors.dark.errorLight} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* STEP 1: CREDENTIALS */}
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Connect Telegram</Text>
              <Text style={styles.cardSubtitle}>
                Keys are stored securely in local device storage only.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>API ID (Numeric)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2938472"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={apiId}
                  onChangeText={setApiId}
                  keyboardType="numeric"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>API HASH (32-char hex)</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="e.g. 9b8f2c3d..."
                    placeholderTextColor={Colors.dark.textMuted}
                    value={apiHash}
                    onChangeText={setApiHash}
                    secureTextEntry={!showApiHash}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowApiHash(!showApiHash)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showApiHash ? 'eye-off' : 'eye'}
                      size={18}
                      color={Colors.dark.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PHONE NUMBER (with country code)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1 234 567 8900"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={startLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Connect Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>

              {/* Guide Accordion */}
              <TouchableOpacity
                style={styles.guideToggle}
                onPress={() => setShowGuide(!showGuide)}
                activeOpacity={0.7}
              >
                <View style={styles.guideToggleLeft}>
                  <Text style={{ fontSize: 14 }}>💡</Text>
                  <Text style={styles.guideToggleText}>How do I get API ID & Hash?</Text>
                </View>
                <Ionicons
                  name={showGuide ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.dark.textMuted}
                />
              </TouchableOpacity>

              {showGuide && (
                <View style={styles.guideBox}>
                  <Text style={styles.guideTitle}>Quick 2-Minute Steps:</Text>
                  <Text style={styles.guideStep}>
                    1. Open <Text style={styles.bold}>my.telegram.org</Text> in a browser.
                  </Text>
                  <Text style={styles.guideStep}>2. Log in with your phone number and code.</Text>
                  <Text style={styles.guideStep}>
                    3. Tap <Text style={styles.bold}>API development tools</Text>.
                  </Text>
                  <Text style={styles.guideStep}>
                    4. Create app and copy your <Text style={styles.bold}>api_id</Text> and{' '}
                    <Text style={styles.bold}>api_hash</Text>.
                  </Text>

                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => Linking.openURL('https://my.telegram.org')}
                  >
                    <Text style={styles.linkText}>Open my.telegram.org</Text>
                    <Ionicons name="open-outline" size={14} color={Colors.dark.primaryLight} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* STEP 2: CONNECTING */}
          {step === 2 && (
            <View style={[styles.card, styles.centerCard]}>
              <View style={styles.spinnerWrapper}>
                <ActivityIndicator size="large" color={Colors.dark.primaryLight} />
              </View>
              <Text style={styles.cardTitle}>Connecting to MTProto...</Text>
              <Text style={styles.connectingSub}>{connectingState}</Text>

              <TouchableOpacity style={styles.cancelLink} onPress={resetToStepOne}>
                <Text style={styles.cancelLinkText}>Cancel and Edit Credentials</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: PHONE CODE */}
          {step === 3 && (
            <View style={styles.card}>
              <View style={styles.centerIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.dark.primaryLight} />
              </View>
              <Text style={styles.cardTitle}>Enter Verification Code</Text>
              <Text style={styles.cardSubtitle}>
                Telegram sent an official login code to your Telegram app on {phoneNumber}.
              </Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="• • • • •"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={phoneCode}
                  onChangeText={setPhoneCode}
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={submitCode}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Verify & Proceed</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelLink} onPress={resetToStepOne}>
                <Text style={styles.cancelLinkText}>← Back to Credentials</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: 2FA PASSWORD */}
          {step === 4 && (
            <View style={styles.card}>
              <View style={styles.centerIcon}>
                <Ionicons name="shield-checkmark-outline" size={32} color={Colors.dark.violet} />
              </View>
              <Text style={styles.cardTitle}>Two-Step Verification</Text>
              <Text style={styles.cardSubtitle}>
                Your account is protected by 2FA. Please enter your Telegram cloud password.
              </Text>

              <View style={styles.inputGroup}>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter 2FA password"
                    placeholderTextColor={Colors.dark.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={Colors.dark.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={submitPassword}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Authenticate</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelLink} onPress={resetToStepOne}>
                <Text style={styles.cancelLinkText}>← Back to Credentials</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <View style={[styles.card, styles.centerCard]}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-done" size={40} color={Colors.dark.emeraldLight} />
              </View>
              <Text style={styles.cardTitle}>Telegram Connected!</Text>
              <Text style={styles.cardSubtitle}>
                Launching your unmetered cloud drive workspace...
              </Text>
            </View>
          )}

          <View style={styles.footerNote}>
            <Ionicons name="shield-outline" size={14} color={Colors.dark.textMuted} />
            <Text style={styles.footerText}>
              Direct MTProto Connection • 100% Client-Side
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primaryLight,
  },
  stepCirclePassed: {
    backgroundColor: Colors.dark.emerald,
    borderColor: Colors.dark.emeraldLight,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  stepNumActive: {
    color: '#FFF',
  },
  stepNumPassed: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  stepLabelActive: {
    color: Colors.dark.primaryLight,
  },
  stepLabelPassed: {
    color: Colors.dark.emeraldLight,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.errorLight,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  centerCard: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  centerIcon: {
    alignItems: 'center',
    marginBottom: 12,
  },
  spinnerWrapper: {
    marginBottom: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  connectingSub: {
    fontSize: 12,
    color: Colors.dark.primaryLight,
    marginTop: 6,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: Colors.dark.surface3,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.dark.text,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '700',
  },
  passwordRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  guideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  guideToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  guideBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.primaryLight,
    marginBottom: 2,
  },
  guideStep: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
  bold: {
    fontWeight: '700',
    color: Colors.dark.text,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  linkText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.primaryLight,
  },
  cancelLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
});
