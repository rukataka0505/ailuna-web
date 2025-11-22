'use client'

export function PlanSection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">プラン・決済</h2>
                <p className="text-zinc-500">ご利用プランの確認とアップグレードができます。</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <div>
                        <h3 className="font-bold text-indigo-900 text-lg">現在のプラン: フリープラン</h3>
                        <p className="text-indigo-700 mt-1">月間60分まで無料でご利用いただけます。</p>
                    </div>
                    <span className="px-4 py-1.5 bg-white text-indigo-600 text-sm font-bold rounded-full border border-indigo-100 shadow-sm">
                        Active
                    </span>
                </div>

                <div className="border-t border-zinc-100 pt-8">
                    <h3 className="font-bold text-zinc-900 text-lg mb-2">プロプランへのアップグレード</h3>
                    <p className="text-zinc-500 mb-6">
                        月額2,980円で通話時間無制限、高度なAI設定などが利用可能になります。
                    </p>
                    <button disabled className="w-full py-3 px-4 bg-zinc-50 text-zinc-400 rounded-xl font-medium cursor-not-allowed border border-zinc-200 hover:bg-zinc-100 transition-colors">
                        アップグレード（準備中）
                    </button>
                </div>
            </div>
        </div>
    )
}
