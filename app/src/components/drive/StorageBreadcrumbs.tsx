import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, HardDrive, Folder } from 'lucide-react-native';

interface StorageBreadcrumbsProps {
  chatName: string;
  currentFolder?: { uid: string; name: string } | null;
  onNavigateRoot: () => void;
}

export const StorageBreadcrumbs: React.FC<StorageBreadcrumbsProps> = ({
  chatName,
  currentFolder,
  onNavigateRoot,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity activeOpacity={0.7} onPress={onNavigateRoot} style={styles.crumb}>
          <HardDrive size={14} color="#818cf8" style={styles.icon} />
          <Text style={[styles.text, !currentFolder ? styles.activeText : null]} numberOfLines={1}>
            {chatName || 'Drive Root'}
          </Text>
        </TouchableOpacity>

        {currentFolder ? (
          <View style={styles.trail}>
            <ChevronRight size={14} color="#64748b" style={styles.separator} />
            <View style={styles.crumb}>
              <Folder size={14} color="#38bdf8" style={styles.icon} />
              <Text style={[styles.text, styles.activeText]} numberOfLines={1}>
                {currentFolder.name}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  icon: {
    marginRight: 6,
  },
  separator: {
    marginHorizontal: 4,
  },
  text: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 150,
  },
  activeText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
});
