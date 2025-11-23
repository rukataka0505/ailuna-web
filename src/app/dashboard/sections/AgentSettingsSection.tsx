'use client'

import { ConciergeBuilder } from '../ConciergeBuilder'
import { AgentSettings } from '@/types/agent'

interface AgentSettingsSectionProps {
    settings: AgentSettings
}

export function AgentSettingsSection({ settings }: AgentSettingsSectionProps) {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">AIエージェント設定</h2>
                <p className="text-zinc-500">対話形式でAIの振る舞いを設定できます。</p>
            </div>

            <div className="flex-1">
                <ConciergeBuilder initialSettings={settings} />
            </div>
        </div>
    )
}
