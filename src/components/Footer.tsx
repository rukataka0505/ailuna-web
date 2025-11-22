'use client'

import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    {/* Copyright */}
                    <div className="text-sm text-gray-500">
                        © 2025 AiLuna. All rights reserved.
                    </div>

                    {/* Links */}
                    <div className="flex space-x-6">
                        <Link
                            href="/terms"
                            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            利用規約
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            プライバシーポリシー
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
