
const ALLOWED_DOMAINS = [
    "open.spotify.com",
    "music.amazon.in",
    "music.amazon.com",
    "music.apple.com",
    "www.youtube.com",
    "music.youtube.com",
    "youtu.be", // YouTube short links
    "gaana.com",
    "www.jiosaavn.com",
    "soundcloud.com",
    "on.soundcloud.com"
];

export function isValidMusicLink(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Check if the hostname includes any of the allowed domains
        return ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.includes(domain));
    } catch (e) {
        return false; // Invalid URL format
    }
}
