'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'

export default function Header() {
    return (
        <header className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Phone className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">AiLuna</span>
                </Link>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-3">
                    <Link
                        href="/login?mode=login"
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        ログイン
                    </Link>
                    <Link
                        href="/login?mode=signup"
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-[0.96]"
                    >
                        無料で始める
                    </Link>
                </div>
            </div>
        </header>
    )
}
