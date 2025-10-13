import OBShell from '@/components/onboarding/OBShell'
import OBProgress from '@/components/onboarding/OBProgress'
import Pill from '@/components/ui/Pill'
import { PrimaryCTA, LinkCTA } from '@/components/ui/CTA'
import { setOnboarding } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const opts = ['Weekly','Bi-weekly','Monthly','Irregular / Not sure']

export default function PayCadence() {
  const [sel, setSel] = useState<string|undefined>()
  const nav = useNavigate()
  return (
    <OBShell>
      <OBProgress step={2} />
      <h1 className="mb-5 text-center text-3xl font-bold leading-tight md:text-4xl">How often do you usually get paid?</h1>
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
        {opts.map(o=><Pill key={o} active={sel===o} onClick={()=>setSel(o)}>{o}</Pill>)}
      </div>
      <p className="mx-auto mt-4 max-w-sm text-center text-sm text-gray-600">Used to forecast income rhythm.</p>
      <div className="mx-auto mt-6 max-w-sm">
        <PrimaryCTA onClick={()=>{ setOnboarding('bills'); nav('/onboarding/bills') }}>Continue</PrimaryCTA>
        <div className="mt-1 text-center text-sm text-gray-500">You can change this later.</div>
      </div>
      <div className="mt-2">
        <LinkCTA onClick={()=>nav('/onboarding/balance')}>Back</LinkCTA>
      </div>
    </OBShell>
  )
}
