import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-navy-950 text-white border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <span className="text-2xl font-bold tracking-tighter text-white">AiLuna</span>
                        <p className="mt-4 text-sm text-gray-400">
                            クリニックのための<br />AI電話受付サービス
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Product</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">機能一覧</a></li>
                            <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">料金プラン</a></li>
                            <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">導入事例</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Support</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">ヘルプセンター</a></li>
                            <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">お問い合わせ</a></li>
                            <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">運営会社</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="/terms" className="text-base text-gray-400 hover:text-white transition-colors">利用規約</Link></li>
                            <li><Link href="/privacy" className="text-base text-gray-400 hover:text-white transition-colors">プライバシーポリシー</Link></li>
                            <li><Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">特定商取引法に基づく表記</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; 2025 AiLuna. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {/* Social Icons if needed */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
