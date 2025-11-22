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
import { AccountInfoCard } from '@/components/AccountInfoCard'
import { PlanInfoDisplay } from '@/components/PlanInfoDisplay'
import { DashboardSection } from './sections/DashboardSection'
import { AccountSection } from './sections/AccountSection'
import { PlanSection } from './sections/PlanSection'
import { AgentSettingsSection } from './sections/AgentSettingsSection'
import { CallHistorySection } from './sections/CallHistorySection'
import { DashboardMetricsData } from '@/components/DashboardMetrics'

type Tab = 'dashboard' | 'account' | 'plan' | 'agent' | 'history'

interface DashboardClientProps {
    userEmail: string
    userProfile: any
    metrics: DashboardMetricsData
    prompts: any
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
                        initialGreeting={prompts?.greeting_message || ''}
                        initialDescription={prompts?.business_description || ''}
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

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-zinc-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                    <Phone className="h-6 w-6" />
                    <span className="text-xl font-bold text-zinc-900">AiLuna</span>
                </div>
                <AccountInfoCard
                    accountName={userProfile?.account_name}
                    phoneNumber={userProfile?.phone_number}
                />
                <PlanInfoDisplay />
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-zinc-200">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                            {userEmail}
                        </p>
                    </div>
                </div>
                <form action={signOutAction}>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 hover:text-red-600 transition-all active:scale-95">
                        <LogOut className="h-4 w-4" />
                        ログアウト
                    </button>
                </form>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col fixed inset-y-0 z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 z-20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600">
                    <Phone className="h-6 w-6" />
                    <span className="text-xl font-bold text-zinc-900">AiLuna</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-zinc-600 hover:bg-zinc-50 rounded-lg"
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
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            {/* Mobile Drawer */}
            <div className={`md:hidden fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <SidebarContent />
            </div>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 pt-[60px] md:pt-0">
                <div className="max-w-5xl mx-auto p-6 lg:p-10">
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}
