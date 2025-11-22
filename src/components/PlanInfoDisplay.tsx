import { CreditCard, ArrowUpRight } from 'lucide-react'

export function PlanInfoDisplay({ planName = 'Free' }: { planName?: string }) {
    return (
        <div className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl text-white shadow-lg shadow-zinc-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <CreditCard className="h-16 w-16 transform rotate-12 translate-x-4 -translate-y-4" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Current Plan</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium border border-white/10">
                        {planName}
                    </span>
                </div>

                <button className="w-full py-2 px-3 bg-white text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span>Upgrade to Pro</span>
                    <ArrowUpRight className="h-3 w-3" />
                </button>
            </div>
        </div>
    )
}
