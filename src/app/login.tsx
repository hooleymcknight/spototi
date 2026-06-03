import { Pressable, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';

import { ThemedText } from '@/components/themed/themed-text';
import { ThemedView } from '@/components/themed/themed-view';
import { Spacing } from '@/constants/theme';

import { getCodeChallenge } from '../hooks/auth/generateCodeChallenge';

WebBrowser.maybeCompleteAuthSession(); // what a funny name for a function. apparently we need this so the browser can be properly dismissed.

export const discovery = {
    authEndpoint: 'spotify auth here',
    tokenEndpoint: 'spotify token here... not the actual token of course.',
    revocationEndpoint: 'REVOEK! I\'m not fixing that typo.'
}

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'spototi' });
// const redirectUri = 'https://hollymphillips.com/projects/spototi/callback';
const scope = 'user-read-private user-read-email';
const authUrl = new URL("https://accounts.spotify.com/authorize");

const STORE_OPTS = {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    /**
     * might need to change this if the porting takes long enough that
     * this app needs to run as a background process.
     * I am assuming it will, thinking about my Everything playlist.
     * that would be SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
     * fuck it let's just switch now.
     */
}

export const storeTokens = async (t: any) => { // figure out what type this needs to be!! definitely an obj but of what frame....
    await SecureStore.setItemAsync('access_token', t.accessToken, STORE_OPTS);
    if (t.refreshToken) {
        await SecureStore.setItemAsync('refresh_token', t.refreshToken, STORE_OPTS);
    }
    // optional, I can plop in a t.issuedAt + t.expiresIn if I wanted to get the refresh token more proactively than "oh shit it expired"
    // I might do this.... but it's v2.
}

export const refreshTokens = async () => {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    if (!refreshToken) throw new Error('no refresh token. get the user to redo the auth flow');

    const result = await AuthSession.refreshAsync(
        { clientId: process.env.EXPO_PUBLIC_CLIENT_ID, refreshToken },
        discovery
    );
    await storeTokens(result);
    return result.accessToken;
}

/**
 * where the api calls are, make sure that a 401 response (unauthorized) triggers the refreshTokens() function.
 * and then you get a retry too. if that fails, it's probably because the oauth overall has expired, which is what, 3 months for spotify?
 * and then we can ask the user to reauth. then call promptAsync()
 */

export default function Login() {
    const params =  {
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope,
        code_challenge_method: 'S256',
        redirect_uri: redirectUri,
    }

    const handleLogin = async () => {
        const { verifier, challenge } = await getCodeChallenge();
        authUrl.search = new URLSearchParams({...params, code_challenge: challenge }).toString()
        const result = await WebBrowser.openAuthSessionAsync(authUrl.toString(), 'myapp://callback');
        if (result.type !== 'success') return;

        const code = new URL(result.url).searchParams.get('code');
        if (!code) return;

        await AuthSession.exchangeCodeAsync(
            {
                clientId: process.env.CLIENT_ID ?? '',
                code,
                redirectUri,
                extraParams: { code_verifier: verifier }, //PKCE proooooof
            },
            discovery
        )
        .then(storeTokens);
    }

    return (
        <>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="subtitle">Login</ThemedText>
                <ThemedText style={styles.centerText} themeColor="textSecondary">
                    Click below to log in.
                </ThemedText>

                <Pressable style={({ pressed }) => pressed && styles.pressed}
                    onPress={handleLogin}
                >
                    <ThemedText type="link">Login</ThemedText>
                </Pressable>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
