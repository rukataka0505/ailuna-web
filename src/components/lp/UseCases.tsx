import { Stethoscope, CalendarClock, MessageCircleQuestion } from 'lucide-react';

export default function UseCases() {
    const cases = [
        {
            title: '初診予約',
            scene: 'Scene 01',
            description: '希望日時や症状のヒアリングを自動化。「いつ・誰が・どんな症状で」来るかが事前にわかるので、準備がスムーズに。',
            icon: Stethoscope,
            accent: 'border-l-teal-500',
        },
        {
            title: '予約変更・キャンセル',
            scene: 'Scene 02',
            description: '「明日の予約を変更したい」といった電話もAIが一次受付。スタッフは空き状況を確認して、折り返し連絡するだけで完了します。',
            icon: CalendarClock,
            accent: 'border-l-indigo-500',
        },
        {
            title: 'よくある問い合わせ',
            scene: 'Scene 03',
            description: '「駐車場はありますか？」「今の時間は混んでますか？」といった定型質問には、AIが即座に回答。電話対応の数を劇的に減らします。',
            icon: MessageCircleQuestion,
            accent: 'border-l-coral-500',
        },
    ];

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Use Cases</h2>
                    <p className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">
                        こんな場面で活躍します
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cases.map((item, index) => (
                        <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-lg transition-shadow`}>
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.accent.replace('border-l-', 'bg-')}`}></div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-mono text-gray-400">{item.scene}</span>
                                    <item.icon className="h-6 w-6 text-gray-400 group-hover:text-navy-900 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-navy-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
