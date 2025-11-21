type UserPhoneDisplayProps = {
    phoneNumber: string | null | undefined
}

export function UserPhoneDisplay({ phoneNumber }: UserPhoneDisplayProps) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 text-sm">
            <span className="text-zinc-500">電話番号：</span>
            <span className="text-zinc-700 font-medium">
                {phoneNumber || '登録されていません'}
            </span>
        </div>
    )
}
