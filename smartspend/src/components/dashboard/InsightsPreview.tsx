import { Card, CardTitle } from '@/components/ui/Card'
import { insights } from '@/lib/mock'

export default function InsightsPreview() {
  const top = insights[0]
  return (
    <Card>
      <CardTitle>Insights</CardTitle>
      <div className="text-sm">
        <div className="font-medium">{top.message}</div>
        <div className="mt-3">
          <button className="btn-ghost w-full">See all Insights</button>
        </div>
      </div>
    </Card>
  )
}
