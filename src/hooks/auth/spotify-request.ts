import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession(); // what a funny name for a function. apparently we need this so the browser can be properly dismissed.

export const discovery = {
    authEndpoint: 'spotify auth here',
    tokenEndpoint: 'spotify token here... not the actual token of course.',
    revocationEndpoint: 'REVOEK! I\'m not fixing that typo.'
}

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'spototi' });

const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
        clientId: process.env.CLIENT_ID ?? '', // this will need moved to expo_public or just outright changed, later.
        scopes: [],
        redirectUri,
        usePKCE: true, // this thingy creates a verifier thingy and a challenge thing
        responseType: AuthSession.ResponseType.Code,
        extraParams: { access_type: 'offline' } // might need this to issue a refresh token, although maybe not...
    },
    discovery
);

useEffect(() => {
    if (response?.type === 'success') {
        AuthSession.exchangeCodeAsync(
            {
                clientId: process.env.CLIENT_ID ?? '',
                code: response.params.code,
                redirectUri,
                extraParams: { code_verifier: request?.codeVerifier ?? '' }, //PKCE proooooof
            },
            discovery
        )
        .then(storeTokens);
    }
}, [response]);

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
        { clientId: process.env.CLIENT_ID ?? '', refreshToken },
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