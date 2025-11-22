import { User, Phone } from 'lucide-react'

type UserProfileChipProps = {
    accountName?: string | null
    phoneNumber?: string | null
    planName?: string
}

export function UserProfileChip({ accountName, phoneNumber, planName = 'Free' }: UserProfileChipProps) {
    const displayAccountName = accountName || '未設定'
    const displayPhoneNumber = phoneNumber || '未登録'

    return (
        <div className="flex items-center gap-4 pl-4 border-l border-zinc-200">
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900">
                        {displayAccountName}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full uppercase tracking-wider">
                        {planName}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Phone className="h-3 w-3" />
                    <span>{displayPhoneNumber}</span>
                </div>
            </div>

            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                <User className="h-5 w-5" />
            </div>
        </div>
    )
}
