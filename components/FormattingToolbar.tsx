import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react-native';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
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
  const { theme } = useTheme();

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
      style={[
        styles.toolButton,
        isActive && { backgroundColor: theme.surfaceSecondary },
      ]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );

  return (
    <View style={[styles.toolbar, { backgroundColor: theme.surface, borderTopColor: theme.borderLight }]}>
      <ToolButton onPress={onBold} isActive={stylesState?.isBold}>
        <Bold size={22} color={stylesState?.isBold ? theme.primary : theme.text} />
      </ToolButton>
      <ToolButton onPress={onItalic} isActive={stylesState?.isItalic}>
        <Italic size={22} color={stylesState?.isItalic ? theme.primary : theme.text} />
      </ToolButton>
      <ToolButton onPress={onUnderline} isActive={stylesState?.isUnderline}>
        <Underline size={22} color={stylesState?.isUnderline ? theme.primary : theme.text} />
      </ToolButton>
      <ToolButton onPress={onStrikethrough} isActive={stylesState?.isStrikeThrough}>
        <Strikethrough size={22} color={stylesState?.isStrikeThrough ? theme.primary : theme.text} />
      </ToolButton>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <ToolButton onPress={onBulletList} isActive={stylesState?.isUnorderedList}>
        <List size={22} color={stylesState?.isUnorderedList ? theme.primary : theme.text} />
      </ToolButton>
      <ToolButton onPress={onOrderedList} isActive={stylesState?.isOrderedList}>
        <ListOrdered size={22} color={stylesState?.isOrderedList ? theme.primary : theme.text} />
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
    borderTopWidth: 1,
  },
  toolButton: {
    padding: Spacing.sm,
    marginHorizontal: 2,
    borderRadius: BorderRadius.sm,
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: Spacing.sm,
  },
});
