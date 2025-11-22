import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut, fetchCallLogsPaginated, fetchUniqueCallerNumbers, fetchUserProfile, fetchCallMetrics } from './actions'
import { DashboardClient } from './DashboardClient'


export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: prompts } = await supabase
        .from('user_prompts')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const { logs: initialLogs, count: initialCount } = await fetchCallLogsPaginated(0, 10)
    const uniqueCallers = await fetchUniqueCallerNumbers()
    const userProfile = await fetchUserProfile()
    const metrics = await fetchCallMetrics()
    const metricsWithBilling = {
        ...metrics,
        currentMonthBilling: 0
    }

    return (
        <DashboardClient
            userEmail={user.email || ''}
            userProfile={userProfile}
            metrics={metricsWithBilling}
            prompts={prompts}
            initialLogs={initialLogs || []}
            initialCount={initialCount || 0}
            uniqueCallers={uniqueCallers}
            signOutAction={signOut}
        />
    )
}
