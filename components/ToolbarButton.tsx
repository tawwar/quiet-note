import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { LightColors as Colors } from '@/constants/theme';

interface ToolbarButtonProps {
    icon?: LucideIcon;
    text?: string;
    isActive: boolean;
    onPress: () => void;
    theme: any;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    icon: Icon,
    text,
    isActive,
    onPress,
    theme,
}) => {
    const activeColor = theme.primary;
    const inactiveColor = theme.text;
    const activeBg = theme.backgroundSecondary;

    return (
        <Pressable
            style={[styles.container, isActive && { backgroundColor: activeBg }]}
            onPress={onPress}
        >
            {Icon ? (
                <Icon size={20} color={isActive ? activeColor : inactiveColor} />
            ) : (
                <Text style={[styles.text, { color: isActive ? activeColor : inactiveColor }]}>
                    {text}
                </Text>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 44, // Slightly smaller than 56 to fit more
        height: 44,
        borderRadius: 8,
        marginRight: 4,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
