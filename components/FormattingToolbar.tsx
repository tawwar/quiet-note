import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { OnChangeStateEvent } from 'react-native-enriched';

interface FormattingToolbarProps {
  stylesState: OnChangeStateEvent | null;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onBulletList: () => void;
  onOrderedList: () => void;
}

export default function FormattingToolbar({
  stylesState,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onBulletList,
  onOrderedList,
}: FormattingToolbarProps) {
  const ToolButton = ({
    onPress,
    isActive,
    children,
  }: {
    onPress: () => void;
    isActive?: boolean;
    children: React.ReactNode;
  }) => (
    <Pressable
      style={[styles.toolButton, isActive && styles.toolButtonActive]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );

  return (
    <View style={styles.toolbar}>
      <ToolButton onPress={onBold} isActive={stylesState?.isBold}>
        <Bold size={22} color={stylesState?.isBold ? Colors.primary : Colors.text} />
      </ToolButton>
      <ToolButton onPress={onItalic} isActive={stylesState?.isItalic}>
        <Italic size={22} color={stylesState?.isItalic ? Colors.primary : Colors.text} />
      </ToolButton>
      <ToolButton onPress={onUnderline} isActive={stylesState?.isUnderline}>
        <Underline size={22} color={stylesState?.isUnderline ? Colors.primary : Colors.text} />
      </ToolButton>
      <ToolButton onPress={onStrikethrough} isActive={stylesState?.isStrikeThrough}>
        <Strikethrough size={22} color={stylesState?.isStrikeThrough ? Colors.primary : Colors.text} />
      </ToolButton>
      <View style={styles.divider} />
      <ToolButton onPress={onBulletList} isActive={stylesState?.isUnorderedList}>
        <List size={22} color={stylesState?.isUnorderedList ? Colors.primary : Colors.text} />
      </ToolButton>
      <ToolButton onPress={onOrderedList} isActive={stylesState?.isOrderedList}>
        <ListOrdered size={22} color={stylesState?.isOrderedList ? Colors.primary : Colors.text} />
      </ToolButton>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  toolButton: {
    padding: Spacing.sm,
    marginHorizontal: 2,
    borderRadius: BorderRadius.sm,
  },
  toolButtonActive: {
    backgroundColor: Colors.surfaceSecondary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
});
