import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { VibeDashboard } from '@/components/VibeDashboard'
import { Navbar } from '@/components/layout/navbar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Music2 } from 'lucide-react'

export default async function MyVibePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get display name
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Friend"
    const avatarUrl = user.user_metadata?.avatar_url

    return (
        <div className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 text-black selection:bg-[#FACC55] selection:text-black font-sans">
            {/* Fixed Background Effects Layer */}
            <div className="fixed -top-12 -left-12 w-64 h-64 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob -z-10" />
            <div className="fixed top-0 -right-4 w-64 h-64 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000 -z-10" />
            <div className="fixed -bottom-8 left-20 w-64 h-64 bg-[#FB58B4] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000 -z-10" />
            <div className="fixed bottom-40 right-20 w-48 h-48 bg-[#4ECDC4] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000 -z-10" />

            {/* Floating Icons Layer */}
            <div className="fixed top-24 left-10 text-[#FACC55] animate-blob filter drop-shadow-lg -z-10 hidden md:block">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-12"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <div className="fixed top-32 right-12 text-[#FB58B4] animate-bounce duration-[3000ms] filter drop-shadow-md -z-10 hidden md:block">
                <Music2 className="w-12 h-12 transform rotate-12" />
            </div>
            <div className="fixed bottom-24 left-12 text-[#E34234] animate-blob animation-delay-2000 filter drop-shadow-md -z-10 hidden md:block">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-10 h-10"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>

            <Navbar />

            <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">

                {/* Header Section */}
                <DashboardHeader
                    fullName={fullName}
                    avatarUrl={avatarUrl}
                    email={user.email}
                />

                {/* Dashboard Content */}
                <VibeDashboard userId={user.id} />
            </div>
        </div>
    )
}
