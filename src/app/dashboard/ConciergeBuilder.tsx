'use client'

/**
 * Setup Concierge - AI電話番の設定コンポーネント
 * 
 * このコンポーネントはAI電話番の設定を編集・保存します。
 * 
 * ## 設計方針
 * - フォーム編集のみ（会話型セットアップ機能は廃止）
 * - system_prompt は自由記述で編集可能
 * - config_metadata は個別フィールドで編集可能
 */

import { useState, useEffect } from 'react'
import { AgentSettings, ConfigMetadata } from '@/types/agent'
import { Save, Loader2, Trash2, Sparkles, Info } from 'lucide-react'
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

/**
 * デフォルトのプロンプト設定例
 * 空白の項目にのみ補完される（Smart Merge）
 */
const DEFAULT_SETTINGS: AgentSettings = {
    system_prompt: `## 店舗基本情報
- 店名: 居酒屋AiLuna
- 営業時間: 11:00〜22:00（ラストオーダー 21:30）
- 定休日: 毎週月曜日
- 住所: 東京都渋谷区○○1-2-3
- 電話番号: 03-1234-5678

## よくある質問
- 駐車場: 近隣にコインパーキングあり
- 支払い方法: 現金、クレジットカード、電子マネー対応
- 個室: 4名様用個室あり（要予約）

## 予約以外のお問い合わせ対応
- 営業時間・定休日のご案内
- アクセス方法のご案内
- メニューに関するご質問`,
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

    /**
     * 現在の設定（単一）
     * 設定フォームに表示される唯一の設定オブジェクトです。
     * 編集後、保存時にDBに永続化されます。
     */
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
                alert('設定を保存しました！')
                setSavedSettings(currentSettings)
            }
        } catch (error) {
            console.error('Save error:', error)
            alert('保存中にエラーが発生しました。')
        } finally {
            setIsSaving(false)
        }
    }

    const handleResetSettings = async () => {
        if (!window.confirm('設定がすべて破棄されますが、よろしいですか？\nデータベースからも完全に削除されます。\nこの操作は取り消せません。')) {
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

    /**
     * デフォルト設定を空白の項目にのみ適用（Smart Merge）
     */
    const handleApplyDefaults = async () => {
        if (!window.confirm('空白の項目にプロンプト設定の例文を入力します。\n既に入力済みの値は上書きされません。\n\n続行しますか？')) {
            return
        }

        setIsApplyingDefaults(true)

        try {
            // Smart Merge: 空の値のみデフォルト値で補完
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

            // DBに保存
            const result = await saveAgentSettings(mergedSettings.system_prompt, mergedSettings.config_metadata)
            if (result.error) {
                alert(result.error)
                return
            }

            // UIを更新
            setCurrentSettings(mergedSettings)
            setSavedSettings(mergedSettings)
            alert('デフォルト設定を適用しました！')
        } catch (error) {
            console.error('Apply defaults error:', error)
            alert('デフォルト設定の適用中にエラーが発生しました。')
        } finally {
            setIsApplyingDefaults(false)
        }
    }

    // 変更があるかどうかを判定 (JSON文字列比較)
    const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(savedSettings)

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-200px)]">
            {/* Settings Form */}
            <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-zinc-900">AI電話番設定</h3>
                            <p className="text-xs text-zinc-500">店舗情報・システムプロンプトを編集・保存</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative">
                        <div className="relative group">
                            <div className="absolute top-full left-0 mt-2 w-max hidden group-hover:block z-20">
                                <div className="bg-zinc-800 text-white text-xs p-2 rounded-lg shadow-lg relative opacity-90">
                                    設定を破棄し、初期状態に戻します
                                    <div className="absolute -top-1 left-3 w-2 h-2 bg-zinc-800 rotate-45"></div>
                                </div>
                            </div>
                            <button
                                onClick={handleResetSettings}
                                disabled={isSaving || isResettingSettings || isApplyingDefaults || !currentSettings?.system_prompt}
                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title=""
                            >
                                {isResettingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                        </div>
                        <button
                            onClick={handleApplyDefaults}
                            disabled={isSaving || isResettingSettings || isApplyingDefaults}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isApplyingDefaults ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            デフォルト設定を追加
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isApplyingDefaults || !hasChanges}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!hasChanges
                                ? 'bg-white text-zinc-400 border border-zinc-200 shadow-sm'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                                }`}
                        >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            保存
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">基本情報</h4>
                            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 space-y-2">
                                <div className="grid grid-cols-3 gap-2 text-xs items-center">
                                    <span className="text-zinc-500">業種</span>
                                    <input
                                        type="text"
                                        className="col-span-2 text-sm border-zinc-200 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={currentSettings?.config_metadata?.business_type || ''}
                                        onChange={(e) => setCurrentSettings(prev => ({
                                            ...prev,
                                            config_metadata: {
                                                ...prev.config_metadata,
                                                business_type: e.target.value
                                            }
                                        }))}
                                        placeholder="例: 居酒屋、美容院、歯科医院"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs items-center">
                                    <span className="text-zinc-500">口調</span>
                                    <select
                                        className="col-span-2 text-sm border-zinc-200 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={currentSettings?.config_metadata?.tone || 'polite'}
                                        onChange={(e) => setCurrentSettings(prev => ({
                                            ...prev,
                                            config_metadata: {
                                                ...prev.config_metadata,
                                                tone: e.target.value as 'polite' | 'friendly' | 'casual'
                                            }
                                        }))}
                                    >
                                        <option value="polite">丁寧</option>
                                        <option value="friendly">フレンドリー</option>
                                        <option value="casual">カジュアル</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">基本プロンプト設定</h4>
                            <div className="space-y-4 bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-700">第一声 (Greeting)</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm border-zinc-200 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={currentSettings?.config_metadata?.greeting_message || ''}
                                        onChange={(e) => setCurrentSettings(prev => ({
                                            ...prev,
                                            config_metadata: {
                                                ...prev.config_metadata,
                                                greeting_message: e.target.value
                                            }
                                        }))}
                                        placeholder="お電話ありがとうございます。◯◯です。ご予約のお電話でしょうか？"
                                    />
                                </div>


                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-700">店舗情報・非予約FAQ（自由記述）</label>
                                    <textarea
                                        className="w-full text-sm border-zinc-200 rounded-lg px-3 py-2 min-h-[200px] focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                        value={currentSettings?.system_prompt || ''}
                                        onChange={(e) => setCurrentSettings(prev => ({ ...prev, system_prompt: e.target.value }))}
                                        placeholder="店舗の営業時間、アクセス、メニュー情報、よくある質問への回答などを自由に記述してください..."
                                    />
                                    <p className="text-[10px] text-zinc-400">
                                        予約フロー以外でのAIの振る舞いを定義するシステムプロンプトです。
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">SMSテンプレート設定</h4>
                            <div className="space-y-4 bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-700">承認時メッセージ</label>
                                    <textarea
                                        className="w-full text-xs border-zinc-200 rounded px-2 py-1.5 min-h-[60px] focus:ring-indigo-500 focus:border-indigo-500"
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
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-[10px] text-zinc-400">
                                            利用可能: {'{{dateTime}}'}, {'{{partySize}}'}, {'{{extraMessage}}'}
                                        </p>
                                        <button
                                            onClick={() => setShowSmsHelp(!showSmsHelp)}
                                            className="text-indigo-500 hover:text-indigo-600 text-[10px] flex items-center gap-1 font-medium transition-colors"
                                        >
                                            <Info className="h-3 w-3" />
                                            変数の説明
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-700">却下時メッセージ</label>
                                    <textarea
                                        className="w-full text-xs border-zinc-200 rounded px-2 py-1.5 min-h-[60px] focus:ring-indigo-500 focus:border-indigo-500"
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
                                        placeholder="申し訳ありません。ご希望の日時はお受けできませんでした。{{reason}}"
                                    />
                                    <p className="text-[10px] text-zinc-400">
                                        利用可能: {'{{reason}}'}, {'{{extraMessage}}'}
                                    </p>
                                </div>

                                {showSmsHelp && (
                                    <div className="bg-indigo-50 rounded-lg p-3 text-xs space-y-2 border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                                        <h5 className="font-semibold text-indigo-900 flex items-center gap-1.5">
                                            <Info className="h-3.5 w-3.5" />
                                            変数の使い方
                                        </h5>
                                        <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1.5">
                                            <div className="font-mono text-indigo-700 font-medium">{`{{dateTime}}`}</div>
                                            <div className="text-indigo-800">予約日時（例：12月24日(木) 19:00〜）</div>

                                            <div className="font-mono text-indigo-700 font-medium">{`{{partySize}}`}</div>
                                            <div className="text-indigo-800">予約人数（例：4名様）</div>

                                            <div className="font-mono text-indigo-700 font-medium">{`{{reason}}`}</div>
                                            <div className="text-indigo-800">予約をお断りした理由<br /><span className="text-[10px] opacity-75">※却下時のみ使用可能</span></div>

                                            <div className="font-mono text-indigo-700 font-medium">{`{{extraMessage}}`}</div>
                                            <div className="text-indigo-800">AIが生成した追加メッセージ<br /><span className="text-[10px] opacity-75">※必要に応じてAIが補足説明を加えます</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
