/**
 * Audio player for received μ-law audio with mark/clear support
 * Twilio Media Streams compatible
 */

import { decodeUlaw } from './g711'
import { int16ToFloat32 } from './resampler'
import { getAudioContext } from './audioContext'

interface ScheduledBuffer {
    source: AudioBufferSourceNode
    startTime: number
    duration: number
    markName?: string
}

export interface AudioPlayerOptions {
    onMarkPlayed?: (markName: string) => void
}

export class AudioPlayer {
    private isPlaying = false
    private scheduledTime = 0
    private readonly targetSampleRate = 8000
    private scheduledBuffers: ScheduledBuffer[] = []
    private checkInterval: ReturnType<typeof setInterval> | null = null
    private options: AudioPlayerOptions

    constructor(options: AudioPlayerOptions = {}) {
        this.options = options
        this.scheduledTime = 0
    }

    /**
     * Play μ-law encoded audio data
     * @param ulawBase64 Base64 encoded μ-law audio
     * @param markName Optional mark name to track when this audio completes
     */
    playUlawBase64(ulawBase64: string, markName?: string): void {
        try {
            // Decode base64 to bytes
            const binaryString = atob(ulawBase64)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }

            // Decode μ-law to linear PCM
            const pcmInt16 = decodeUlaw(bytes)
            const pcmFloat32 = int16ToFloat32(pcmInt16)

            // Play audio
            this.playFloat32(pcmFloat32, markName)
        } catch (error) {
            console.error('Error playing audio:', error)
        }
    }

    /**
     * Queue a mark to be returned when current audio completes
     */
    queueMark(markName: string): void {
        const ctx = getAudioContext()
        // Mark will fire when all currently scheduled audio completes
        const markBuffer: ScheduledBuffer = {
            source: ctx.createBufferSource(), // Dummy source, won't be played
            startTime: this.scheduledTime,
            duration: 0,
            markName
        }
        this.scheduledBuffers.push(markBuffer)
        this.startCheckInterval()
    }

    /**
     * Clear all scheduled audio immediately (barge-in support)
     */
    clear(): void {
        // Stop all scheduled sources
        for (const buffer of this.scheduledBuffers) {
            try {
                buffer.source.stop()
            } catch {
                // Source may not have started yet
            }
        }
        this.scheduledBuffers = []

        // Reset scheduling
        this.isPlaying = false
        this.scheduledTime = 0

        // Stop check interval
        if (this.checkInterval) {
            clearInterval(this.checkInterval)
            this.checkInterval = null
        }
    }

    /**
     * Play Float32Array audio samples at 8kHz
     */
    private playFloat32(samples: Float32Array, markName?: string): void {
        const ctx = getAudioContext()

        // Create audio buffer at 8kHz
        const audioBuffer = ctx.createBuffer(1, samples.length, this.targetSampleRate)

        // Copy samples to the audio buffer channel
        const channelData = audioBuffer.getChannelData(0)
        channelData.set(samples)

        // Create buffer source
        const source = ctx.createBufferSource()
        source.buffer = audioBuffer
        source.connect(ctx.destination)

        // Schedule playback
        if (!this.isPlaying || this.scheduledTime < ctx.currentTime) {
            this.scheduledTime = ctx.currentTime
            this.isPlaying = true
        }

        const startTime = this.scheduledTime
        source.start(startTime)
        this.scheduledTime += audioBuffer.duration

        // Track scheduled buffer
        this.scheduledBuffers.push({
            source,
            startTime,
            duration: audioBuffer.duration,
            markName
        })

        // Start checking for completed buffers
        this.startCheckInterval()
    }

    private startCheckInterval(): void {
        if (this.checkInterval) return

        this.checkInterval = setInterval(() => {
            this.checkCompletedBuffers()
        }, 50) // Check every 50ms
    }

    private checkCompletedBuffers(): void {
        const ctx = getAudioContext()
        const currentTime = ctx.currentTime

        // Find completed buffers
        const completed: ScheduledBuffer[] = []
        this.scheduledBuffers = this.scheduledBuffers.filter(buffer => {
            const endTime = buffer.startTime + buffer.duration
            if (currentTime >= endTime) {
                completed.push(buffer)
                return false
            }
            return true
        })

        // Fire mark callbacks for completed buffers
        for (const buffer of completed) {
            if (buffer.markName && this.options.onMarkPlayed) {
                this.options.onMarkPlayed(buffer.markName)
            }
        }

        // Stop interval if no more buffers
        if (this.scheduledBuffers.length === 0 && this.checkInterval) {
            clearInterval(this.checkInterval)
            this.checkInterval = null
            this.isPlaying = false
        }
    }

    /**
     * Stop playback and reset state
     */
    stop(): void {
        this.clear()
    }
}
