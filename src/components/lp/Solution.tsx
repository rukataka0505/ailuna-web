import { Bot, Laptop, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Solution() {
    return (
        <section className="py-24 bg-gradient-to-b from-indigo-50 to-white overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">
                        Our Solution
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold text-navy-900 sm:text-4xl">
                        AiLunaなら、<br />電話対応は<span className="text-indigo-600">「確認するだけ」</span>へ。
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[15%] left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        {/* Step 1 */}
                        <div className="relative flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-white border-4 border-indigo-100 flex items-center justify-center shadow-lg mb-6 z-10">
                                <Bot className="h-10 w-10 text-indigo-600" />
                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                                    1
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-navy-900 mb-3">AIが電話を受付</h3>
                            <p className="text-gray-600 max-w-xs mx-auto">
                                予約や質問にAIが自動で応対します。<br />24時間365日、取りこぼしゼロへ。
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-center text-center">
                            {/* Mobile Arrow */}
                            <div className="md:hidden mb-8 text-gray-300 transform rotate-90">
                                <ArrowRight className="h-8 w-8" />
                            </div>

                            <div className="w-24 h-24 rounded-full bg-white border-4 border-teal-100 flex items-center justify-center shadow-lg mb-6 z-10">
                                <Laptop className="h-10 w-10 text-teal-500" />
                                <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                                    2
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-navy-900 mb-3">管理画面に集約</h3>
                            <p className="text-gray-600 max-w-xs mx-auto">
                                会話内容は文字起こしされ、<br />予約リストに自動で追加されます。
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-center text-center">
                            {/* Mobile Arrow */}
                            <div className="md:hidden mb-8 text-gray-300 transform rotate-90">
                                <ArrowRight className="h-8 w-8" />
                            </div>

                            <div className="w-24 h-24 rounded-full bg-white border-4 border-coral-100 flex items-center justify-center shadow-lg mb-6 z-10">
                                <CheckCircle2 className="h-10 w-10 text-coral-500" />
                                <div className="absolute -top-2 -right-2 bg-coral-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                                    3
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-navy-900 mb-3">承認して確定</h3>
                            <p className="text-gray-600 max-w-xs mx-auto">
                                スタッフは内容を確認し、ボタンを押すだけ。<br />患者様へSMSで通知も可能です。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
