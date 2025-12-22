import { ShieldCheck, Eye, Sparkles } from 'lucide-react';

export default function Reasons() {
    const reasons = [
        {
            title: 'AIが受け、人が確定する安心感',
            description: 'AIに全てを任せるのではなく、最終的な予約確定はスタッフが行います。勝手に予約が入る心配がなく、運用の主導権は常にクリニック側にあります。',
            icon: ShieldCheck,
        },
        {
            title: 'ログが見える、言った言わないを防ぐ',
            description: '通話内容は全てテキストと録音で保存されます。「電話でこう言ったはず」というトラブルを未然に防ぎ、スムーズな引き継ぎが可能になります。',
            icon: Eye,
        },
        {
            title: '院内ルールを固定化、品質を標準化',
            description: '新人スタッフでもベテランでも、AIなら同じ品質で対応します。院のルールをAIに教え込むことで、常に丁寧で正確な案内を実現します。',
            icon: Sparkles,
        },
    ];

    return (
        <section className="py-24 bg-navy-950 relative overflow-hidden text-white">
            {/* Background Shapes */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-teal-400 font-semibold tracking-wide uppercase text-sm">Why AiLuna?</h2>
                    <p className="mt-2 text-3xl font-extrabold sm:text-4xl">
                        選ばれる<span className="text-teal-400">3つの理由</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {reasons.map((reason, index) => (
                        <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                            <div className="w-14 h-14 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
                                <reason.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{reason.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                {reason.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
