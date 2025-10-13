import { useMemo, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { BalanceCard, DailyBurnCard, DaysLeftCard } from '@/components/dashboard/KpiCards'
import BurnRateChart from '@/components/dashboard/BurnRateChart'
import NWGPie from '@/components/dashboard/NWGPie'
import InsightsPreview from '@/components/dashboard/InsightsPreview'
import UpcomingBills from '@/components/dashboard/UpcomingBills'
import AchievementsCard from '@/components/dashboard/AchievementsCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { transactions } from '@/lib/mock'

// ---------- helpers ----------
type Range = 'today' | '7d' | '30d'
type NWG = 'Need' | 'Want' | 'Guilt'

function isWithinRange(iso: string, range: Range) {
  const d = new Date(iso)
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (range === 'today') return d >= startToday

  const days = range === '7d' ? 7 : 30
  const from = new Date(startToday)
  from.setDate(from.getDate() - (days - 1))
  const until = new Date(startToday)
  until.setDate(until.getDate() + 1) // inclusive today
  return d >= from && d < until
}

// simple demo burn series
const burnData = Array.from({ length: 14 }).map((_, i) => ({
  day: String(i + 1),
  spend: 70 + (i % 3) * 10 + (i > 6 ? 12 : 0),
}))

export default function Dashboard() {
  const [range, setRange] = useState<Range>('today')

  // Aggregate NWG for selected range (expenses only)
  const nwgRows = useMemo(() => {
    const acc: Record<NWG, number> = { Need: 0, Want: 0, Guilt: 0 }
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      if (!isWithinRange(t.occurred_at, range)) continue
      const k = (t.nwg ?? 'Want') as NWG
      acc[k] += t.amount
    }
    const total = acc.Need + acc.Want + acc.Guilt || 1
    return (['Need', 'Want', 'Guilt'] as NWG[]).map((k) => ({
      name: k,
      value: Number(acc[k].toFixed(2)),
      pct: Math.round((acc[k] / total) * 100),
    }))
  }, [range])

  return (
    <AppLayout>
      {/* KPI Row */}
      <div className="grid gap-3 md:grid-cols-3">
        <BalanceCard />
        <DaysLeftCard />
        <DailyBurnCard />
      </div>

      {/* Row 2: Burn chart + NWG with range toggle */}
      <div className="mt-2 grid gap-3 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardTitle>Burn Rate</CardTitle>
          <BurnRateChart data={burnData} />
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <CardTitle>Need/Want/Guilt</CardTitle>
            <div className="flex items-center gap-1">
              {(['today', '7d', '30d'] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-xl border px-2.5 py-1 text-xs transition ${
                    range === r
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-soft bg-white hover:bg-cream'
                  }`}
                  title={r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Today'}
                >
                  {r === 'today' ? 'Today' : r === '7d' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>
          </div>
          <NWGPie data={nwgRows} />
        </Card>
      </div>

      {/* Row 3: Insights / Bills / Achievements */}
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <InsightsPreview />
        <UpcomingBills />
        <AchievementsCard />
      </div>
    </AppLayout>
  )
}
