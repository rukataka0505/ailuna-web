'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { X, Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react'
import { WebCallClient, ConnectionStatus } from '@/lib/webCall/webCallClient'

interface DemoCallModalProps {
    isOpen: boolean
    onClose: () => void
}

interface TranscriptItem {
    id: number
    text: string
    isFinal: boolean
    speaker: 'user' | 'ai'
}

export function DemoCallModal({ isOpen, onClose }: DemoCallModalProps) {
    const [status, setStatus] = useState<ConnectionStatus>('idle')
    const [isMuted, setIsMuted] = useState(false)
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

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
            // Keep last 50 items
            const updated = [...prev, newItem].slice(-50)
            return updated
        })
    }, [])

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage)
    }, [])

    // Start call when modal opens
    useEffect(() => {
        if (!isOpen) return

        const startCall = async () => {
            setIsLoading(true)
            setError(null)
            setTranscripts([])

            try {
                // Fetch token from API
                const response = await fetch('/api/demo-call/token')
                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'トークンの取得に失敗しました')
                }

                const { token, wsUrl, userId } = await response.json()

                // Create and start client
                clientRef.current = new WebCallClient({
                    onStatusChange: handleStatusChange,
                    onTranscript: handleTranscript,
                    onError: handleError
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
    }, [isOpen, handleStatusChange, handleTranscript, handleError])

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
        onClose()
    }

    if (!isOpen) return null

    const getStatusDisplay = () => {
        switch (status) {
            case 'connecting':
                return { text: '接続中...', color: 'text-yellow-500', bg: 'bg-yellow-500/20' }
            case 'connected':
                return { text: '接続済み', color: 'text-green-500', bg: 'bg-green-500/20' }
            case 'disconnected':
                return { text: '切断されました', color: 'text-zinc-500', bg: 'bg-zinc-500/20' }
            case 'error':
                return { text: 'エラー', color: 'text-red-500', bg: 'bg-red-500/20' }
            default:
                return { text: '待機中', color: 'text-zinc-400', bg: 'bg-zinc-400/20' }
        }
    }

    const statusInfo = getStatusDisplay()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleEndCall}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">体験通話</h2>
                        <button
                            onClick={handleEndCall}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Status indicator */}
                    <div className="mt-2 flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
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
                        {isMuted && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                                <MicOff className="h-3 w-3" />
                                <span className="text-xs">ミュート中</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Transcript area */}
                <div
                    ref={transcriptContainerRef}
                    className="h-64 mx-6 mt-4 p-4 bg-zinc-800/50 rounded-xl overflow-y-auto 
                               scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
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

                {/* Controls */}
                <div className="p-6 flex items-center justify-center gap-6">
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

                {/* Hint text */}
                <div className="px-6 pb-4 text-center">
                    <p className="text-xs text-zinc-500">
                        これは体験版です。実際の電話回線は使用しません。
                    </p>
                </div>
            </div>
        </div>
    )
}
