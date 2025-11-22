import { User, Phone } from 'lucide-react'

type AccountInfoCardProps = {
    accountName?: string | null
    phoneNumber?: string | null
}

export function AccountInfoCard({ accountName, phoneNumber }: AccountInfoCardProps) {
    const displayAccountName = accountName || '未設定'
    const displayPhoneNumber = phoneNumber || '未登録'
    const isPhoneRegistered = !!phoneNumber

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-semibold text-zinc-900 text-sm truncate">
                    {displayAccountName}
                </span>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">
                        {displayPhoneNumber}
                    </span>
                </div>
            </div>
        </div>
    )
}
