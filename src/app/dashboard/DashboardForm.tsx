'use client'

import { useActionState } from 'react'
import { Save } from 'lucide-react'
import { updateUserPrompts } from './actions'

const initialState = {
    message: '',
    error: '',
}

interface DashboardFormProps {
    initialGreeting: string
    initialDescription: string
}

export function DashboardForm({ initialGreeting, initialDescription }: DashboardFormProps) {
    const [state, formAction, isPending] = useActionState(updateUserPrompts, initialState)

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-zinc-900">AIエージェント設定</h2>
                {state?.success && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        {state.success}
                    </span>
                )}
                {state?.error && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                        {state.error}
                    </span>
                )}
            </div>

            <form action={formAction} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-900 mb-2">
                            電話に出た時の挨拶
                        </label>
                        <p className="text-xs text-zinc-500 mb-2">
                            AIが電話に出た際、最初に発話するメッセージです。会社名を含めることを推奨します。
                        </p>
                        <textarea
                            name="greeting_message"
                            defaultValue={initialGreeting}
                            className="w-full min-h-[80px] p-3 text-sm text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y"
                            placeholder="お電話ありがとうございます。株式会社AiLunaでございます。担当にお繋ぎいたしますので、ご用件をお話しください。"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-900 mb-2">
                            事業内容の説明 (AIへの指示)
                        </label>
                        <p className="text-xs text-zinc-500 mb-2">
                            あなたの会社のサービス内容や、よくある質問への回答方針を入力してください。
                        </p>
                        <textarea
                            name="business_description"
                            defaultValue={initialDescription}
                            className="w-full min-h-[80px] p-3 text-sm text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y"
                            placeholder="当社はAI電話代行サービスを提供しています。料金は月額980円からです。営業時間は平日9:00〜18:00です..."
                        />
                    </div>
                </div>
                <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] disabled:active:scale-100"
                    >
                        <Save className="h-4 w-4" />
                        {isPending ? '保存中...' : '設定を保存する'}
                    </button>
                </div>
            </form>
        </section>
    )
}
