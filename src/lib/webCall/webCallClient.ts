/**
 * WebSocket client for browser-based voice calls
 * Twilio Media Streams compatible
 */

import { getMicrophoneStream, resumeAudioContext, getAudioContext } from '../audio/audioContext'
import { resample, float32ToInt16 } from '../audio/resampler'
import { encodeUlaw } from '../audio/g711'
import { AudioPlayer } from '../audio/audioPlayer'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface WebCallClientOptions {
    onStatusChange?: (status: ConnectionStatus) => void
    onTranscript?: (text: string, isFinal: boolean, speaker: 'user' | 'ai') => void
    onError?: (error: string) => void
    onCallEnded?: () => void
    enableGreetingSuppression?: boolean
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

export class WebCallClient {
    private ws: WebSocket | null = null
    private mediaStream: MediaStream | null = null
    private scriptProcessor: ScriptProcessorNode | null = null
    private audioPlayer: AudioPlayer | null = null
    private isMuted = false
    private status: ConnectionStatus = 'idle'

    private readonly sampleRate = 8000
    private readonly chunkMs = 20
    private readonly samplesPerChunk: number

    private streamSid: string = ''
    private callSid: string = ''
    private options: WebCallClientOptions

    // Greeting suppression state
    private isGreetingPhase = false
    private lastMediaReceivedAt = 0
    private greetingSafetyTimeoutId: ReturnType<typeof setTimeout> | null = null
    private greetingUnlockTimeoutId: ReturnType<typeof setTimeout> | null = null

    // Assistant speaking suppression state (extends greeting logic to entire conversation)
    private isAssistantSpeaking = false
    private assistantUnlockTimeoutId: ReturnType<typeof setTimeout> | null = null

    constructor(options: WebCallClientOptions = {}) {
        this.options = {
            enableGreetingSuppression: true, // Default to true
            ...options
        }
        this.samplesPerChunk = (this.sampleRate * this.chunkMs) / 1000 // 160 samples at 8kHz
    }

    /**
     * Start a web call session with an already-acquired MediaStream
     * This is the preferred method for iOS compatibility - getUserMedia should be called
     * FIRST in the click handler before any async operations
     */
    async startWithStream(
        stream: MediaStream,
        wsUrl: string,
        token: string,
        userId: string
    ): Promise<void> {
        if (this.status !== 'idle' && this.status !== 'disconnected' && this.status !== 'error') {
            console.warn('[WebCallClient] Call already in progress')
            return
        }

        console.log('[WebCallClient] Starting with pre-acquired stream')
        this.setStatus('connecting')

        // Initialize greeting suppression
        this.isGreetingPhase = !!this.options.enableGreetingSuppression
        this.lastMediaReceivedAt = 0
        if (this.isGreetingPhase) {
            console.log('[WebCallClient] Greeting suppression enabled. Audio input blocked until greeting finishes.')
            // Safety timeout: Disable suppression after 5 seconds if audio never arrives or logic fails
            this.greetingSafetyTimeoutId = setTimeout(() => {
                if (this.isGreetingPhase) {
                    console.log('[WebCallClient] Greeting safety timeout (5s). Unblocking audio.')
                    this.isGreetingPhase = false
                }
            }, 5000)
        }

        // Generate UUIDs for streamSid and callSid (client-side)
        this.streamSid = generateUUID()
        this.callSid = generateUUID()

        try {
            // Use the provided stream
            this.mediaStream = stream

            // Resume AudioContext (required for audio playback)
            console.log('[WebCallClient] Resuming AudioContext...')
            await resumeAudioContext()
            console.log('[WebCallClient] AudioContext resumed')

            // Connect to WebSocket with token
            const wsUrlWithToken = `${wsUrl}?token=${encodeURIComponent(token)}`
            console.log('[WebCallClient] Connecting to WebSocket...')
            this.ws = new WebSocket(wsUrlWithToken)

            this.ws.onopen = () => {
                console.log('[WebCallClient] WebSocket connected')
                // Send start event (Twilio Media Streams format)
                this.ws?.send(JSON.stringify({
                    event: 'start',
                    start: {
                        streamSid: this.streamSid,
                        callSid: this.callSid,
                        customParameters: {
                            userId
                        }
                    }
                }))
                this.setStatus('connected')

                // Start audio capture
                this.startAudioCapture()
            }

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data)
            }

            this.ws.onerror = (error) => {
                console.error('[WebCallClient] WebSocket error:', error)
                this.options.onError?.('接続エラーが発生しました')
                this.setStatus('error')
            }

            this.ws.onclose = (event) => {
                console.log('[WebCallClient] WebSocket closed:', event.code, event.reason)
                if (this.status === 'connected' || this.status === 'connecting') {
                    this.setStatus('disconnected')
                    this.options.onCallEnded?.()
                }
                this.cleanup()
            }

            // Initialize audio player with mark callback
            this.audioPlayer = new AudioPlayer({
                onMarkPlayed: (markName) => {
                    // Send mark back to server when audio completes
                    this.sendMark(markName)
                },
                onQueueEmpty: () => {
                    // Assistant speaking unlock (general conversation)
                    if (this.isAssistantSpeaking && this.lastMediaReceivedAt > 0) {
                        if (!this.assistantUnlockTimeoutId) {
                            this.assistantUnlockTimeoutId = setTimeout(() => {
                                const now = performance.now()
                                const timeSinceLastMedia = now - this.lastMediaReceivedAt

                                if (timeSinceLastMedia >= 500) {
                                    console.log('[WebCallClient] Assistant speaking finished (Queue empty + 500ms quiet). Unblocking audio.')
                                    this.isAssistantSpeaking = false
                                    // Also clear greeting phase if still active
                                    if (this.isGreetingPhase) {
                                        this.isGreetingPhase = false
                                    }
                                }
                                this.assistantUnlockTimeoutId = null
                            }, 500)
                        }
                    }
                }
            })

        } catch (error) {
            console.error('[WebCallClient] Failed to start call:', error)
            this.options.onError?.('通話の開始に失敗しました')
            this.setStatus('error')
            this.cleanup()
        }
    }

    /**
     * Start a web call session (legacy method)
     * WARNING: On iOS, this may fail because getUserMedia is called after async operations,
     * breaking the user gesture context. Use startWithStream() instead.
     */
    async start(wsUrl: string, token: string, userId: string): Promise<void> {
        if (this.status !== 'idle' && this.status !== 'disconnected' && this.status !== 'error') {
            console.warn('Call already in progress')
            return
        }

        this.setStatus('connecting')

        // Initialize greeting suppression
        this.isGreetingPhase = !!this.options.enableGreetingSuppression
        this.lastMediaReceivedAt = 0
        if (this.isGreetingPhase) {
            console.log('[WebCallClient] Greeting suppression enabled. Audio input blocked until greeting finishes.')
            this.greetingSafetyTimeoutId = setTimeout(() => {
                if (this.isGreetingPhase) {
                    console.log('[WebCallClient] Greeting safety timeout (5s). Unblocking audio.')
                    this.isGreetingPhase = false
                }
            }, 5000)
        }

        // Generate UUIDs for streamSid and callSid (client-side)
        this.streamSid = generateUUID()
        this.callSid = generateUUID()

        try {
            // Resume AudioContext (required after user gesture)
            await resumeAudioContext()

            // Request microphone access
            this.mediaStream = await getMicrophoneStream()

            // Connect to WebSocket with token
            const wsUrlWithToken = `${wsUrl}?token=${encodeURIComponent(token)}`
            this.ws = new WebSocket(wsUrlWithToken)

            this.ws.onopen = () => {
                // Send start event (Twilio Media Streams format)
                this.ws?.send(JSON.stringify({
                    event: 'start',
                    start: {
                        streamSid: this.streamSid,
                        callSid: this.callSid,
                        customParameters: {
                            userId
                        }
                    }
                }))
                this.setStatus('connected')

                // Start audio capture
                this.startAudioCapture()
            }

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data)
            }

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                this.options.onError?.('接続エラーが発生しました')
                this.setStatus('error')
            }

            this.ws.onclose = () => {
                if (this.status === 'connected' || this.status === 'connecting') {
                    this.setStatus('disconnected')
                    this.options.onCallEnded?.()
                }
                this.cleanup()
            }

            // Initialize audio player with mark callback
            // Initialize audio player with mark callback
            this.audioPlayer = new AudioPlayer({
                onMarkPlayed: (markName) => {
                    // Send mark back to server when audio completes
                    this.sendMark(markName)
                },
                onQueueEmpty: () => {
                    // Assistant speaking unlock (general conversation)
                    if (this.isAssistantSpeaking && this.lastMediaReceivedAt > 0) {
                        if (!this.assistantUnlockTimeoutId) {
                            this.assistantUnlockTimeoutId = setTimeout(() => {
                                const now = performance.now()
                                const timeSinceLastMedia = now - this.lastMediaReceivedAt

                                if (timeSinceLastMedia >= 500) {
                                    console.log('[WebCallClient] Assistant speaking finished (Queue empty + 500ms quiet). Unblocking audio.')
                                    this.isAssistantSpeaking = false
                                    // Also clear greeting phase if still active
                                    if (this.isGreetingPhase) {
                                        this.isGreetingPhase = false
                                    }
                                }
                                this.assistantUnlockTimeoutId = null
                            }, 500)
                        }
                    }
                }
            })

        } catch (error) {
            console.error('Failed to start call:', error)
            if (error instanceof DOMException && error.name === 'NotAllowedError') {
                this.options.onError?.('マイクへのアクセスが許可されていません')
            } else {
                this.options.onError?.('通話の開始に失敗しました')
            }
            this.setStatus('error')
            this.cleanup()
        }
    }

    /**
     * End the call
     */
    stop(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            // Send stop event (Twilio Media Streams format)
            this.ws.send(JSON.stringify({
                event: 'stop',
                streamSid: this.streamSid,
                stop: {
                    callSid: this.callSid
                }
            }))
            this.ws.close()
        }
        this.cleanup()
        this.setStatus('disconnected')
        this.options.onCallEnded?.()
    }

    /**
     * Toggle mute state
     */
    toggleMute(): boolean {
        this.isMuted = !this.isMuted
        return this.isMuted
    }

    /**
     * Get current mute state
     */
    getMuteState(): boolean {
        return this.isMuted
    }

    /**
     * Get current connection status
     */
    getStatus(): ConnectionStatus {
        return this.status
    }

    /**
     * Get stream IDs
     */
    getStreamInfo(): { streamSid: string; callSid: string } {
        return { streamSid: this.streamSid, callSid: this.callSid }
    }

    private setStatus(status: ConnectionStatus): void {
        this.status = status
        this.options.onStatusChange?.(status)
    }

    private sendMark(markName: string): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                event: 'mark',
                streamSid: this.streamSid,
                mark: {
                    name: markName
                }
            }))
        }
    }

    private handleMessage(data: string): void {
        try {
            const message = JSON.parse(data)

            switch (message.event) {
                case 'media':
                    // Play received audio (Twilio format: media.payload)
                    if (message.media?.payload && this.audioPlayer) {
                        this.lastMediaReceivedAt = performance.now()
                        this.isAssistantSpeaking = true

                        // If we received new media during unlock wait, cancel the unlock
                        if (this.greetingUnlockTimeoutId) {
                            clearTimeout(this.greetingUnlockTimeoutId)
                            this.greetingUnlockTimeoutId = null
                        }
                        if (this.assistantUnlockTimeoutId) {
                            clearTimeout(this.assistantUnlockTimeoutId)
                            this.assistantUnlockTimeoutId = null
                        }

                        this.audioPlayer.playUlawBase64(message.media.payload)
                    }
                    break

                case 'mark':
                    // Server sent a mark - queue it to be returned when audio completes
                    if (message.mark?.name && this.audioPlayer) {
                        this.audioPlayer.queueMark(message.mark.name)
                    }
                    break

                case 'clear':
                    // Clear audio queue (barge-in)
                    if (this.audioPlayer) {
                        this.audioPlayer.clear()
                    }
                    break

                case 'transcript':
                    // Handle transcript update (custom extension)
                    this.options.onTranscript?.(
                        message.text || '',
                        message.isFinal ?? false,
                        message.speaker === 'user' ? 'user' : 'ai'
                    )
                    break

                case 'error':
                    console.error('Server error:', message.message)
                    this.options.onError?.(message.message || 'サーバーエラーが発生しました')
                    break

                case 'stop':
                    // Server requested stop
                    this.stop()
                    break

                default:
                    console.log('Unknown event type:', message.event)
            }
        } catch (error) {
            console.error('Failed to parse message:', error)
        }
    }

    private startAudioCapture(): void {
        if (!this.mediaStream) return

        const ctx = getAudioContext()
        const source = ctx.createMediaStreamSource(this.mediaStream)

        // Use ScriptProcessorNode for MVP (AudioWorklet would be better but more complex)
        const bufferSize = 4096
        this.scriptProcessor = ctx.createScriptProcessor(bufferSize, 1, 1)

        // Accumulator for chunks
        let accumulatedSamples = new Float32Array(0)

        this.scriptProcessor.onaudioprocess = (event) => {
            if (this.isMuted || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
                return
            }

            // Suppress audio during greeting phase or while assistant is speaking
            if (this.isGreetingPhase || this.isAssistantSpeaking) {
                // Clear accumulated samples to prevent stale audio on unlock
                accumulatedSamples = new Float32Array(0)
                return
            }

            const inputData = event.inputBuffer.getChannelData(0)

            // Resample to 8kHz
            const resampled = resample(inputData, ctx.sampleRate, this.sampleRate)

            // Accumulate samples
            const newAccumulated = new Float32Array(accumulatedSamples.length + resampled.length)
            newAccumulated.set(accumulatedSamples)
            newAccumulated.set(resampled, accumulatedSamples.length)
            accumulatedSamples = newAccumulated

            // Send 20ms chunks (160 samples at 8kHz)
            while (accumulatedSamples.length >= this.samplesPerChunk) {
                const chunk = accumulatedSamples.slice(0, this.samplesPerChunk)
                accumulatedSamples = accumulatedSamples.slice(this.samplesPerChunk)

                // Convert to Int16 and encode as μ-law
                const int16Chunk = float32ToInt16(chunk)
                const ulawChunk = encodeUlaw(int16Chunk)

                // Convert to base64
                const base64 = btoa(String.fromCharCode(...ulawChunk))

                // Send media message (Twilio Media Streams format)
                this.ws?.send(JSON.stringify({
                    event: 'media',
                    streamSid: this.streamSid,
                    media: {
                        payload: base64
                    }
                }))
            }
        }

        source.connect(this.scriptProcessor)
        this.scriptProcessor.connect(ctx.destination) // Required for ScriptProcessorNode to work
    }

    private cleanup(): void {
        // Stop audio capture
        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect()
            this.scriptProcessor = null
        }

        // Stop audio player
        if (this.audioPlayer) {
            this.audioPlayer.stop()
            this.audioPlayer = null
        }

        // Stop media stream
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop())
            this.mediaStream = null
        }

        // Reset WebSocket
        this.ws = null

        // Reset mute state
        this.isMuted = false

        // Reset greeting suppression state
        this.isGreetingPhase = false
        this.lastMediaReceivedAt = 0

        if (this.greetingSafetyTimeoutId) {
            clearTimeout(this.greetingSafetyTimeoutId)
            this.greetingSafetyTimeoutId = null
        }

        if (this.greetingUnlockTimeoutId) {
            clearTimeout(this.greetingUnlockTimeoutId)
            this.greetingUnlockTimeoutId = null
        }

        // Reset assistant speaking suppression state
        this.isAssistantSpeaking = false
        if (this.assistantUnlockTimeoutId) {
            clearTimeout(this.assistantUnlockTimeoutId)
            this.assistantUnlockTimeoutId = null
        }
    }
}
