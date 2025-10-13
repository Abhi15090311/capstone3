import { Card, CardTitle } from '@/components/ui/Card'
import { bills } from '@/lib/mock'
import { daysFromNow } from '@/lib/format'

export default function UpcomingBills() {
  const upcoming = [...bills].sort((a,b)=> daysFromNow(a.next_due) - daysFromNow(b.next_due)).slice(0,2)
  return (
    <Card>
      <CardTitle>Upcoming Bills</CardTitle>
      <ul className="space-y-2 text-sm">
        {upcoming.map(b=>(
          <li key={b.id} className="flex items-center justify-between">
            <span className="font-medium">{b.name}</span>
            <span className="text-gray-700">in {daysFromNow(b.next_due)} days</span>
          </li>
        ))}
      </ul>
      <button className="mt-3 w-full rounded-2xl border border-soft bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
        + Add Bill
      </button>
    </Card>
  )
}
