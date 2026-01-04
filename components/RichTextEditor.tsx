import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
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
      <EnrichedTextInput
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        onChangeState={(e) => onChangeState?.(e.nativeEvent)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={[styles.input, style] as any}
        defaultValue={initialHtml}
      />
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

const styles = StyleSheet.create({
  input: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
    minHeight: 150,
    textAlignVertical: 'top',
  },
});

export default RichTextEditor;
