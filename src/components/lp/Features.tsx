import { Settings, ListChecks, Bell, LayoutTemplate, History, Check, MessageSquare } from 'lucide-react';

export default function Features() {
    const features = [
        {
            title: 'AI応対カスタム',
            subtitle: 'Customize',
            description: '院のブランドに合わせて、AIの話し方や対応ルールを自由に設定。休診日やアクセスなどの質問にも、あなたの代わりに正確に答えます。',
            points: ['話し方（丁寧/親しみ）', '第一声のカスタマイズ', 'FAQ登録（診療時間など）', 'SMSテンプレート'],
            icon: Settings,
            color: 'teal',
            visual: (
                <div className="w-full h-full bg-slate-50 rounded-xl border border-gray-200 p-4 shadow-sm relative overflow-hidden">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <span className="text-sm font-semibold text-gray-700">AI設定</span>
                            <div className="w-8 h-4 bg-teal-100 rounded-full relative">
                                <div className="absolute right-1 top-0.5 w-3 h-3 bg-teal-500 rounded-full"></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs text-gray-500">話し方</div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-teal-50 text-teal-600 text-xs rounded-full border border-teal-100 font-medium">丁寧</span>
                                <span className="px-3 py-1 bg-white text-gray-400 text-xs rounded-full border border-gray-100">フレンドリー</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs text-gray-500">第一声</div>
                            <div className="bg-white p-2 rounded border border-gray-200 text-xs text-gray-600">
                                お電話ありがとうございます。〇〇クリニックです...
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: '予約管理',
            subtitle: 'Management',
            description: '予約リクエストは管理画面に自動で集約。内容を確認して「承認」ボタンを押すだけで、予約が確定します。',
            points: ['ステータス管理', '希望日時・人数確認', '患者向けメッセージ機能', '承認・却下フロー'],
            icon: ListChecks,
            color: 'indigo',
            visual: (
                <div className="w-full h-full bg-slate-50 rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="space-y-2">
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm flex items-start gap-3">
                            <div className="bg-indigo-50 p-2 rounded text-indigo-500">
                                <ListChecks className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-700">佐藤 様</span>
                                    <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">未承認</span>
                                </div>
                                <p className="text-[10px] text-gray-500">10月24日(月) 10:00 - 初診</p>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-100 opacity-60 flex items-start gap-3">
                            <div className="bg-gray-50 p-2 rounded text-gray-400">
                                <ListChecks className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-600">鈴木 様</span>
                                    <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">確定済</span>
                                </div>
                                <p className="text-[10px] text-gray-500">10月24日(月) 14:00 - 再診</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button className="flex-1 bg-indigo-600 text-white text-[10px] py-1.5 rounded shadow-sm hover:bg-indigo-700">承認</button>
                        <button className="flex-1 bg-white text-gray-500 text-[10px] py-1.5 rounded border border-gray-200">却下</button>
                    </div>
                </div>
            )
        },
        {
            title: '通知機能',
            subtitle: 'Notification',
            description: '予約が入ったら、メールやLINEで即座に通知。個人のLINEとも連携できるので、外出先でも状況を確認できます。',
            points: ['複数メールアドレス登録', 'LINE連携（個人・グループ）', 'リアルタイム通知'],
            icon: Bell,
            color: 'emerald',
            visual: (
                <div className="w-full h-full bg-slate-50 rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-center relative">
                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-[#06C755] p-3 flex items-center gap-2">
                            <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                            <span className="text-white text-xs font-bold">LINE Notification</span>
                        </div>
                        <div className="p-3">
                            <div className="bg-gray-100 rounded-lg p-2 text-[10px] text-gray-600">
                                <p className="font-bold mb-1">新規予約リクエスト</p>
                                <p>佐藤様から予約の申請がありました。</p>
                                <p className="text-gray-400 mt-1">10:24</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: '予約フォーム設定',
            subtitle: 'Form Builder',
            description: '「初診/再診」「希望日時」「症状のメモ」など、クリニックに必要なヒアリング項目を自由に設定できます。',
            points: ['項目の追加・削除', '必須/任意の切り替え', '選択肢の編集', 'ドラッグ&ドロップ並べ替え'],
            icon: LayoutTemplate,
            color: 'rose',
            visual: (
                <div className="w-full h-full bg-slate-50 rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded border-l-4 border-l-rose-400">
                            <div className="w-4 h-4 bg-gray-100 rounded text-gray-400 flex items-center justify-center text-[8px]">::</div>
                            <div className="flex-1">
                                <div className="h-2 w-16 bg-gray-200 rounded mb-1"></div>
                                <div className="h-1.5 w-10 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded border-l-4 border-l-rose-400">
                            <div className="w-4 h-4 bg-gray-100 rounded text-gray-400 flex items-center justify-center text-[8px]">::</div>
                            <div className="flex-1">
                                <div className="h-2 w-20 bg-gray-200 rounded mb-1"></div>
                                <div className="flex gap-1 mt-1">
                                    <div className="h-1.5 w-8 bg-gray-100 rounded"></div>
                                    <div className="h-1.5 w-8 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-2">
                            <div className="text-[10px] text-rose-500 font-medium border border-rose-200 px-2 py-1 rounded bg-rose-50">+ 項目を追加</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: '通話履歴・要約',
            subtitle: 'Log & Summary',
            description: '通話の内容はAIが自動で要約。聞き逃しがあっても、後から文字と音声で確認できるので安心です。',
            points: ['通話音声の再生', 'AIによる自動要約', 'キーワード検索', '会話ログの閲覧'],
            icon: History,
            color: 'cyan',
            visual: (
                <div className="w-full h-full bg-slate-50 rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">要約</span>
                            <p className="text-[10px] text-gray-700 font-medium">予約の変更依頼。来週水曜15時希望。</p>
                        </div>
                        <div className="h-px bg-gray-100"></div>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0"></div>
                                <div className="bg-white border border-gray-200 p-2 rounded-lg rounded-tl-none text-[10px] text-gray-600 w-3/4">
                                    来週の予約を変更したいのですが...
                                </div>
                            </div>
                            <div className="flex gap-2 flex-row-reverse">
                                <div className="w-5 h-5 rounded-full bg-cyan-100 flex-shrink-0"></div>
                                <div className="bg-cyan-50 border border-cyan-100 p-2 rounded-lg rounded-tr-none text-[10px] text-cyan-800 w-3/4">
                                    かしこまりました。ご希望の日時はございますか？
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
    ];

    return (
        <section className="py-32 bg-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-50 to-transparent -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-24">
                    <h2 className="text-teal-600 font-semibold tracking-wide uppercase text-sm">Features</h2>
                    <p className="mt-3 text-4xl font-extrabold text-navy-950 sm:text-5xl">
                        現場に寄り添う、<br />確かな機能。
                    </p>
                    <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                        クリニックの「あったらいいな」を詰め込みました。<br />
                        設定はシンプル、機能はプロ仕様。
                    </p>
                </div>

                <div className="space-y-32">
                    {features.map((feature, index) => (
                        <div key={index} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>

                            {/* Text Side */}
                            <div className="flex-1 space-y-6">
                                <div className={`p-3 rounded-2xl w-fit ${feature.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                                        feature.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                                            feature.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                                feature.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-cyan-100 text-cyan-600'
                                    }`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>

                                <div>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{feature.subtitle}</span>
                                    <h3 className="text-3xl font-bold text-navy-900 mt-1 mb-4">{feature.title}</h3>
                                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                        {feature.description}
                                    </p>
                                </div>

                                <ul className="space-y-3">
                                    {feature.points.map((point, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visual Side */}
                            <div className="flex-1 w-full">
                                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                                    <div className="absolute inset-4 bg-white rounded-2xl shadow-inner overflow-hidden">
                                        {/* Top Bar Mockup */}
                                        <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                        </div>
                                        {/* Visual Content */}
                                        <div className="p-6 h-full">
                                            {feature.visual}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
