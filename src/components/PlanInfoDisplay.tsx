export function PlanInfoDisplay({ planName = 'Free' }: { planName?: string }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 py-3 px-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <div className="text-sm">
                <span className="text-zinc-500">現在のプラン：</span>
                <span className="font-medium text-zinc-900">{planName}</span>
            </div>
            <button className="text-sm text-indigo-600 font-medium hover:underline transition-all active:scale-95">
                プロプランへアップグレード
            </button>
        </div>
    )
}
