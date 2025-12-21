'use client'

/**
 * Setup Concierge - AI電話番の設定コンポーネント (Redesigned)
 * 
 * 機能は維持しつつ、UI/UXを大幅に刷新。
 * - "AI電話番設定"の表示を削除
 * - 入力フィールドの視認性向上
 * - プレミアムなデザイン適用
 */

import { useState, useEffect } from 'react'
import { AgentSettings } from '@/types/agent'
import { Save, Loader2, Trash2, Sparkles, Info, Store, MessageSquare, Quote, Smartphone } from 'lucide-react'
import { saveAgentSettings, deleteAgentSettings } from './actions'

interface ConciergeBuilderProps {
    initialSettings: AgentSettings
}

const BLANK_SETTINGS: AgentSettings = {
    system_prompt: '',
    config_metadata: {
        tone: undefined,
        greeting_message: '',
        business_description: '',
        rules: [],
        business_type: '',
        sms_templates: {
            approved: 'ご予約を承りました。{{dateTime}}{{partySize}}',
            rejected: '申し訳ありません。ご希望の日時はお受けできませんでした。{{reason}}'
        }
    }
}

const DEFAULT_SETTINGS: AgentSettings = {
    system_prompt: `## 店舗基本情報
- 店名: 居酒屋AiLuna
- 営業時間: 11:00〜22:00（ラストオーダー 21:30）
- 定休日: 毎週月曜日
- 住所: 東京都渋谷区渋谷1-2-3
- 電話番号: 03-1234-5678

## よくある質問
- 駐車場: 近隣にコインパーキングあり
- 支払い方法: 現金、クレジットカード、電子マネー対応
- 個室: 4名様用個室あり（要予約）`,
    config_metadata: {
        tone: 'polite',
        greeting_message: 'お電話ありがとうございます。居酒屋AiLunaでございます。ご予約のお電話でしょうか？',
        business_description: '',
        rules: [],
        business_type: '飲食店',
        sms_templates: {
            approved: '【居酒屋AiLuna】ご予約を承りました。\n{{dateTime}}\n{{partySize}}\nご来店をお待ちしております。',
            rejected: '【居酒屋AiLuna】申し訳ございません。{{reason}}\n別の日時でのご予約をご検討いただけますと幸いです。'
        }
    }
}

export function ConciergeBuilder({ initialSettings }: ConciergeBuilderProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [isResettingSettings, setIsResettingSettings] = useState(false)
    const [isApplyingDefaults, setIsApplyingDefaults] = useState(false)
    const [showSmsHelp, setShowSmsHelp] = useState(false)

    const [currentSettings, setCurrentSettings] = useState<AgentSettings>(initialSettings || BLANK_SETTINGS)
    const [savedSettings, setSavedSettings] = useState<AgentSettings>(initialSettings || BLANK_SETTINGS)

    useEffect(() => {
        if (initialSettings) {
            setCurrentSettings(initialSettings)
            setSavedSettings(initialSettings)
        }
    }, [initialSettings])

    const handleSave = async () => {
        if (isSaving) return
        setIsSaving(true)

        try {
            const result = await saveAgentSettings(currentSettings.system_prompt, currentSettings.config_metadata)
            if (result.error) {
                alert(result.error)
            } else {
                setSavedSettings(currentSettings)
                // Optional: Toast notification here would be better
            }
        } catch (error) {
            console.error('Save error:', error)
            alert('保存中にエラーが発生しました。')
        } finally {
            setIsSaving(false)
        }
    }

    const handleResetSettings = async () => {
        if (!window.confirm('設定がすべて破棄されますが、よろしいですか？\nデータベースからも完全に削除されます。')) {
            return
        }

        setIsResettingSettings(true)

        try {
            const result = await deleteAgentSettings()
            if (result.error) {
                alert(result.error)
                return
            }

            setCurrentSettings(BLANK_SETTINGS)
            setSavedSettings(BLANK_SETTINGS)
        } catch (error) {
            console.error('Reset error:', error)
            alert('設定のリセット中にエラーが発生しました。')
        } finally {
            setIsResettingSettings(false)
        }
    }

    const handleApplyDefaults = async () => {
        if (!window.confirm('未入力の項目に例文を入力します。\n既存の設定は上書きされません。\n\n続行しますか？')) {
            return
        }

        setIsApplyingDefaults(true)

        try {
            const mergedSettings: AgentSettings = {
                system_prompt: currentSettings.system_prompt?.trim() || DEFAULT_SETTINGS.system_prompt,
                config_metadata: {
                    tone: currentSettings.config_metadata?.tone || DEFAULT_SETTINGS.config_metadata.tone,
                    greeting_message: currentSettings.config_metadata?.greeting_message?.trim() || DEFAULT_SETTINGS.config_metadata.greeting_message,
                    business_description: currentSettings.config_metadata?.business_description?.trim() || DEFAULT_SETTINGS.config_metadata.business_description,
                    rules: currentSettings.config_metadata?.rules?.length ? currentSettings.config_metadata.rules : DEFAULT_SETTINGS.config_metadata.rules,
                    business_type: currentSettings.config_metadata?.business_type?.trim() || DEFAULT_SETTINGS.config_metadata.business_type,
                    sms_templates: {
                        approved: currentSettings.config_metadata?.sms_templates?.approved?.trim() || DEFAULT_SETTINGS.config_metadata.sms_templates!.approved,
                        rejected: currentSettings.config_metadata?.sms_templates?.rejected?.trim() || DEFAULT_SETTINGS.config_metadata.sms_templates!.rejected
                    }
                }
            }

            const result = await saveAgentSettings(mergedSettings.system_prompt, mergedSettings.config_metadata)
            if (result.error) {
                alert(result.error)
                return
            }

            setCurrentSettings(mergedSettings)
            setSavedSettings(mergedSettings)
        } catch (error) {
            console.error('Apply defaults error:', error)
            alert('デフォルト設定の適用中にエラーが発生しました。')
        } finally {
            setIsApplyingDefaults(false)
        }
    }

    const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(savedSettings)

    return (
        <div className="flex flex-col h-full bg-zinc-50/50">
            {/* Header Actions - Floating or Top Bar */}
            <div className="flex justify-end items-center gap-3 pb-4 px-1">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleResetSettings}
                        disabled={isSaving || isResettingSettings || isApplyingDefaults || !currentSettings?.system_prompt}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 tooltip-trigger"
                        title="設定をリセット"
                    >
                        {isResettingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </button>

                    <button
                        onClick={handleApplyDefaults}
                        disabled={isSaving || isResettingSettings || isApplyingDefaults}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white text-indigo-600 border border-indigo-100 shadow-sm hover:shadow-md hover:bg-indigo-50/50 disabled:opacity-50"
                    >
                        {isApplyingDefaults ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        例文を入力
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || isApplyingDefaults || !hasChanges}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${!hasChanges
                            ? 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                            : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-[1.02]'
                            }`}
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        変更を保存
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6">

                {/* 1. Basic Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100/80">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Store className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-zinc-800 text-lg">お店の設定</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 block">業種</label>
                            <input
                                type="text"
                                className="w-full text-base px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-400"
                                value={currentSettings?.config_metadata?.business_type || ''}
                                onChange={(e) => setCurrentSettings(prev => ({
                                    ...prev,
                                    config_metadata: { ...prev.config_metadata, business_type: e.target.value }
                                }))}
                                placeholder="例: イタリアンレストラン、美容室"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 block">AIの話し方</label>
                            <div className="relative">
                                <select
                                    className="w-full text-base px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                                    value={currentSettings?.config_metadata?.tone || 'polite'}
                                    onChange={(e) => setCurrentSettings(prev => ({
                                        ...prev,
                                        config_metadata: { ...prev.config_metadata, tone: e.target.value as any }
                                    }))}
                                >
                                    <option value="polite">丁寧（標準）</option>
                                    <option value="friendly">親しみやすく</option>
                                    <option value="casual">カジュアル</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Prompt Settings Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100/80">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-zinc-800 text-lg">AIの振る舞い</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 block flex items-center justify-between">
                                第一声 (電話に出た時の挨拶)
                                <span className="text-xs font-normal text-zinc-400 px-2 py-0.5 bg-zinc-100 rounded">必須</span>
                            </label>
                            <input
                                type="text"
                                className="w-full text-base px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-400"
                                value={currentSettings?.config_metadata?.greeting_message || ''}
                                onChange={(e) => setCurrentSettings(prev => ({
                                    ...prev,
                                    config_metadata: { ...prev.config_metadata, greeting_message: e.target.value }
                                }))}
                                placeholder="お電話ありがとうございます。居酒屋AiLunaでございます。ご予約のお電話でしょうか？"
                            />
                            <p className="text-xs text-zinc-500 pl-1">
                                店名を含めるとお客様が安心します。
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-medium text-zinc-700 block">
                                    店舗情報・よくある質問 (システムプロンプト)
                                </label>
                            </div>

                            <div className="relative group">
                                <textarea
                                    className="w-full text-sm font-mono leading-relaxed px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[300px] resize-y"
                                    value={currentSettings?.system_prompt || ''}
                                    onChange={(e) => setCurrentSettings(prev => ({ ...prev, system_prompt: e.target.value }))}
                                    placeholder={`店舗の営業時間、アクセス、メニュー情報、よくある質問への回答などを自由に記述してください...

例:
- 駐車場: あり（3台）
- 予算: 3000円〜
- カード利用: 可`}
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/90 backdrop-blur text-xs px-2 py-1 rounded shadow-sm border border-zinc-100 text-zinc-500 pointer-events-none">
                                        Markdown記法対応
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-indigo-900 leading-relaxed">
                                    <strong>ここに入力された情報は、AIがお客様への回答に使用します。</strong><br />
                                    営業時間、定休日、アクセス、メニュー、駐車場情報などを箇条書きで詳しく書くと、より賢い対応が可能になります。
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SMS Settings Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100/80">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-zinc-800 text-lg">SMS通知メッセージ</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Approved Template */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                予約確定時のメッセージ
                            </label>
                            <div className="relative">
                                <textarea
                                    className="w-full text-sm px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all min-h-[120px]"
                                    value={currentSettings?.config_metadata?.sms_templates?.approved || ''}
                                    onChange={(e) => setCurrentSettings(prev => ({
                                        ...prev,
                                        config_metadata: {
                                            ...prev.config_metadata,
                                            sms_templates: {
                                                ...prev.config_metadata.sms_templates,
                                                approved: e.target.value,
                                                rejected: prev.config_metadata.sms_templates?.rejected || ''
                                            }
                                        }
                                    }))}
                                    placeholder="ご予約を承りました。{{dateTime}}{{partySize}}"
                                />
                                <Quote className="absolute bottom-3 right-3 h-4 w-4 text-zinc-300 pointer-events-none" />
                            </div>
                        </div>

                        {/* Rejected Template */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                お断り時のメッセージ
                            </label>
                            <div className="relative">
                                <textarea
                                    className="w-full text-sm px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[120px]"
                                    value={currentSettings?.config_metadata?.sms_templates?.rejected || ''}
                                    onChange={(e) => setCurrentSettings(prev => ({
                                        ...prev,
                                        config_metadata: {
                                            ...prev.config_metadata,
                                            sms_templates: {
                                                approved: prev.config_metadata.sms_templates?.approved || '',
                                                rejected: e.target.value
                                            }
                                        }
                                    }))}
                                    placeholder="申し訳ありません。ご希望の日時はお受けできませんでした。"
                                />
                                <Quote className="absolute bottom-3 right-3 h-4 w-4 text-zinc-300 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => setShowSmsHelp(!showSmsHelp)}
                            className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1.5 transition-colors font-medium border border-dashed border-zinc-300 rounded-lg px-3 py-1.5 hover:bg-zinc-50 hover:border-zinc-400 w-max"
                        >
                            <Info className="h-3.5 w-3.5" />
                            {showSmsHelp ? '変数の説明を隠す' : 'メッセージ内で使える変数を見る'}
                        </button>

                        {showSmsHelp && (
                            <div className="mt-3 bg-zinc-50 rounded-xl p-4 text-xs border border-zinc-100 animate-in fade-in slide-in-from-top-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <div className="font-mono text-blue-600 font-bold bg-blue-50 w-max px-1.5 rounded">{`{{dateTime}}`}</div>
                                        <div className="text-zinc-600">予約日時<br /><span className="text-zinc-400">例：12月24日 19:00</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-mono text-blue-600 font-bold bg-blue-50 w-max px-1.5 rounded">{`{{partySize}}`}</div>
                                        <div className="text-zinc-600">人数<br /><span className="text-zinc-400">例：4名様</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-mono text-red-500 font-bold bg-red-50 w-max px-1.5 rounded">{`{{reason}}`}</div>
                                        <div className="text-zinc-600">お断り理由<br /><span className="text-zinc-400">却下時のみ有効</span></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
