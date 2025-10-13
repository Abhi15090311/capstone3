import { Card, CardTitle } from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatCurrency } from '@/lib/format'
import { bills, runway, transactions } from '@/lib/mock'

export function BalanceCard() {
  const afterBills = (runway.balance_cents/100) - bills.reduce((s, b)=> s + b.amount, 0)
  const paidPct = Math.min(100, (afterBills / (runway.balance_cents/100)) * 100)
  return (
    <Card>
      <CardTitle>Current Balance</CardTitle>
      <div className="text-3xl font-bold">{formatCurrency(runway.balance_cents/100)}</div>
      <p className="mt-1 text-sm text-gray-600">After upcoming bills: {formatCurrency(afterBills)}</p>
      <div className="mt-3"><ProgressBar value={paidPct} max={100} /></div>
    </Card>
  )
}

export function DaysLeftCard() {
  return (
    <Card>
      <CardTitle>Days Left</CardTitle>
      <div className="text-3xl font-bold">{runway.days_left_regular} <span className="text-base font-medium text-gray-600 align-middle">today</span></div>
      <div className="mt-3"><ProgressBar value={runway.days_left_regular} max={runway.goal_days} /></div>
      <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
        <span>Power-Save</span>
        <span className="font-medium">{runway.days_left_power_save}</span>
      </div>
    </Card>
  )
}

export function DailyBurnCard() {
  const expenses = transactions.filter(t=>t.type==='expense').map(t=>t.amount)
  const avg = expenses.length ? expenses.reduce((a,b)=>a+b,0)/expenses.length : 0
  return (
    <Card>
      <CardTitle>Daily Burn</CardTitle>
      <div className="text-3xl font-bold">{formatCurrency(avg)}</div>
      <p className="mt-1 text-sm text-gray-600">Avg per spend day</p>
    </Card>
  )
}
