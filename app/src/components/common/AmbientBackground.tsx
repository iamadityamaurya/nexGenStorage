import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AmbientBackgroundProps {
  children: React.ReactNode;
}

const { width } = Dimensions.get('window');

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Deep Obsidian Background */}
      <View style={StyleSheet.absoluteFill} />

      {/* Top Right Orb */}
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.18)', 'rgba(99, 102, 241, 0.0)']}
        style={[styles.orb, styles.orbTopRight]}
      />

      {/* Bottom Left Orb */}
      <LinearGradient
        colors={['rgba(6, 182, 212, 0.12)', 'rgba(6, 182, 212, 0.0)']}
        style={[styles.orb, styles.orbBottomLeft]}
      />

      {/* Subtle Violet Center Orb */}
      <LinearGradient
        colors={['rgba(168, 85, 247, 0.08)', 'rgba(168, 85, 247, 0.0)']}
        style={[styles.orb, styles.orbCenter]}
      />

      {/* Foreground Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080f',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbTopRight: {
    top: -100,
    right: -100,
    width: width * 0.9,
    height: width * 0.9,
  },
  orbBottomLeft: {
    bottom: -100,
    left: -100,
    width: width * 0.9,
    height: width * 0.9,
  },
  orbCenter: {
    top: '40%',
    left: '10%',
    width: width * 0.8,
    height: width * 0.8,
  },
  content: {
    flex: 1,
  },
});
