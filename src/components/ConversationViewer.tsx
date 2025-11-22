import React from 'react'
import { User, Bot } from 'lucide-react'

export type TranscriptItem = {
    role: 'user' | 'assistant'
    text: string
    timestamp: string
}

interface ConversationViewerProps {
    transcript: TranscriptItem[]
}

export function ConversationViewer({ transcript }: ConversationViewerProps) {
    if (!transcript || transcript.length === 0) {
        return <div className="text-zinc-500 text-sm">会話ログはありません</div>
    }

    return (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-lg max-h-[500px] overflow-y-auto">
            {transcript.map((item, index) => {
                const isUser = item.role === 'user'
                const date = new Date(item.timestamp)
                const timeString = date.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                })

                return (
                    <div
                        key={index}
                        className={`flex items-start gap-3 ${isUser ? 'flex-row' : 'flex-row-reverse'
                            }`}
                    >
                        <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                }`}
                        >
                            {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        <div
                            className={`flex flex-col max-w-[80%] ${isUser ? 'items-start' : 'items-end'
                                }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-2xl text-sm ${isUser
                                    ? 'bg-indigo-600 text-white rounded-tl-none'
                                    : 'bg-white border border-zinc-200 text-zinc-800 rounded-tr-none shadow-sm'
                                    }`}
                            >
                                {item.text}
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-1 px-1">
                                {timeString}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
