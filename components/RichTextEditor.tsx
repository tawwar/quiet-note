import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { EnrichedTextInput } from 'react-native-enriched';
import type { EnrichedTextInputInstance, OnChangeStateEvent } from 'react-native-enriched';
import { Colors, FontSizes } from '@/constants/theme';

export interface RichTextEditorRef {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrikethrough: () => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
  getHtml: () => Promise<string>;
  setHtml: (html: string) => void;
  focus: () => void;
  blur: () => void;
}

export interface RichTextEditorProps {
  placeholder?: string;
  initialHtml?: string;
  onChangeState?: (state: OnChangeStateEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ placeholder, initialHtml, onChangeState, onFocus, onBlur, style }, ref) => {
    const inputRef = useRef<EnrichedTextInputInstance>(null);

    useImperativeHandle(ref, () => ({
      toggleBold: () => inputRef.current?.toggleBold(),
      toggleItalic: () => inputRef.current?.toggleItalic(),
      toggleUnderline: () => inputRef.current?.toggleUnderline(),
      toggleStrikethrough: () => inputRef.current?.toggleStrikeThrough(),
      toggleBulletList: () => inputRef.current?.toggleUnorderedList(),
      toggleOrderedList: () => inputRef.current?.toggleOrderedList(),
      getHtml: async () => {
        const html = await inputRef.current?.getHTML();
        return html || '';
      },
      setHtml: (html: string) => {
        inputRef.current?.setValue(html);
      },
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    return (
      <View style={[styles.container, style]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
          indicatorStyle="black"
          nestedScrollEnabled={true}
        >
          <EnrichedTextInput
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor={Colors.textTertiary}
            onChangeState={(e) => onChangeState?.(e.nativeEvent)}
            onFocus={onFocus}
            onBlur={onBlur}
            style={styles.input}
            defaultValue={initialHtml}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
    textAlignVertical: 'top',
    minHeight: 200,
  },
});

export default RichTextEditor;
