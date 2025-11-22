import { User, Phone } from 'lucide-react'

type UserProfileChipProps = {
    accountName?: string | null
    phoneNumber?: string | null
    planName?: string
    className?: string
}

export function UserProfileChip({ accountName, phoneNumber, planName = 'Free', className = '' }: UserProfileChipProps) {
    const displayAccountName = accountName || '未設定'
    const displayPhoneNumber = phoneNumber || '未登録'

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 max-w-[100px] truncate">
                        {displayAccountName}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full uppercase tracking-wider">
                        {planName}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Phone className="h-3 w-3" />
                    <span>{displayPhoneNumber}</span>
                </div>
            </div>

            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                <User className="h-4 w-4" />
            </div>
        </div>
    )
}
