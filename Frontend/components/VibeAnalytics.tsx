"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Activity } from 'lucide-react'

const CustomTick = ({ x, y, payload }: any) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <foreignObject x={-40} y={10} width={80} height={20}>
                <div className="text-[10px] font-bold text-center text-black/50 truncate w-full" title={payload.value}>
                    {payload.value}
                </div>
            </foreignObject>
        </g>
    )
}

export function VibeAnalytics({ userId }: { userId: string }) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function getStats() {
            if (!userId) return

            try {
                // 1. Fetch user's posts from last 30 days
                const { data: posts, error } = await supabase
                    .from('community_playlists')
                    .select('emotion, created_at')
                    .eq('user_id', userId)
                    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

                if (error) {
                    console.error('Error fetching analytics:', error)
                    return
                }

                if (!posts) return

                // 2. Count emotions (The Analysis)
                const counts: Record<string, number> = {}
                posts.forEach((post) => {
                    if (post.emotion) {
                        counts[post.emotion] = (counts[post.emotion] || 0) + 1
                    }
                })

                // 3. Format for Chart
                const chartData = Object.keys(counts).map((key) => ({
                    name: key,
                    count: counts[key],
                }))

                setData(chartData)
            } catch (e) {
                console.error("Unexpected error in analytics:", e)
            } finally {
                setLoading(false)
            }
        }

        getStats()
    }, [userId, supabase])

    // Colors for bars - matched to app palette (Pop Brutalist)
    const COLORS = ['#FACC55', '#A78BFA', '#FB58B4', '#4ECDC4', '#FF6B6B', '#3DD598']

    if (loading) {
        return (
            <div className="h-full min-h-[300px] w-full bg-white p-4 rounded-[32px] border border-black/5 animate-pulse flex items-center justify-center shadow-sm">
                <span className="text-black/40 font-bold uppercase tracking-wider">Loading Vibe Check...</span>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="h-full min-h-[300px] w-full bg-white p-8 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center">
                <p className="text-black/40 font-bold text-lg mb-2">No vibe data yet this month.</p>
                <p className="text-sm text-black/30 font-medium">Start creating playlists to see your footprint!</p>
            </div>
        )
    }

    return (
        <div className="h-full min-h-[300px] md:min-h-[340px] w-full bg-white/60 backdrop-blur-md p-6 md:p-10 rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="flex items-start md:items-center gap-3 mb-6 pl-2 shrink-0">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-[#FB58B4] mt-1 md:mt-0 shrink-0" />
                <h3 className="text-black font-black uppercase tracking-tight text-lg md:text-2xl leading-tight max-w-[200px] md:max-w-none">
                    Your Monthly Vibe Check
                </h3>
            </div>
            <div className="flex-1 w-full min-h-0 outline-none">
                <ResponsiveContainer width="100%" height="100%" className="outline-none">
                    <BarChart data={data} margin={{ bottom: 20 }}>


                        <XAxis
                            dataKey="name"
                            stroke="#000000"
                            fontSize={10}
                            interval={0}
                            tickLine={false}
                            axisLine={false}
                            tick={<CustomTick />}
                        />
                        <YAxis
                            stroke="#000000"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            // ...
                            allowDecimals={false}
                            tick={{ fill: 'rgba(0,0,0,0.3)', fontWeight: 700 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#000',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 4 }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="transparent" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
