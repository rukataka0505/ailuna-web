import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Hero from '@/components/lp/Hero'
import DemoPlaceholder from '@/components/lp/DemoPlaceholder'
import Problem from '@/components/lp/Problem'
import Solution from '@/components/lp/Solution'
import Features from '@/components/lp/Features'
import Reasons from '@/components/lp/Reasons'
import UseCases from '@/components/lp/UseCases'
import Pricing from '@/components/lp/Pricing'
import Flow from '@/components/lp/Flow'
import FAQ from '@/components/lp/FAQ'
import Footer from '@/components/lp/Footer'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Header />
      </div>

      <main className="flex-grow pt-20">
        <Hero />
        <DemoPlaceholder />
        <Problem />
        <Solution />
        <Features />
        <Reasons />
        <UseCases />
        <Pricing />
        <Flow />
        <FAQ />
      </main>

      <Footer />
    </div>
  )
}
