import React from 'react';
import { 
    Pressable, StyleSheet,
    Text, PressableStateCallbackType,
    StyleProp, ViewStyle, TextStyle
 } from 'react-native';

type Props = {
    text: string;
    submitHandler: () => void;
    canSubmit?: boolean;
    customStyles?: StyleProp<ViewStyle>;
    customTextStyles?: StyleProp<TextStyle>;
};

export default function BasicButton({ text, submitHandler, canSubmit = true, customStyles = {}, customTextStyles = {} } : Props) {
    
    return (
        <Pressable
            style={({ pressed }: PressableStateCallbackType) => [
                styles.btn,
                customStyles,
                // hovered && styles.btnHovered,
                pressed && styles.btnPressed,
                !canSubmit && styles.btnDisabled,
                text.toLowerCase() === 'delete' ? { backgroundColor: '#a20000'} : null,
                // text.toLowerCase() === 'delete' && hovered ? { backgroundColor: '#a64c4c'} : null
            ]}
            disabled={!canSubmit}
            onPress={submitHandler}
        >
            <Text style={[styles.btnText, customTextStyles]}>{text}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    inputBtnContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 16,
        width: 'auto',
        marginHorizontal: 'auto',
        marginBottom: 24,
    },
    btnText: {
        fontSize: 20,
        color: '#fff',
        includeFontPadding: false,
        textAlignVertical: 'center',
        // backgroundColor: '#a200004a', // for testing
    },
    btn: {
        backgroundColor: '#2932b7',
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        width: 'auto',
        overflow: 'hidden',
    },
    btnHovered: {
        backgroundColor: '#565cb3',
    },
    btnPressed: {
        backgroundColor: '#565cb3',
    },
    btnDisabled: {
        backgroundColor: 'grey',
        // cursor: 'not-allowed',
    },
});