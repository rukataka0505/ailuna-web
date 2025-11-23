'use client'

import { useState } from 'react'
import {
    LayoutDashboard,
    User,
    CreditCard,
    Settings,
    Phone,
    Menu,
    X,
    LogOut
} from 'lucide-react'
import { UserProfileChip } from '@/components/UserProfileChip'
import { DashboardSection } from './sections/DashboardSection'
import { AccountSection } from './sections/AccountSection'
import { PlanSection } from './sections/PlanSection'
import { AgentSettingsSection } from './sections/AgentSettingsSection'
import { CallHistorySection } from './sections/CallHistorySection'
import { DashboardMetricsData } from '@/components/DashboardMetrics'

type Tab = 'dashboard' | 'account' | 'plan' | 'agent' | 'history'

import { AgentSettings } from '@/types/agent'

// ... existing imports

interface DashboardClientProps {
    userEmail: string
    userProfile: any
    metrics: DashboardMetricsData
    prompts: AgentSettings
    initialLogs: any[]
    initialCount: number
    uniqueCallers: string[]
    signOutAction: () => Promise<void>
}

export function DashboardClient({
    userEmail,
    userProfile,
    metrics,
    prompts,
    initialLogs,
    initialCount,
    uniqueCallers,
    signOutAction
}: DashboardClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const menuItems = [
        { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
        { id: 'account', label: 'アカウント管理', icon: User },
        { id: 'plan', label: 'プラン・決済', icon: CreditCard },
        { id: 'agent', label: 'AIエージェント設定', icon: Settings },
        { id: 'history', label: '通話履歴', icon: Phone },
    ] as const

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardSection metrics={metrics} />
            case 'account':
                return <AccountSection />
            case 'plan':
                return <PlanSection />
            case 'agent':
                return (
                    <AgentSettingsSection
                        settings={prompts}
                    />
                )
            case 'history':
                return (
                    <CallHistorySection
                        initialLogs={initialLogs}
                        initialCount={initialCount}
                        uniqueCallers={uniqueCallers}
                    />
                )
            default:
                return null
        }
    }
    // ... rest of the file

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-zinc-100">
                <div className="flex items-center gap-2 text-indigo-600 px-2">
                    <Phone className="h-6 w-6" />
                    <span className="text-xl font-bold text-zinc-900">AiLuna</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id)
                                setIsMobileMenuOpen(false)
                            }}
                            className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                ? 'text-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-100'
                                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                                }`}
                        >
                            <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-zinc-100">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                            {userEmail}
                        </p>
                    </div>
                </div>
                <form action={signOutAction}>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95">
                        <LogOut className="h-4 w-4" />
                        ログアウト
                    </button>
                </form>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-zinc-50/50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 bg-white border-r border-zinc-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] flex-col fixed inset-y-0 z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-20 px-4 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-indigo-600 shrink-0">
                    <Phone className="h-6 w-6" />
                    <span className="text-xl font-bold text-zinc-900 hidden sm:inline">AiLuna</span>
                </div>

                <div className="flex-1 flex justify-end mr-2">
                    <UserProfileChip
                        accountName={userProfile?.account_name}
                        phoneNumber={userProfile?.phone_number}
                        className="scale-90 origin-right"
                    />
                </div>

                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-zinc-600 hover:bg-zinc-50 rounded-lg active:scale-95 transition-transform shrink-0"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div className={`md:hidden fixed inset-y-0 right-0 w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <SidebarContent />
            </div>

            {/* Main Content */}
            <main className="flex-1 md:pl-72 pt-[60px] md:pt-0 transition-all duration-300">
                {/* Top Header */}
                <header className="hidden md:flex sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 px-6 py-3 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 text-zinc-500">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-sm font-medium">マイページ</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <UserProfileChip
                            accountName={userProfile?.account_name}
                            phoneNumber={userProfile?.phone_number}
                            className="pl-4 border-l border-zinc-200"
                        />
                    </div>
                </header>

                <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8 pt-6 md:pt-10">
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}
