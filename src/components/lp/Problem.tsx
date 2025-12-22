import { PhoneMissed, Clock, Users, FileText } from 'lucide-react';

export default function Problem() {
    const problems = [
        {
            icon: PhoneMissed,
            title: '予約の取りこぼし',
            description: '診療中や休診日は電話に出られず、せっかくの初診予約や問い合わせを逃してしまう。',
            color: 'text-rose-500',
            bg: 'bg-rose-50',
        },
        {
            icon: Clock,
            title: '受付業務の圧迫',
            description: '電話対応で受付スタッフの手が止まり、目の前の患者様の会計や案内が遅れてしまう。',
            color: 'text-orange-500',
            bg: 'bg-orange-50',
        },
        {
            icon: Users,
            title: '対応の属人化',
            description: 'スタッフによってヒアリング内容にバラつきがあり、必要な情報が漏れてしまうことがある。',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
        {
            icon: FileText,
            title: '言った言わない問題',
            description: '電話の内容が記録に残らないため、聞き間違いや伝言ミスによるトラブルが発生する。',
            color: 'text-slate-500',
            bg: 'bg-slate-50',
        },
    ];

    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                        Current Issues
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        日々の電話対応で、<br />こんな <span className="text-rose-500 underline decoration-rose-200 decoration-4 underline-offset-4">お悩み</span> はありませんか？
                    </p>
                    <p className="mt-4 text-xl text-gray-500">
                        クリニックの現場では、電話対応が本来の業務を圧迫しています。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {problems.map((item, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100"
                        >
                            <div className={`w-14 h-14 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <item.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
