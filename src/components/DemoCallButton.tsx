'use client'

import { Phone } from 'lucide-react'

interface DemoCallButtonProps {
    onClick: () => void
    disabled?: boolean
}

export function DemoCallButton({ onClick, disabled }: DemoCallButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 
                       bg-gradient-to-r from-indigo-500 to-purple-600 
                       hover:from-indigo-600 hover:to-purple-700 
                       disabled:from-zinc-400 disabled:to-zinc-500 disabled:cursor-not-allowed
                       text-white font-bold text-lg rounded-2xl 
                       shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                       transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                       overflow-hidden"
        >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                           translate-x-[-100%] group-hover:translate-x-[100%] 
                           transition-transform duration-700" />

            <div className="relative flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5" />
                </div>
                <span>試しに電話してみる（体験版）</span>
            </div>

            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-2xl animate-pulse-slow bg-white/5" />
        </button>
    )
}
