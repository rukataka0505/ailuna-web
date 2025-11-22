import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/Footer'

export const metadata = {
    title: 'プライバシーポリシー - AiLuna',
    description: 'AiLunaサービスのプライバシーポリシーです。',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
                {/* Back to Home Link */}
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    トップページに戻る
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        プライバシーポリシー
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        AiLunaは、ユーザーの皆様の個人情報を適切に保護し、安心してサービスをご利用いただけるよう努めています。
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        最終更新日：2025年11月22日
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 収集する情報</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            当社は、本サービスの提供にあたり、以下の情報を収集します。
                        </p>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 アカウント登録時の情報</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>氏名（姓・名）</li>
                                    <li>アカウント名</li>
                                    <li>メールアドレス</li>
                                    <li>パスワード（暗号化して保存）</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 サービス利用時の情報</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>電話番号（ユーザーが設定した場合）</li>
                                    <li>通話ログ（発信者番号、通話日時、通話時間、会話内容の書き起こし）</li>
                                    <li>AI設定情報（挨拶メッセージ、事業内容の説明）</li>
                                    <li>利用状況に関するデータ（着信回数、利用時間など）</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3 自動的に収集される情報</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>IPアドレス</li>
                                    <li>ブラウザの種類とバージョン</li>
                                    <li>アクセス日時</li>
                                    <li>クッキー情報</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 情報の利用目的</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            収集した個人情報は、以下の目的で利用します。
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>本サービスの提供、運営、維持、改善のため</li>
                            <li>ユーザーサポート、お問い合わせへの対応のため</li>
                            <li>AI電話取次機能の提供および通話内容の記録・要約のため</li>
                            <li>利用状況の分析、統計データの作成のため</li>
                            <li>新機能、アップデート、キャンペーン等のご案内のため</li>
                            <li>利用規約違反や不正利用の防止・対応のため</li>
                            <li>法令に基づく対応のため</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 情報の第三者提供</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>ユーザーの同意がある場合</li>
                            <li>法令に基づく場合</li>
                            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
                            <li>サービス提供に必要な範囲で、業務委託先に提供する場合（適切な管理・監督を行います）</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            なお、本サービスは以下の外部サービスを利用しており、それぞれのプライバシーポリシーに従って情報が取り扱われます。
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                            <li>Supabase（認証・データベース）</li>
                            <li>OpenAI（通話要約生成）</li>
                            <li>Twilio（電話通信）</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 情報の保存期間・削除</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            当社は、個人情報を利用目的の達成に必要な期間に限り保存します。
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            ユーザーがアカウントを削除した場合、関連する個人情報は合理的な期間内に削除されます。ただし、法令に基づく保存義務がある場合や、紛争解決のために必要な場合は、この限りではありません。
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            通話ログは、サービス提供および改善のために保存されますが、ユーザーはダッシュボードから個別の通話ログを確認・管理することができます。
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. セキュリティ</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            当社は、個人情報の漏洩、滅失、毀損を防止するため、以下のセキュリティ対策を実施しています。
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>SSL/TLS暗号化通信の使用</li>
                            <li>パスワードの暗号化保存</li>
                            <li>アクセス制御とRow Level Security（RLS）の実装</li>
                            <li>定期的なセキュリティ監査</li>
                            <li>従業員への情報セキュリティ教育</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            ただし、インターネット上の通信には完全なセキュリティを保証することはできないため、ユーザー自身もパスワード管理等に十分ご注意ください。
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. クッキー等の利用</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            本サービスでは、ユーザーの利便性向上およびサービス改善のため、クッキー（Cookie）および類似の技術を使用しています。
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            クッキーは、ユーザーのブラウザに保存される小さなテキストファイルで、以下の目的で使用されます。
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>ログイン状態の維持</li>
                            <li>ユーザー設定の保存</li>
                            <li>サービス利用状況の分析</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            ブラウザの設定により、クッキーの受け入れを拒否することも可能ですが、その場合、本サービスの一部機能が正常に動作しない可能性があります。
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. プライバシーポリシーの変更</h2>
                        <p className="text-gray-700 leading-relaxed">
                            当社は、法令の変更や本サービスの機能追加等に伴い、本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、当社ウェブサイトに掲載した時点より効力を生じるものとします。重要な変更がある場合は、ユーザーに対して適切な方法で通知いたします。
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. お問い合わせ窓口</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            個人情報の取り扱いに関するお問い合わせ、開示・訂正・削除等のご請求は、以下の窓口までご連絡ください。
                        </p>
                        <div className="bg-gray-50 rounded-lg p-6 mt-4">
                            <p className="text-gray-700">
                                <span className="font-semibold">サービス名：</span>AiLuna
                            </p>
                            <p className="text-gray-700 mt-2">
                                <span className="font-semibold">お問い合わせ先：</span>
                                <span className="text-gray-500">（準備中 - 正式版公開時に記載予定）</span>
                            </p>
                        </div>
                    </section>

                    {/* Notice */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                            ※ 本プライバシーポリシーはドラフト版です。正式版は法的レビューを経て公開される予定です。
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
