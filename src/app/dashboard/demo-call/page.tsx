'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, PhoneOff, Loader2, ArrowLeft, Calendar, Phone } from 'lucide-react'
import { WebCallClient, ConnectionStatus } from '@/lib/webCall/webCallClient'

interface TranscriptItem {
    id: number
    text: string
    isFinal: boolean
    speaker: 'user' | 'ai'
}

export default function DemoCallPage() {
    const router = useRouter()
    const [status, setStatus] = useState<ConnectionStatus>('idle')
    const [isMuted, setIsMuted] = useState(false)
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [callEnded, setCallEnded] = useState(false)

    const clientRef = useRef<WebCallClient | null>(null)
    const transcriptIdRef = useRef(0)
    const transcriptContainerRef = useRef<HTMLDivElement>(null)
    const [hasStarted, setHasStarted] = useState(false)

    const handleStatusChange = useCallback((newStatus: ConnectionStatus) => {
        setStatus(newStatus)
    }, [])

    const handleTranscript = useCallback((text: string, isFinal: boolean, speaker: 'user' | 'ai') => {
        setTranscripts(prev => {
            const newItem: TranscriptItem = {
                id: transcriptIdRef.current++,
                text,
                isFinal,
                speaker
            }
            return [...prev, newItem].slice(-50)
        })
    }, [])

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage)
    }, [])

    const handleCallEnded = useCallback(() => {
        setCallEnded(true)
    }, [])

    // Start call function - must be called from user gesture for iOS compatibility
    // CRITICAL: getUserMedia must be called FIRST, before any async operations
    const startCall = useCallback(async () => {
        setHasStarted(true)
        setIsLoading(true)
        setError(null)
        setTranscripts([])

        let stream: MediaStream | null = null

        try {
            // Step 1: Request microphone FIRST - this MUST be in the synchronous part of the click handler
            // On iOS, any await before this will break the user gesture context
            console.log('[DemoCall] Requesting microphone access...')
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                })
                console.log('[DemoCall] Microphone access granted')
            } catch (micError) {
                console.error('[DemoCall] Microphone error:', micError)
                if (micError instanceof DOMException) {
                    if (micError.name === 'NotAllowedError') {
                        throw new Error('マイクへのアクセスが拒否されました。設定からマイクを許可してください。')
                    } else if (micError.name === 'NotFoundError') {
                        throw new Error('マイクが見つかりません。マイクが接続されているか確認してください。')
                    } else if (micError.name === 'NotSupportedError') {
                        throw new Error('このブラウザはマイクに対応していません。')
                    } else {
                        throw new Error(`マイクエラー: ${micError.name} - ${micError.message}`)
                    }
                }
                throw new Error('マイクへのアクセスに失敗しました')
            }

            // Step 2: Fetch token (after microphone is acquired)
            console.log('[DemoCall] Fetching token...')
            const response = await fetch('/api/demo-call/token')
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                console.error('[DemoCall] Token fetch failed:', response.status, data)
                throw new Error(data.error || `トークンの取得に失敗しました (${response.status})`)
            }

            const { token, wsUrl, userId } = await response.json()
            console.log('[DemoCall] Token received, connecting...')

            // Step 3: Create client and start with the already-acquired stream
            clientRef.current = new WebCallClient({
                onStatusChange: handleStatusChange,
                onTranscript: handleTranscript,
                onError: handleError,
                onCallEnded: handleCallEnded
            })

            await clientRef.current.startWithStream(stream, wsUrl, token, userId)
            console.log('[DemoCall] Call started successfully')

        } catch (err) {
            console.error('[DemoCall] Failed to start call:', err)
            setError(err instanceof Error ? err.message : '通話の開始に失敗しました')
            setStatus('error')

            // Clean up stream if we acquired it but failed later
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        } finally {
            setIsLoading(false)
        }
    }, [handleStatusChange, handleTranscript, handleError, handleCallEnded])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.stop()
                clientRef.current = null
            }
        }
    }, [])

    // Auto-scroll transcript
    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
        }
    }, [transcripts])

    const handleMuteToggle = () => {
        if (clientRef.current) {
            const newMuteState = clientRef.current.toggleMute()
            setIsMuted(newMuteState)
        }
    }

    const handleEndCall = () => {
        if (clientRef.current) {
            clientRef.current.stop()
        }
        setCallEnded(true)
    }

    const getStatusDisplay = () => {
        switch (status) {
            case 'connecting':
                return { text: '接続中...', color: 'text-yellow-500', bg: 'bg-yellow-500/20' }
            case 'connected':
                return { text: '通話中', color: 'text-green-500', bg: 'bg-green-500/20' }
            case 'disconnected':
                return { text: '終了', color: 'text-zinc-500', bg: 'bg-zinc-500/20' }
            case 'error':
                return { text: 'エラー', color: 'text-red-500', bg: 'bg-red-500/20' }
            default:
                return { text: '待機中', color: 'text-zinc-400', bg: 'bg-zinc-400/20' }
        }
    }

    const statusInfo = getStatusDisplay()

    return (
        <div className="min-h-screen bg-zinc-900 flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">ダッシュボードへ戻る</span>
                    </button>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bg}`}>
                        {status === 'connecting' && (
                            <Loader2 className={`h-3 w-3 animate-spin ${statusInfo.color}`} />
                        )}
                        {status === 'connected' && (
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        )}
                        <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">体験通話</h1>
                    <p className="text-zinc-400 text-sm">
                        AIコンシェルジュと会話してみましょう
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Transcript area */}
                <div
                    ref={transcriptContainerRef}
                    className="flex-1 min-h-[300px] max-h-[500px] p-4 bg-zinc-800/50 rounded-2xl overflow-y-auto 
                               border border-zinc-700/50"
                >
                    {(() => {
                        // Filter to AI-only for display, but keep all in state
                        const aiTranscripts = transcripts.filter(item => item.speaker === 'ai')

                        if (aiTranscripts.length === 0) {
                            return (
                                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                                    {!hasStarted ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Mic className="h-12 w-12 text-zinc-600" />
                                            <span>下のボタンをタップして通話を開始</span>
                                        </div>
                                    ) : isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>接続しています...</span>
                                        </div>
                                    ) : status === 'connected' ? (
                                        <span>お待ちください...</span>
                                    ) : callEnded ? (
                                        <span>通話が終了しました</span>
                                    ) : (
                                        <span>会話履歴がここに表示されます</span>
                                    )}
                                </div>
                            )
                        }

                        return (
                            <div className="space-y-3">
                                {aiTranscripts.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-3 rounded-xl text-sm bg-indigo-500/20 text-indigo-100 ${!item.isFinal ? 'opacity-70' : ''}`}
                                    >
                                        <p>{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </div>

                {/* Controls or Post-call navigation */}
                {!callEnded ? (
                    <div className="mt-6 flex items-center justify-center gap-6">
                        {!hasStarted ? (
                            /* Start call button - requires user gesture for iOS */
                            <button
                                onClick={startCall}
                                className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 
                                           text-white rounded-full font-medium text-lg
                                           shadow-lg shadow-green-500/30 hover:shadow-green-500/50
                                           transition-all duration-200 transform hover:scale-105 active:scale-95"
                            >
                                <Mic className="h-6 w-6" />
                                <span>マイクを許可して開始</span>
                            </button>
                        ) : (
                            <>
                                {/* Mute button */}
                                <button
                                    onClick={handleMuteToggle}
                                    disabled={status !== 'connected'}
                                    className={`p-4 rounded-full transition-all duration-200 
                                               ${isMuted
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'bg-zinc-700/50 text-white hover:bg-zinc-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isMuted ? (
                                        <MicOff className="h-6 w-6" />
                                    ) : (
                                        <Mic className="h-6 w-6" />
                                    )}
                                </button>

                                {/* End call button */}
                                <button
                                    onClick={handleEndCall}
                                    className="p-5 bg-red-500 hover:bg-red-600 text-white rounded-full 
                                               shadow-lg shadow-red-500/30 hover:shadow-red-500/50
                                               transition-all duration-200 transform hover:scale-105 active:scale-95"
                                >
                                    <PhoneOff className="h-7 w-7" />
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        <p className="text-center text-zinc-400 text-sm mb-4">
                            通話が終了しました
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => router.push('/dashboard?tab=reservations')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                                           bg-indigo-600 hover:bg-indigo-700 text-white 
                                           rounded-xl font-medium transition-colors"
                            >
                                <Calendar className="h-5 w-5" />
                                予約管理へ
                            </button>
                            <button
                                onClick={() => router.push('/dashboard?tab=history')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                                           bg-zinc-700 hover:bg-zinc-600 text-white 
                                           rounded-xl font-medium transition-colors"
                            >
                                <Phone className="h-5 w-5" />
                                通話ログへ
                            </button>
                        </div>
                    </div>
                )}

                {/* Hint text */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-zinc-500">
                        これは体験版です。実際の電話回線は使用しません（PSTN発信ゼロ）
                    </p>
                    {isMuted && status === 'connected' && (
                        <p className="text-xs text-red-400 mt-2">
                            マイクがミュートされています
                        </p>
                    )}
                </div>
            </main>
        </div>
    )
}
