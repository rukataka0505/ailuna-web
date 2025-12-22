export default function FAQ() {
    const faqs = [
        {
            q: 'AIが聞き間違えたり、誤った回答をすることはありませんか？',
            a: 'AIは日々進化していますが、完璧ではありません。そのため、予約はAIだけで確定せず、必ずスタッフ様が内容を確認してから「承認」する仕組みになっています。また、間違えやすい内容はログを確認してFAQを修正することで、精度を向上させることができます。'
        },
        {
            q: '通知は誰に届きますか？',
            a: 'メール通知は複数のアドレスを登録できるため、スタッフ全員で共有可能です。LINE通知は、連携した個人のアカウントに届きます。院内の共有端末でLINE連携を行えば、端末を持っているスタッフ全員で確認することも可能です。'
        },
        {
            q: '忙しい時間帯だけAIに任せることはできますか？',
            a: 'はい、可能です。電話機の転送設定をオン/オフするだけで切り替えられます。「診療中だけ転送する」「お昼休みだけ転送する」といった使い方ができます。'
        },
        {
            q: 'どれくらいで始められますか？',
            a: 'アカウント登録から初期設定まで、早ければ30分程度で完了します。電話機の転送設定を行えば、その日からすぐにご利用いただけます。'
        },
    ];

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">FAQ</h2>
                    <p className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">
                        よくあるご質問
                    </p>
                </div>

                <div className="space-y-6">
                    {faqs.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-start gap-4">
                                <span className="text-teal-500 font-mono text-xl">Q.</span>
                                <span>{item.q}</span>
                            </h3>
                            <div className="flex items-start gap-4">
                                <span className="text-indigo-500 font-mono text-xl font-bold">A.</span>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
