'use client'

import { useState, useRef, useEffect } from 'react'
import { AgentSettings, ConfigMetadata } from '@/types/agent'
import { Send, Sparkles, Save, Loader2, Bot, User } from 'lucide-react'
import { saveAgentSettings } from './actions'

interface ConciergeBuilderProps {
    initialSettings: AgentSettings
}

type Message = {
    role: 'user' | 'assistant'
    content: string
}

export function ConciergeBuilder({ initialSettings }: ConciergeBuilderProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'こんにちは！AiLunaのセットアップコンシェルジュです。あなたの会社の電話番AIを作成するために、いくつか質問をさせてください。まず、どのような業種・ビジネスをされていますか？' }
    ])
    const [input, setInput] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [currentSettings, setCurrentSettings] = useState<AgentSettings>(initialSettings)
    const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async () => {
        if (!input.trim() || isChatLoading) return

        const userMessage: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsChatLoading(true)

        try {
            const response = await fetch('/api/builder/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
        } catch (error) {
            console.error('Chat error:', error)
            alert('エラーが発生しました。もう一度お試しください。')
        } finally {
            setIsChatLoading(false)
        }
    }

    const handleGenerateSettings = async () => {
        if (isGenerating) return
        setIsGenerating(true)

        try {
            const response = await fetch('/api/builder/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            setCurrentSettings(data)
        } catch (error) {
            console.error('Generate error:', error)
            alert('設定の生成に失敗しました。')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (isSaving) return
        setIsSaving(true)

        try {
            const result = await saveAgentSettings(currentSettings.system_prompt, currentSettings.config_metadata)
            if (result.error) {
                alert(result.error)
            } else {
                alert('設定を保存しました！')
            }
        } catch (error) {
            console.error('Save error:', error)
            alert('保存中にエラーが発生しました。')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] gap-6">
            {/* Left Side: Chat UI Area */}
            <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-zinc-900">対話型セットアップ</h3>
                        <p className="text-xs text-zinc-500">AIと会話して設定を作りましょう</p>
                    </div>
                    <button
                        onClick={handleGenerateSettings}
                        disabled={isGenerating || messages.length < 3}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        設定を生成する
                    </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-zinc-50/30 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-white border border-zinc-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-zinc-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSendMessage()}
                            placeholder="メッセージを入力..."
                            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            disabled={isChatLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isChatLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side: Settings Preview Area */}
            <div className="w-full lg:w-[400px] bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-zinc-900">設定プレビュー</h3>
                            <p className="text-xs text-zinc-500">生成された設定を確認・保存</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !currentSettings.system_prompt}
                            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            保存
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-zinc-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('visual')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'visual'
                                    ? 'bg-white text-zinc-900 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            Visual
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'code'
                                    ? 'bg-white text-zinc-900 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            Code
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'visual' ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">基本情報</h4>
                                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 space-y-2">
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <span className="text-zinc-500">業種</span>
                                        <span className="col-span-2 font-medium text-zinc-900">{currentSettings.config_metadata.industry || '未設定'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <span className="text-zinc-500">口調</span>
                                        <span className="col-span-2 font-medium text-zinc-900">
                                            {currentSettings.config_metadata.tone === 'polite' ? '丁寧' :
                                                currentSettings.config_metadata.tone === 'friendly' ? 'フレンドリー' :
                                                    currentSettings.config_metadata.tone === 'casual' ? 'カジュアル' : '未設定'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">挨拶メッセージ</h4>
                                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 text-sm text-zinc-700">
                                    {currentSettings.config_metadata.greeting_message || '未設定'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">重要ルール</h4>
                                <ul className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 space-y-1">
                                    {currentSettings.config_metadata.rules && currentSettings.config_metadata.rules.length > 0 ? (
                                        currentSettings.config_metadata.rules.map((rule, i) => (
                                            <li key={i} className="text-xs text-zinc-600 flex gap-2">
                                                <span className="text-indigo-500">•</span>
                                                {rule}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-xs text-zinc-400">ルールはまだありません</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 h-full flex flex-col">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">システムプロンプト (Raw)</h4>
                            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 flex-1 overflow-hidden">
                                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono h-full overflow-y-auto">
                                    {currentSettings.system_prompt || '未設定'}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
