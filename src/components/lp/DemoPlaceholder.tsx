import Link from 'next/link';
import { Play, ArrowRight, Lock } from 'lucide-react';

export default function DemoPlaceholder() {
    const demos = [
        { title: '初診予約', duration: '1:20', type: 'Reservation' },
        { title: '診療時間・休診日', duration: '0:45', type: 'Inquiry' },
        { title: '予約変更・キャンセル', duration: '1:10', type: 'Change' },
    ];

    return (
        <section className="py-20 bg-navy-900 border-t border-white/5 relative overflow-hidden">
            {/* Background Noise/Texture */}
            <div className="absolute inset-0 opacity-[0.03] pattern-grid-lg pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        実際の音声を聞く (準備中)
                    </h2>
                    <p className="mt-2 text-gray-400">
                        AIの自然な対応をご確認いただけます。
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {demos.map((demo, index) => (
                        <div
                            key={index}
                            className="group relative bg-navy-800/50 rounded-xl p-6 border border-white/5 hover:border-teal-500/30 transition-all hover:bg-navy-800 cursor-not-allowed"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                    {demo.type}
                                </span>
                                <span className="text-xs text-gray-500">{demo.duration}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-6 group-hover:text-teal-400 transition-colors">
                                {demo.title}
                            </h3>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-400/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-400 group-hover:text-navy-900 transition-all">
                                    <Play className="h-4 w-4 fill-current" />
                                </div>
                                <div className="h-1 bg-navy-950 rounded-full flex-1 overflow-hidden">
                                    <div className="h-full w-0 bg-teal-400 group-hover:w-1/3 transition-all duration-1000"></div>
                                </div>
                            </div>

                            {/* Overlay for "Under Construction" feel but clickable looking */}
                            {/* <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-xs font-mono text-gray-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 準備中
                 </span>
              </div> */}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-lg text-gray-300 mb-6">
                        実際に使ってみたい方は、無料アカウント登録へ
                    </p>
                    <Link
                        href="/login?mode=signup"
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                    >
                        無料で試す (アカウント登録)
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
