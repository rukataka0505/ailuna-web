/**
 * Audio resampling utilities
 * Resample from browser native sample rate (typically 48kHz) to 8kHz for telephony
 */

/**
 * Resample Float32Array audio data from source to target sample rate
 * Uses linear interpolation for simplicity (MVP)
 */
export function resample(
    inputSamples: Float32Array,
    inputSampleRate: number,
    outputSampleRate: number
): Float32Array {
    if (inputSampleRate === outputSampleRate) {
        return inputSamples
    }

    const ratio = inputSampleRate / outputSampleRate
    const outputLength = Math.ceil(inputSamples.length / ratio)
    const output = new Float32Array(outputLength)

    for (let i = 0; i < outputLength; i++) {
        const srcIndex = i * ratio
        const srcIndexFloor = Math.floor(srcIndex)
        const srcIndexCeil = Math.min(srcIndexFloor + 1, inputSamples.length - 1)
        const fraction = srcIndex - srcIndexFloor

        // Linear interpolation
        output[i] = inputSamples[srcIndexFloor] * (1 - fraction) +
            inputSamples[srcIndexCeil] * fraction
    }

    return output
}

/**
 * Convert Float32Array (-1.0 to 1.0) to Int16Array (-32768 to 32767)
 */
export function float32ToInt16(samples: Float32Array): Int16Array {
    const output = new Int16Array(samples.length)
    for (let i = 0; i < samples.length; i++) {
        // Clamp to [-1, 1] range
        const s = Math.max(-1, Math.min(1, samples[i]))
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    return output
}

/**
 * Convert Int16Array to Float32Array
 */
export function int16ToFloat32(samples: Int16Array): Float32Array {
    const output = new Float32Array(samples.length)
    for (let i = 0; i < samples.length; i++) {
        output[i] = samples[i] / 0x8000
    }
    return output
}
