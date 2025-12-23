'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'

export default function Header() {
    return (
        <header className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="relative">
                        <div className="bg-gradient-to-br from-teal-400 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                            <Phone className="h-4 w-4 text-white fill-white" />
                        </div>
                    </div>
                    <span className="text-xl font-bold text-navy-950 tracking-tight">
                        AiLuna
                        <span className="text-indigo-600">.</span>
                    </span>
                </Link>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-4">
                    <Link
                        href="/login?mode=login"
                        className="text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors"
                    >
                        ログイン
                    </Link>
                    <Link
                        href="/login?mode=signup"
                        className="px-5 py-2 text-sm font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.96]"
                    >
                        無料で試す
                    </Link>
                </div>
            </div>
        </header>
    )
}
