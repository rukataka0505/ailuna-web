'use client'

export function AccountSection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">アカウント管理</h2>
                <p className="text-zinc-500">アカウント情報の確認・変更ができます。</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="space-y-4">
                    <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100 text-center text-zinc-500">
                        <p>アカウント編集機能は現在開発中です。</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
