/**
 * AudioContext utilities for microphone access
 */

let audioContext: AudioContext | null = null

/**
 * Get or create AudioContext instance
 */
export function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext()
    }
    return audioContext
}

/**
 * Resume AudioContext (required after user gesture)
 */
export async function resumeAudioContext(): Promise<void> {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
        await ctx.resume()
    }
}

/**
 * Request microphone access and return MediaStream
 */
export async function getMicrophoneStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        },
        video: false
    })
}

/**
 * Close AudioContext
 */
export function closeAudioContext(): void {
    if (audioContext) {
        audioContext.close()
        audioContext = null
    }
}
