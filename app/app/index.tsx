import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Cloud,
  ShieldCheck,
  Zap,
  HardDrive,
  FolderTree,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react-native';
import { AmbientBackground } from '../src/components/common/AmbientBackground';
import { GlassCard } from '../src/components/common/GlassCard';
import { Button } from '../src/components/common/Button';
import { storageService } from '../src/services/storageService';

export default function LandingScreen() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { token } = await storageService.getAuthCredentials();
      if (token) {
        setHasSession(true);
      }
    };
    checkAuth();
  }, []);

  const handleGetStarted = () => {
    if (hasSession) {
      router.push('/drives' as any);
    } else {
      router.push('/login' as any);
    }
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Bar / Brand */}
          <View style={styles.topNav}>
            <View style={styles.brandContainer}>
              <View style={styles.logoIcon}>
                <Cloud size={20} color="#818cf8" />
              </View>
              <Text style={styles.brandTitle}>
                nexGen<Text style={styles.brandHighlight}>Storage</Text>
              </Text>
            </View>

            {hasSession ? (
              <TouchableOpacity
                onPress={() => router.push('/drives' as any)}
                style={styles.navDrivesBtn}
              >
                <Text style={styles.navDrivesText}>My Drives</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.badgePill}>
              <Sparkles size={13} color="#818cf8" />
              <Text style={styles.badgeText}>Powered by Telegram MTProto API</Text>
            </View>

            <Text style={styles.heroHeading}>
              Unlimited Cloud Storage.{'\n'}
              <Text style={styles.gradientHeading}>Zero Subscription Fees.</Text>
            </Text>

            <Text style={styles.heroSubtitle}>
              Transform your Telegram chats, channels, and Saved Messages into a high-speed,
              structured cloud drive with full folder hierarchies, instant streaming, and end-to-end privacy.
            </Text>

            <View style={styles.ctaRow}>
              <Button
                title={hasSession ? 'Open My Cloud Drive' : 'Connect Telegram'}
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} color="#ffffff" />}
                onPress={handleGetStarted}
                style={styles.primaryCta}
              />
            </View>
          </View>

          {/* Stats Bar */}
          <GlassCard style={styles.statsCard} variant="glow">
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Storage Limit</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2 GB</Text>
              <Text style={styles.statLabel}>Per File Limit</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>$0</Text>
              <Text style={styles.statLabel}>Forever Free</Text>
            </View>
          </GlassCard>

          {/* Core Feature Highlights */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Everything You Need</Text>
            <Text style={styles.sectionSub}>Engineered for performance, privacy, and simplicity</Text>
          </View>

          <View style={styles.featureGrid}>
            <GlassCard style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <FolderTree size={24} color="#818cf8" />
              </View>
              <Text style={styles.featureTitle}>Master Index System</Text>
              <Text style={styles.featureDesc}>
                Structured virtual folders with $O(1)$ fast renames and automatic file association.
              </Text>
            </GlassCard>

            <GlassCard style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Zap size={24} color="#38bdf8" />
              </View>
              <Text style={styles.featureTitle}>Instant Streaming</Text>
              <Text style={styles.featureDesc}>
                Preview photos, videos, music, and text notes with high-speed download chunks.
              </Text>
            </GlassCard>

            <GlassCard style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <ShieldCheck size={24} color="#34d399" />
              </View>
              <Text style={styles.featureTitle}>Zero-Knowledge Client</Text>
              <Text style={styles.featureDesc}>
                Direct MTProto connection from your mobile device. We never store your files on any middleman server.
              </Text>
            </GlassCard>

            <GlassCard style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <HardDrive size={24} color="#c084fc" />
              </View>
              <Text style={styles.featureTitle}>Multi-Drive Switching</Text>
              <Text style={styles.featureDesc}>
                Switch seamlessly between Saved Messages, personal channels, or collaborative team drives.
              </Text>
            </GlassCard>
          </View>

          {/* Storage Comparison Card */}
          <GlassCard style={styles.comparisonCard} variant="accent">
            <Text style={styles.comparisonTitle}>Traditional Cloud vs nexGenStorage</Text>
            <View style={styles.comparisonRow}>
              <CheckCircle size={18} color="#10b981" />
              <Text style={styles.comparisonText}>
                No 15 GB quotas or surprise monthly charges
              </Text>
            </View>
            <View style={styles.comparisonRow}>
              <CheckCircle size={18} color="#10b981" />
              <Text style={styles.comparisonText}>
                Enterprise-grade Telegram data center redundancy
              </Text>
            </View>
            <View style={styles.comparisonRow}>
              <CheckCircle size={18} color="#10b981" />
              <Text style={styles.comparisonText}>
                Persistent file availability across all devices
              </Text>
            </View>
          </GlassCard>

          {/* Bottom CTA */}
          <View style={styles.bottomCtaSection}>
            <Text style={styles.bottomCtaTitle}>Ready to unlock unlimited storage?</Text>
            <Button
              title="Get Started Now"
              variant="primary"
              size="lg"
              onPress={handleGetStarted}
              style={{ width: '100%', marginTop: 12 }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>nexGenStorage • Mobile Edition</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: '#818cf8',
  },
  navDrivesBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  navDrivesText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 24,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: 16,
  },
  badgeText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
  },
  heroHeading: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  gradientHeading: {
    color: '#818cf8',
  },
  heroSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaRow: {
    width: '100%',
    alignItems: 'center',
  },
  primaryCta: {
    width: '100%',
    maxWidth: 320,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSub: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  featureGrid: {
    gap: 12,
    marginBottom: 28,
  },
  featureCard: {
    padding: 16,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  comparisonCard: {
    padding: 18,
    marginBottom: 28,
  },
  comparisonTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  comparisonText: {
    color: '#cbd5e1',
    fontSize: 13,
    flex: 1,
  },
  bottomCtaSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomCtaTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
  },
});
