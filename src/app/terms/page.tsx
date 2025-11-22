import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/Footer'

export const metadata = {
    title: '利用規約 - AiLuna',
    description: 'AiLunaサービスの利用規約です。',
}

export default function TermsPage() {
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
                        利用規約
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        AiLunaサービスをご利用いただくにあたり、以下の利用規約をご確認ください。
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        最終更新日：2025年11月22日
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">第1条（適用）</h2>
                        <p className="text-gray-700 leading-relaxed">
                            本利用規約（以下「本規約」といいます）は、AiLuna（以下「当社」といいます）が提供するAI電話取次サービス「AiLuna」（以下「本サービス」といいます）の利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」といいます）には、本規約に従って本サービスをご利用いただきます。
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">第2条（定義）</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            本規約において使用する用語の定義は、以下のとおりとします。
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>「本サービス」とは、当社が提供するAI電話取次サービス「AiLuna」を指します。</li>
                            <li>「ユーザー」とは、本サービスを利用する個人または法人を指します。</li>
                            <li>「登録情報」とは、ユーザーが本サービスの利用登録時に提供する情報を指します。</li>
                            <li>「通話ログ」とは、本サービスを通じて記録される通話内容および関連データを指します。</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">第3条（登録）</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            本サービスの利用を希望する方は、本規約に同意の上、当社所定の方法により利用登録を行うものとします。
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            当社は、登録申請者が以下のいずれかに該当する場合、登録を拒否することがあります。
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>登録情報に虚偽の記載、誤記、または記入漏れがあった場合</li>
                            <li>過去に本規約違反等により登録を取り消された者である場合</li>
                            <li>その他、当社が登録を適当でないと判断した場合</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">第4条（禁止事項）</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            ユーザーは、本サービスの利用にあたり、以下の行為を行ってはならないものとします。
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>法令または公序良俗に違反する行為</li>
                            <li>犯罪行為に関連する行為</li>
                            <li>当社または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
                            <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
                            <li>本サービスの運営を妨害するおそれのある行為</li>
                            <li>不正アクセスをし、またはこれを試みる行為</li>
                            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                            <li>その他、当社が不適切と判断する行為</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">第5条（サービスの提供の停止・中断）</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                            <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                            <li>その他、当社が本サービスの提供が困難と判断した場合</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">第6条（免責事項）</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            本サービスは現状有姿で提供されるものであり、当社は本サービスの完全性、正確性、確実性、有用性等について、いかなる保証も行いません。
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">第7条（利用規約の変更）</h2>
                        <p className="text-gray-700 leading-relaxed">
                            当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の本規約は、当社ウェブサイトに掲示された時点より効力を生じるものとします。
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">第8条（準拠法・裁判管轄）</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            本規約の解釈にあたっては、日本法を準拠法とします。
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
                        </p>
                    </section>

                    {/* Notice */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                            ※ 本利用規約はドラフト版です。正式版は法的レビューを経て公開される予定です。
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
