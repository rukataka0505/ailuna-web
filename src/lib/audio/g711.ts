/**
 * G.711 μ-law (mu-law) codec implementation
 * Used for telephony audio encoding/decoding
 */

// μ-law compression parameters
const ULAW_BIAS = 0x84
const ULAW_CLIP = 32635

// Segment encoding table
const SEG_END = [0xFF, 0x1FF, 0x3FF, 0x7FF, 0xFFF, 0x1FFF, 0x3FFF, 0x7FFF]

/**
 * Encode a single 16-bit linear sample to 8-bit μ-law
 */
function linearToUlaw(sample: number): number {
    let sign = 0
    let exponent = 0
    let mantissa = 0
    let ulawByte = 0

    // Get the sign and magnitude
    if (sample < 0) {
        sign = 0x80
        sample = -sample
    }

    // Clip the sample
    if (sample > ULAW_CLIP) {
        sample = ULAW_CLIP
    }

    // Add bias
    sample += ULAW_BIAS

    // Find segment number
    for (exponent = 0; exponent < 8; exponent++) {
        if (sample <= SEG_END[exponent]) {
            break
        }
    }

    // Combine sign, segment, and quantization
    if (exponent >= 8) {
        ulawByte = 0x7F ^ sign
    } else {
        mantissa = (sample >> (exponent + 3)) & 0x0F
        ulawByte = ~(sign | (exponent << 4) | mantissa) & 0xFF
    }

    return ulawByte
}

/**
 * Decode a single 8-bit μ-law sample to 16-bit linear
 */
function ulawToLinear(ulawByte: number): number {
    // Complement to obtain sign + segment
    ulawByte = ~ulawByte & 0xFF

    const sign = (ulawByte & 0x80) !== 0
    const exponent = (ulawByte >> 4) & 0x07
    const mantissa = ulawByte & 0x0F

    // Compute magnitude
    let sample = ((mantissa << 3) + ULAW_BIAS) << exponent
    sample -= ULAW_BIAS

    return sign ? -sample : sample
}

/**
 * Encode Int16Array to μ-law encoded Uint8Array
 */
export function encodeUlaw(samples: Int16Array): Uint8Array {
    const output = new Uint8Array(samples.length)
    for (let i = 0; i < samples.length; i++) {
        output[i] = linearToUlaw(samples[i])
    }
    return output
}

/**
 * Decode μ-law encoded Uint8Array to Int16Array
 */
export function decodeUlaw(bytes: Uint8Array): Int16Array {
    const output = new Int16Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) {
        output[i] = ulawToLinear(bytes[i])
    }
    return output
}
