import { UserPlus, Settings, Layout, Bell, Rocket } from 'lucide-react';

export default function Flow() {
    const steps = [
        {
            icon: UserPlus,
            title: '無料登録',
            description: 'アカウントを作成します。クレジットカードは不要です。',
        },
        {
            icon: Settings,
            title: '院内情報・FAQ登録',
            description: '診療時間や休診日、よくある質問への回答を入力します。',
        },
        {
            icon: Layout,
            title: '予約フォーム設定',
            description: '電話でヒアリングしたい項目（希望日時など）を設定します。',
        },
        {
            icon: Bell,
            title: '通知設定',
            description: '予約が入った際の通知先（メール・LINE）を設定します。',
        },
        {
            icon: Rocket,
            title: '転送設定・開始',
            description: '電話機の転送設定をすれば、すぐにAI受付が開始されます。',
        },
    ];

    return (
        <section className="py-24 bg-navy-900 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4b5563_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-teal-400 font-semibold tracking-wide uppercase text-sm">How to start</h2>
                    <p className="mt-2 text-3xl font-extrabold sm:text-4xl">
                        導入はとても簡単です
                    </p>
                    <p className="mt-4 text-xl text-gray-400">
                        最短即日でスタート。特別な機器の設置は必要ありません。
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-700 -z-10"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-2xl bg-navy-800 border border-gray-700 flex items-center justify-center shadow-lg mb-6 group-hover:border-teal-500/50 group-hover:bg-navy-800/80 transition-all z-10">
                                    <step.icon className="h-8 w-8 text-teal-400" />
                                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-navy-950 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-teal-400 group-hover:border-teal-500 transition-colors">
                                        {index + 1}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed px-2">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
