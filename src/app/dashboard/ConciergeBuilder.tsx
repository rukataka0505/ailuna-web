'use client'

/**
 * Setup Concierge - AI電話番の対話型設定コンポーネント
 * 
 * このコンポーネントは、ユーザーとAIの対話を通じてAI電話番の設定を生成します。
 * 
 * ## 設計方針：単一設定のプレビュー
 * プレビューエリアは常に「現在の1つの設定」のみを表示します。
 * 過去バージョンとの比較や before/after 表示は意図的に含まれていません。
 * 
 * ## データフロー
 * 1. ユーザーがチャットでヒアリング
 * 2. 「設定を生成」→ API呼び出し → currentSettings に保存
 * 3. プレビューエリアが自動更新（Visual/Codeタブで同じ設定を異なる形式で表示）
 * 4. 「保存」→ DBに保存
 * 
 * ## 将来のバージョン管理について
 * もし将来的にバージョン管理や設定の比較機能が必要になった場合は、
 * 別画面・別コンポーネントとして設計することを推奨します。
 */

import { useState, useRef, useEffect } from 'react'
import { AgentSettings, ConfigMetadata } from '@/types/agent'
import { Send, Sparkles, Save, Loader2, Bot, User, RotateCcw, Trash2 } from 'lucide-react'
import { saveAgentSettings } from './actions'

interface ConciergeBuilderProps {
    initialSettings: AgentSettings
}

type Message = {
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

const BLANK_SETTINGS: AgentSettings = {
    system_prompt: '',
    config_metadata: {
        tone: undefined,
        greeting_message: '',
        business_description: '',
        rules: [],
        business_type: ''
    }
}

export function ConciergeBuilder({ initialSettings }: ConciergeBuilderProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'こんにちは！私はAiLunaのセットアップコンシェルジュです。私と一緒に、あなたの会社の電話番AIを作成しましょう。まず、電話に出た際の「最初の挨拶」を決めましょう。どのような挨拶にしますか？', timestamp: new Date().toISOString() }
    ])
    const [input, setInput] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [justGenerated, setJustGenerated] = useState(false)
    const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat')

    /**
     * 現在の設定（単一）
     * プレビューエリアに表示される唯一の設定オブジェクトです。
     * 設定生成時に更新され、保存時にDBに永続化されます。
     * 
     * 注意: 比較用の「旧設定」や「新設定」などの状態は持ちません。
     */
    const [currentSettings, setCurrentSettings] = useState<AgentSettings>(initialSettings || BLANK_SETTINGS)
    const [savedSettings, setSavedSettings] = useState<AgentSettings>(initialSettings || BLANK_SETTINGS)
    const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (initialSettings) {
            setCurrentSettings(initialSettings)
            setSavedSettings(initialSettings)
        }
    }, [initialSettings])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Load chat history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await fetch('/api/builder/history')
                const data = await response.json()

                if (response.ok && data.messages && data.messages.length > 0) {
                    setMessages(data.messages)
                }
            } catch (error) {
                console.error('Failed to load chat history:', error)
                // Keep default welcome message on error
            } finally {
                setIsLoadingHistory(false)
            }
        }

        loadHistory()
    }, [])

    // Auto-save chat history
    const saveHistory = async (messagesToSave: Message[]) => {
        try {
            await fetch('/api/builder/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messagesToSave })
            })
        } catch (error) {
            console.error('Failed to save chat history:', error)
            // Don't block UI on save errors
        }
    }

    const handleSendMessage = async () => {
        if (!input.trim() || isChatLoading) return

        const userMessage: Message = { role: 'user', content: input, timestamp: new Date().toISOString() }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setIsChatLoading(true)

        try {
            const response = await fetch('/api/builder/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
                })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            const assistantMessage: Message = { role: 'assistant', content: data.content, timestamp: new Date().toISOString() }
            const finalMessages = [...updatedMessages, assistantMessage]
            setMessages(finalMessages)

            // Auto-save after successful exchange
            await saveHistory(finalMessages)
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
            // 自動的にVisualタブに切り替え
            setActiveTab('visual')
            setJustGenerated(true)
            setMobileTab('preview')
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
                setSavedSettings(currentSettings)
                setJustGenerated(false)
            }
        } catch (error) {
            console.error('Save error:', error)
            alert('保存中にエラーが発生しました。')
        } finally {
            setIsSaving(false)
        }
    }

    const handleResetConversation = async () => {
        if (!window.confirm('会話履歴がすべて消去されますが、よろしいですか？\nこの操作は取り消せません。')) {
            return
        }

        const initialMessage: Message = {
            role: 'assistant',
            content: 'こんにちは！AiLunaのセットアップコンシェルジュです。私と一緒に、あなたの会社の電話番AIを作成しましょう。まず、電話に出た際の「最初の挨拶」を決めましょう。どのような挨拶にしますか？',
            timestamp: new Date().toISOString()
        }

        setMessages([initialMessage])
        setMobileTab('chat')

        // Reset history in DB
        try {
            await saveHistory([initialMessage])
        } catch (error) {
            console.error('Failed to reset history:', error)
        }
    }

    const handleResetSettings = () => {
        if (!window.confirm('生成された設定がすべて破棄されますが、よろしいですか？\n保存されていない変更は失われます。')) {
            return
        }
        setCurrentSettings(BLANK_SETTINGS)
        setActiveTab('visual')
        setJustGenerated(false)
    }

    // 変更があるかどうかを判定 (JSON文字列比較)
    const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(savedSettings)

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] lg:h-[calc(100vh-200px)] gap-4 lg:gap-6">
            {/* Mobile Tabs */}
            <div className="lg:hidden flex bg-zinc-100 p-1 rounded-lg shrink-0">
                <button
                    onClick={() => setMobileTab('chat')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mobileTab === 'chat'
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-500'
                        }`}
                >
                    会話
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mobileTab === 'preview'
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-500'
                        }`}
                >
                    設定プレビュー
                </button>
            </div>

            {/* Left Side: Chat UI Area */}
            <div className={`flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col ${mobileTab === 'chat' ? 'flex' : 'hidden'} lg:flex`}>
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-zinc-900">対話型セットアップ</h3>
                        <p className="text-xs text-zinc-500">AIと会話して設定を作りましょう</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <div className="absolute top-full right-0 mt-2 w-max hidden group-hover:block z-20">
                                <div className="bg-zinc-800 text-white text-xs p-2 rounded-lg shadow-lg relative opacity-90">
                                    会話をリセットします
                                    （既に生成された設定は残ります）
                                    <div className="absolute -top-1 right-3 w-2 h-2 bg-zinc-800 rotate-45"></div>
                                </div>
                            </div>
                            <button
                                onClick={handleResetConversation}
                                disabled={isGenerating || isChatLoading || messages.length <= 1}
                                className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
                                title=""
                            >
                                <RotateCcw className="h-4 w-4" />
                                <span className="hidden sm:inline">会話をリセット</span>
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute top-full right-0 mt-2 w-64 hidden group-hover:block z-20">
                                <div className="bg-zinc-800 text-white text-xs p-2 rounded-lg shadow-lg relative opacity-90">
                                    これまでの会話内容を解析して、
                                    AIのシステムプロンプト（設定）を自動生成します。
                                    <div className="absolute -top-1 right-6 w-2 h-2 bg-zinc-800 rotate-45"></div>
                                </div>
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
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-zinc-50/30 space-y-4">
                    {isLoadingHistory ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                        </div>
                    ) : (
                        <>
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
                        </>
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
            {/* 
                設定プレビューエリア
                
                このエリアは常に「現在の1つの設定」のみを表示します。
                - Visual タブ: config_metadata から抽出した情報をカード形式で表示
                - Code タブ: system_prompt の全文を Raw 形式で表示
                
                過去バージョンとの比較や before/after 表示は含まれていません。
                これは意図的な設計です。
            */}
            <div className={`w-full lg:w-[400px] bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col ${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex`}>
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-zinc-900">設定プレビュー</h3>
                            <p className="text-xs text-zinc-500">生成された設定を確認・保存</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative">

                        <div className="relative group">
                            <div className="absolute top-full left-0 mt-2 w-max hidden group-hover:block z-20">
                                <div className="bg-zinc-800 text-white text-xs p-2 rounded-lg shadow-lg relative opacity-90">
                                    生成された設定を破棄し、初期状態に戻します
                                    <div className="absolute -top-1 left-3 w-2 h-2 bg-zinc-800 rotate-45"></div>
                                </div>
                            </div>
                            <button
                                onClick={handleResetSettings}
                                disabled={isSaving || !currentSettings?.system_prompt}
                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title=""
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges || !currentSettings?.system_prompt}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!hasChanges
                                ? 'bg-white text-zinc-400 border border-zinc-200 shadow-sm'
                                : justGenerated
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] animate-pulse ring-2 ring-indigo-300 ring-offset-2'
                                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                                }`}
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
                    {isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in duration-300">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-white p-4 rounded-full border-2 border-indigo-100 shadow-sm">
                                    <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-zinc-900 font-medium">AIがあなたの専属電話番を作成中...</h3>
                                <p className="text-xs text-zinc-500 max-w-[240px] mx-auto leading-relaxed">
                                    これまでの会話を分析して、最適な設定を構成しています。<br />
                                    30秒ほどお待ちください。
                                </p>
                            </div>
                        </div>
                    ) : activeTab === 'visual' ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">基本情報</h4>
                                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 space-y-2">
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <span className="text-zinc-500">業種</span>
                                        <span className="col-span-2 font-medium text-zinc-900">{currentSettings?.config_metadata?.business_type}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <span className="text-zinc-500">口調</span>
                                        <span className="col-span-2 font-medium text-zinc-900">
                                            {currentSettings?.config_metadata?.tone === 'polite' ? '丁寧' :
                                                currentSettings?.config_metadata?.tone === 'friendly' ? 'フレンドリー' :
                                                    currentSettings?.config_metadata?.tone === 'casual' ? 'カジュアル' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">挨拶メッセージ</h4>
                                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 text-sm text-zinc-700">
                                    {currentSettings?.config_metadata?.greeting_message}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">重要ルール</h4>
                                <ul className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 space-y-1">
                                    {currentSettings?.config_metadata?.rules && currentSettings.config_metadata.rules.length > 0 ? (
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
                            <div className="bg-zinc-900 rounded-lg border border-zinc-800 flex-1 overflow-hidden flex flex-col">
                                <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-3 py-2">
                                    <p className="text-[10px] text-yellow-500 flex items-center gap-1.5">
                                        <span className="shrink-0">⚠️</span>
                                        ここでの変更はVisualタブには反映されません。システムプロンプトが優先されます。
                                    </p>
                                </div>
                                <textarea
                                    className="flex-1 w-full bg-transparent text-xs text-zinc-300 font-mono p-4 focus:outline-none resize-none"
                                    value={currentSettings?.system_prompt || ''}
                                    onChange={(e) => setCurrentSettings(prev => ({ ...prev, system_prompt: e.target.value }))}
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
