'use client'

export function PlanSection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">プラン・決済</h2>
                <p className="text-zinc-500">ご利用プランの確認とアップグレードができます。</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div>
                        <h3 className="font-bold text-indigo-900">現在のプラン: フリープラン</h3>
                        <p className="text-sm text-indigo-700">月間60分まで無料でご利用いただけます。</p>
                    </div>
                    <span className="px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded-full border border-indigo-200">
                        Active
                    </span>
                </div>

                <div className="border-t border-zinc-100 pt-6">
                    <h3 className="font-bold text-zinc-900 mb-2">プロプランへのアップグレード</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                        月額2,980円で通話時間無制限、高度なAI設定などが利用可能になります。
                    </p>
                    <button disabled className="w-full py-2 px-4 bg-zinc-100 text-zinc-400 rounded-lg font-medium cursor-not-allowed border border-zinc-200">
                        アップグレード（準備中）
                    </button>
                </div>
            </div>
        </div>
    )
}
