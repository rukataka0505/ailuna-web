'use client'

import { DashboardForm } from '../DashboardForm'

interface AgentSettingsSectionProps {
    initialGreeting: string
    initialDescription: string
}

export function AgentSettingsSection({ initialGreeting, initialDescription }: AgentSettingsSectionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">AIエージェント設定</h2>
                <p className="text-zinc-500">電話応対AIの振る舞いや発話内容を設定できます。</p>
            </div>

            <DashboardForm
                initialGreeting={initialGreeting}
                initialDescription={initialDescription}
            />
        </div>
    )
}
