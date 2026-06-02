import * as Device from 'expo-device';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon/animated-icon';
import { ThemedText } from '@/components/themed/themed-text';
import { ThemedView } from '@/components/themed/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ThemedView style={styles.heroSection}>
                    <AnimatedIcon />
                    <ThemedText type="title" style={styles.title}>
                        Spotify -&#8288;&gt; Tidal
                    </ThemedText>
                </ThemedView>

                <ThemedText type="code" style={styles.code}>
                    get started
                </ThemedText>

                <ThemedView type="backgroundElement" style={styles.stepContainer}>
                    {/*  */}
                </ThemedView>

                {Platform.OS === 'web' && <WebBadge />}
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        alignItems: 'center',
        gap: Spacing.three,
        paddingBottom: BottomTabInset + Spacing.three,
        maxWidth: MaxContentWidth,
    },
    heroSection: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingHorizontal: Spacing.four,
        gap: Spacing.four,
    },
    title: {
        textAlign: 'center',
    },
    code: {
        textTransform: 'uppercase',
    },
    stepContainer: {
        gap: Spacing.three,
        alignSelf: 'stretch',
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.four,
        borderRadius: Spacing.four,
    },
});
