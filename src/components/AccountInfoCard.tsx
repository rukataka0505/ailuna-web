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
        <div className="flex items-center gap-3 flex-wrap text-sm">
            {/* アカウント名 */}
            <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-zinc-400" />
                <span className="font-medium text-zinc-900">
                    {displayAccountName}
                </span>
            </div>

            {/* 区切り */}
            <span className="text-zinc-300">・</span>

            {/* 電話番号 */}
            <div className="flex items-center gap-1.5">
                <Phone className={`h-4 w-4 ${isPhoneRegistered ? 'text-zinc-400' : 'text-zinc-300'}`} />
                <span className={isPhoneRegistered ? 'text-zinc-600' : 'text-zinc-400'}>
                    {displayPhoneNumber}
                </span>
            </div>
        </div>
    )
}
