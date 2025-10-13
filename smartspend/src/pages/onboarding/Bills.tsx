import OBShell from '@/components/onboarding/OBShell'
import OBProgress from '@/components/onboarding/OBProgress'
import Pill from '@/components/ui/Pill'
import { PrimaryCTA, LinkCTA } from '@/components/ui/CTA'
import { setOnboarding } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const defaults = ['Rent','Phone','Internet','Subscriptions','others']

export default function BillsOB(){
  const [chosen, setChosen] = useState<string[]>([])
  const nav = useNavigate()
  const toggle = (x:string)=> setChosen(s=> s.includes(x) ? s.filter(i=>i!==x) : [...s, x])

  return (
    <OBShell>
      <OBProgress step={3} />
      <h1 className="mb-5 text-center text-3xl font-bold leading-tight md:text-4xl">Any regular bills we should plan for?</h1>
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
        {defaults.map(x=>(
          <Pill key={x} active={chosen.includes(x)} onClick={()=>toggle(x)}>{x}</Pill>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-sm text-center text-sm text-gray-600">You can skip this now and add later.</p>
      <div className="mx-auto mt-6 max-w-sm">
        <PrimaryCTA onClick={()=>{ setOnboarding('done'); nav('/onboarding/summary') }}>Finish</PrimaryCTA>
      </div>
      <div className="mt-2">
        <LinkCTA onClick={()=>nav('/dashboard')}>Skip</LinkCTA>
      </div>
    </OBShell>
  )
}
