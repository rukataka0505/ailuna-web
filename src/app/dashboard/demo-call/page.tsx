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

    // Start call on mount
    useEffect(() => {
        const startCall = async () => {
            setIsLoading(true)
            setError(null)
            setTranscripts([])

            try {
                const response = await fetch('/api/demo-call/token')
                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'トークンの取得に失敗しました')
                }

                const { token, wsUrl, userId } = await response.json()

                clientRef.current = new WebCallClient({
                    onStatusChange: handleStatusChange,
                    onTranscript: handleTranscript,
                    onError: handleError,
                    onCallEnded: handleCallEnded
                })

                await clientRef.current.start(wsUrl, token, userId)
            } catch (err) {
                console.error('Failed to start call:', err)
                setError(err instanceof Error ? err.message : '通話の開始に失敗しました')
                setStatus('error')
            } finally {
                setIsLoading(false)
            }
        }

        startCall()

        return () => {
            if (clientRef.current) {
                clientRef.current.stop()
                clientRef.current = null
            }
        }
    }, [handleStatusChange, handleTranscript, handleError, handleCallEnded])

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
                    {transcripts.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>接続しています...</span>
                                </div>
                            ) : status === 'connected' ? (
                                <span>話しかけてみてください...</span>
                            ) : callEnded ? (
                                <span>通話が終了しました</span>
                            ) : (
                                <span>会話履歴がここに表示されます</span>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transcripts.map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-3 rounded-xl text-sm ${item.speaker === 'ai'
                                        ? 'bg-indigo-500/20 text-indigo-100'
                                        : 'bg-zinc-700/50 text-zinc-200'
                                        } ${!item.isFinal ? 'opacity-70' : ''}`}
                                >
                                    <p>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls or Post-call navigation */}
                {!callEnded ? (
                    <div className="mt-6 flex items-center justify-center gap-6">
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
