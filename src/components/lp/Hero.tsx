import Link from 'next/link';
import { ArrowRight, Phone, Calendar, check } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-coral-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-teal-400/30 bg-teal-400/10 text-teal-300 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 mr-2 animate-pulse"></span>
              クリニック専用 AI電話受付
            </div>
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl lg:leading-tight">
              AI電話受付で、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">
                予約対応をなめらかに。
              </span>
            </h1>
            <p className="mt-6 text-base text-gray-300 sm:mt-8 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-8 md:text-xl lg:mx-0">
              電話予約と問い合わせをAIが受付。予約内容は管理画面に集約、スタッフは確認して確定するだけ。
              <br className="hidden lg:inline" />診療中の電話対応をゼロに。
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-navy-950 bg-teal-400 hover:bg-teal-300 transition-all shadow-lg shadow-teal-400/20 hover:shadow-teal-400/40"
              >
                無料で試す
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="https://calendar.app.google/xxxxx" // Placeholder or actual link if known
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-600 text-base font-medium rounded-lg text-gray-300 hover:bg-white/5 transition-all"
              >
                導入相談 (15分)
              </Link>
            </div>
            
            <p className="mt-4 text-sm text-gray-400">
              ※ クレジットカード登録不要、即日利用可能
            </p>
          </div>

          {/* Visual Content */}
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden border border-white/10 bg-navy-900/50 backdrop-blur-sm">
              <div className="p-1 bg-gradient-to-br from-white/10 to-transparent">
                <div className="bg-navy-900 rounded-xl overflow-hidden relative">
                  {/* Mock UI Header */}
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-navy-950/50">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                       <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                       <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">AiLuna Admin</div>
                  </div>

                  {/* Mock UI Body */}
                  <div className="p-4 space-y-4">
                    {/* Incoming Call Card */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-navy-800/50 border border-teal-500/20 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 w-1 h-full bg-teal-500"></div>
                      <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-400">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                           <p className="text-sm font-medium text-white">新規予約リクエスト</p>
                           <span className="text-xs text-gray-400">たった今</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">佐藤 様 (初診)</p>
                        <div className="mt-2 text-xs text-gray-400 bg-navy-950/50 p-2 rounded border border-white/5">
                          「来週火曜日の10時から、虫歯の治療をお願いしたいのですが...」
                        </div>
                      </div>
                    </div>

                     {/* Confirmed Reservation */}
                     <div className="flex items-start gap-4 p-4 rounded-lg bg-navy-800/30 border border-white/5 opacity-60">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                           <p className="text-sm font-medium text-white">田中 様 (再診)</p>
                           <span className="text-xs text-gray-400">10分前</span>
                        </div>
                         <div className="mt-2 flex items-center gap-2">
                             <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/20">確定済み</span>
                             <span className="text-xs text-gray-500">SMS送信完了</span>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Notification */}
                  <div className="absolute bottom-4 right-4 bg-white text-navy-950 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-subtle">
                     <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                     <div className="text-sm font-bold">予約が確定しました</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements around Visual */}
             <div className="absolute -z-10 top-[-20px] right-[-20px] w-24 h-24 bg-dots-pattern opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
