import * as Crypto from 'expo-crypto';

const generateRandomString = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = Crypto.getRandomBytes(length);
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256ToBase64url = async (plain: string) => {
    const base64 = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        plain,
        { encoding: Crypto.CryptoEncoding.BASE64 } // hash + base64 in one step
    );
    // base64 -> base64url (the URL-safe swap we talked about)
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export const getCodeChallenge = async () => {
    const verifier = generateRandomString(64);
    const challenge = await sha256ToBase64url(verifier);
    return {
        verifier,
        challenge
    };
}