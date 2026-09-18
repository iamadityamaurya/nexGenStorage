import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Shield,
  KeyRound,
  Phone,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react-native';
import { AmbientBackground } from '../src/components/common/AmbientBackground';
import { GlassCard } from '../src/components/common/GlassCard';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { initializeTelegramLogin } from '../src/services/telegramApi';
import { storageService } from '../src/services/storageService';

export default function LoginScreen() {
  const router = useRouter();

  // Form states
  const [step, setStep] = useState<'credentials' | 'code' | 'password'>('credentials');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  // Resolvers for Telegram async callbacks
  const codeResolverRef = useRef<((code: string) => void) | null>(null);
  const passwordResolverRef = useRef<((pw: string) => void) | null>(null);

  const handleStartLogin = async () => {
    if (!apiId.trim() || !apiHash.trim() || !phoneNumber.trim()) {
      setError('Please fill in API ID, API Hash, and Phone Number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { token } = await initializeTelegramLogin({
        apiId: apiId.trim(),
        apiHash: apiHash.trim(),
        phoneNumber: phoneNumber.trim(),
        phoneCodeCallback: async () => {
          setLoading(false);
          setStep('code');
          return new Promise<string>((resolve) => {
            codeResolverRef.current = resolve;
          });
        },
        passwordCallback: async () => {
          setLoading(false);
          setStep('password');
          return new Promise<string>((resolve) => {
            passwordResolverRef.current = resolve;
          });
        },
        onErrorCallback: (err) => {
          console.error('MTProto error:', err);
          setError(err.message || 'Login failed');
          setLoading(false);
        },
      });

      // Save tokens
      await storageService.saveAuthCredentials(apiId.trim(), apiHash.trim(), token);

      setLoading(false);
      router.replace('/drives' as any);
    } catch (err: any) {
      console.error('Login process error:', err);
      setError(err.message || 'Failed to authenticate with Telegram');
      setLoading(false);
    }
  };

  const handleSubmitCode = () => {
    if (!phoneCode.trim()) {
      setError('Please enter the verification code');
      return;
    }
    setError('');
    setLoading(true);
    if (codeResolverRef.current) {
      codeResolverRef.current(phoneCode.trim());
    }
  };

  const handleSubmitPassword = () => {
    if (!password.trim()) {
      setError('Please enter your 2FA password');
      return;
    }
    setError('');
    setLoading(true);
    if (passwordResolverRef.current) {
      passwordResolverRef.current(password.trim());
    }
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <ChevronLeft size={22} color="#94a3b8" />
              </TouchableOpacity>

              <View style={styles.headerTitleBox}>
                <Text style={styles.headerTitle}>Telegram Login</Text>
                <Text style={styles.headerSub}>
                  {step === 'credentials'
                    ? 'Step 1 of 2: API Credentials'
                    : step === 'code'
                    ? 'Step 2 of 2: Enter Verification Code'
                    : 'Two-Step Verification'}
                </Text>
              </View>
            </View>

            {/* Main Form Card */}
            <GlassCard style={styles.formCard} variant="glow">
              {step === 'credentials' && (
                <View>
                  <View style={styles.guideToggleRow}>
                    <Text style={styles.sectionHeader}>Enter MTProto Credentials</Text>
                    <TouchableOpacity
                      onPress={() => setShowGuide(!showGuide)}
                      style={styles.guideToggle}
                    >
                      <HelpCircle size={14} color="#818cf8" />
                      <Text style={styles.guideToggleText}>
                        {showGuide ? 'Hide Guide' : 'How to get API ID?'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showGuide && (
                    <View style={styles.guideBox}>
                      <Text style={styles.guideStep}>1. Visit <Text style={styles.guideBold}>my.telegram.org</Text></Text>
                      <Text style={styles.guideStep}>2. Log in and go to &quot;API development tools&quot;</Text>
                      <Text style={styles.guideStep}>3. Copy your <Text style={styles.guideBold}>App api_id</Text> &amp; <Text style={styles.guideBold}>App api_hash</Text></Text>
                    </View>
                  )}

                  <Input
                    label="API ID"
                    placeholder="e.g. 12345678"
                    value={apiId}
                    onChangeText={setApiId}
                    keyboardType="numeric"
                    leftIcon={<KeyRound size={18} color="#818cf8" />}
                  />

                  <Input
                    label="API Hash"
                    placeholder="e.g. 0123456789abcdef0123456789abcdef"
                    value={apiHash}
                    onChangeText={setApiHash}
                    autoCapitalize="none"
                    leftIcon={<Shield size={18} color="#818cf8" />}
                  />

                  <Input
                    label="Phone Number"
                    placeholder="e.g. +1234567890 (with country code)"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    leftIcon={<Phone size={18} color="#818cf8" />}
                  />

                  <Button
                    title="Send Verification Code"
                    variant="primary"
                    size="lg"
                    onPress={handleStartLogin}
                    loading={loading}
                    icon={<ArrowRight size={18} color="#ffffff" />}
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}

              {step === 'code' && (
                <View>
                  <Text style={styles.sectionHeader}>Enter Telegram Code</Text>
                  <Text style={styles.stepDesc}>
                    Telegram just sent a login code to your Telegram app on {phoneNumber}.
                  </Text>

                  <Input
                    label="Verification Code"
                    placeholder="12345"
                    value={phoneCode}
                    onChangeText={setPhoneCode}
                    keyboardType="numeric"
                    autoFocus
                    leftIcon={<KeyRound size={18} color="#818cf8" />}
                  />

                  <Button
                    title="Verify & Connect"
                    variant="primary"
                    size="lg"
                    onPress={handleSubmitCode}
                    loading={loading}
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}

              {step === 'password' && (
                <View>
                  <Text style={styles.sectionHeader}>Two-Step Verification</Text>
                  <Text style={styles.stepDesc}>
                    Your Telegram account is protected by a 2FA Cloud Password.
                  </Text>

                  <Input
                    label="2FA Cloud Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoFocus
                    leftIcon={<Shield size={18} color="#818cf8" />}
                  />

                  <Button
                    title="Unlock & Proceed"
                    variant="primary"
                    size="lg"
                    onPress={handleSubmitPassword}
                    loading={loading}
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}

              {error ? (
                <View style={styles.errorBox}>
                  <AlertCircle size={16} color="#f87171" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 14,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  formCard: {
    padding: 20,
  },
  guideToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  guideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideToggleText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
  },
  guideBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  guideStep: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  guideBold: {
    color: '#ffffff',
    fontWeight: '700',
  },
  stepDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    flex: 1,
  },
});
