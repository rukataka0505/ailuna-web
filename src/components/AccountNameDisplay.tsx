export function AccountNameDisplay({ accountName }: { accountName?: string | null }) {
    return (
        <div className="text-sm">
            <span className="text-zinc-500">アカウント：</span>
            <span className="font-medium text-zinc-900">
                {accountName || '未設定'}
            </span>
        </div>
    )
}
