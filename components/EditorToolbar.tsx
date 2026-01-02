import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ToolbarButton } from './ToolbarButton';
import {
    Bold, Italic, Underline, Strikethrough, Code,
    Quote, List, ListOrdered, Link, Image as ImageIcon, AtSign
} from 'lucide-react-native';
import type { EnrichedTextInputInstance } from 'react-native-enriched'; // Assumed type source

// Define types locally if not exported clearly, or import from package
// Based on inspection, we need NativeSyntheticEvent<OnChangeStateEvent> structure "unwrapped"
// The parent will pass the "stylesState" object which matches OnChangeStateEvent interface.

interface EditorToolbarProps {
    editorRef: React.RefObject<EnrichedTextInputInstance | null>;
    editorState: any; // OnChangeStateEvent
    theme: any;
    onAddLink?: () => void;
    onAddImage?: () => void;
}

const TOOLBAR_ITEMS = [
    { name: 'bold', icon: Bold },
    { name: 'italic', icon: Italic },
    { name: 'underline', icon: Underline },
    { name: 'strikethrough', icon: Strikethrough },
    { name: 'heading-1', text: 'H1' },
    { name: 'heading-2', text: 'H2' },
    { name: 'heading-3', text: 'H3' },
    { name: 'unordered-list', icon: List },
    { name: 'ordered-list', icon: ListOrdered },
    { name: 'quote', icon: Quote },
    { name: 'code-block', icon: Code },
    // { name: 'link', icon: Link }, // Optional
    // { name: 'image', icon: ImageIcon }, // Optional
] as const;

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    editorRef,
    editorState,
    theme,
    onAddLink,
    onAddImage,
}) => {
    const handlePress = (item: typeof TOOLBAR_ITEMS[number]) => {
        const editor = editorRef.current;
        if (!editor) return;

        switch (item.name) {
            case 'bold': editor.toggleBold(); break;
            case 'italic': editor.toggleItalic(); break;
            case 'underline': editor.toggleUnderline(); break;
            case 'strikethrough': editor.toggleStrikeThrough(); break;
            case 'heading-1': editor.toggleH1(); break;
            case 'heading-2': editor.toggleH2(); break;
            case 'heading-3': editor.toggleH3(); break;
            case 'unordered-list': editor.toggleUnorderedList(); break;
            case 'ordered-list': editor.toggleOrderedList(); break;
            case 'quote': editor.toggleBlockQuote(); break;
            case 'code-block': editor.toggleCodeBlock(); break;
            // case 'link': onAddLink?.(); break;
            // case 'image': onAddImage?.(); break;
        }
    };

    const isActive = (item: typeof TOOLBAR_ITEMS[number]) => {
        switch (item.name) {
            case 'bold': return editorState?.isBold;
            case 'italic': return editorState?.isItalic;
            case 'underline': return editorState?.isUnderline;
            case 'strikethrough': return editorState?.isStrikeThrough;
            case 'heading-1': return editorState?.isH1;
            case 'heading-2': return editorState?.isH2;
            case 'heading-3': return editorState?.isH3;
            case 'unordered-list': return editorState?.isUnorderedList;
            case 'ordered-list': return editorState?.isOrderedList;
            case 'quote': return editorState?.isBlockQuote;
            case 'code-block': return editorState?.isCodeBlock;
            default: return false;
        }
    };

    return (
        <View style={[styles.container, { borderTopColor: theme.borderLight, backgroundColor: theme.white }]}>
            <FlatList
                data={TOOLBAR_ITEMS}
                horizontal
                showsHorizontalScrollIndicator={true}
                renderItem={({ item }) => (
                    <ToolbarButton
                        icon={(item as any).icon}
                        text={(item as any).text}
                        isActive={!!isActive(item)}
                        onPress={() => handlePress(item)}
                        theme={theme}
                    />
                )}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderTopWidth: 1,
        paddingVertical: 8,
    },
    contentContainer: {
        paddingHorizontal: 16,
        gap: 4,
    },
});
