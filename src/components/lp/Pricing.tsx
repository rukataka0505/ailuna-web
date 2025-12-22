import Link from 'next/link';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';

export default function Pricing() {
    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-teal-600 font-semibold tracking-wide uppercase text-sm">Pricing</h2>
                    <p className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">
                        シンプルで明確な料金プラン
                    </p>
                    <p className="mt-4 text-xl text-gray-500">
                        初期費用・解約金は一切かかりません。
                    </p>
                </div>

                <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-400 to-indigo-500"></div>

                    <div className="p-8 sm:p-10">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-4 mb-6">スタンダードプラン</h3>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-extrabold text-navy-900">14,900</span>
                            <span className="text-xl font-medium text-gray-500">円 / 月</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-8">(税込 16,390円)</p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">従量課金</span>
                                <span className="text-lg font-bold text-navy-900">20円 <span className="text-sm font-normal text-gray-500">/ 分</span></span>
                            </div>
                            <p className="text-xs text-gray-500 text-right">(税込 22円 / 分)</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                'AI電話対応（24時間365日）',
                                '予約管理画面の利用',
                                '通話ログ・要約機能',
                                'SMS送信機能',
                                'LINE通知連携',
                                '専門スタッフによる導入サポート'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-teal-500 flex-shrink-0" />
                                    <span className="text-gray-600">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-4">
                            <Link
                                href="/login?mode=signup"
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition-all shadow-lg shadow-indigo-200"
                            >
                                無料でアカウント作成
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="https://calendar.app.google/xxxxx" // Placeholder
                                className="w-full flex items-center justify-center px-8 py-3 border border-gray-200 text-base font-medium rounded-xl text-navy-900 bg-white hover:bg-gray-50 md:py-4 transition-all"
                            >
                                導入相談 (15分)
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1">
                        <HelpCircle className="w-4 h-4" />
                        お支払い方法について
                    </Link>
                </div>
            </div>
        </section>
    );
}
