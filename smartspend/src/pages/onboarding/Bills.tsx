import OBShell from '@/components/onboarding/OBShell'
import OBProgress from '@/components/onboarding/OBProgress'
import Pill from '@/components/ui/Pill'
import { PrimaryCTA, LinkCTA } from '@/components/ui/CTA'
import { setOnboarding } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

// Default main bill types
const defaults = ['Rent', 'Phone', 'Internet', 'Subscriptions', 'Others']
// Dropdown options for 'Others'
const otherOptions = ['Groceries', 'Insurance', 'Tuition', 'Medical', 'Childcare']

// Type for custom bills
type CustomBill = {
  label: string
  amount: string
}

export default function BillsOB() {
  const [chosen, setChosen] = useState<string[]>([])
  const [otherChosen, setOtherChosen] = useState<string[]>([])
  const [customBills, setCustomBills] = useState<CustomBill[]>([])
  const [customLabel, setCustomLabel] = useState('')
  const [customAmount, setCustomAmount] = useState('')

  const nav = useNavigate()

  const toggle = (x: string) =>
    setChosen(s => s.includes(x) ? s.filter(i => i !== x) : [...s, x])

  const toggleOther = (x: string) =>
    setOtherChosen(s => s.includes(x) ? s.filter(i => i !== x) : [...s, x])

  function handleAddCustom() {
    if (!customLabel.trim() || !customAmount.trim()) return
    setCustomBills(bills => [
      ...bills,
      { label: customLabel.trim(), amount: customAmount }
    ])
    setCustomLabel('')
    setCustomAmount('')
  }

  function handleRemoveCustom(label: string) {
    setCustomBills(bills => bills.filter(b => b.label !== label))
  }

  function handleFinish() {
  const originalBalance = Number(localStorage.getItem('smartspend.original_balance')) || 0
  const currentBalanceStr = localStorage.getItem('currentBalance')
  const currentBalance = currentBalanceStr ? Number(currentBalanceStr) : originalBalance

  // Count all selected + otherChosen if Others is selected
  const selectedCount = chosen.filter(x => x !== 'Others').length +
    (chosen.includes('Others') ? otherChosen.length + customBills.length : 0)
  const estimatedTotal = selectedCount * 100
  const newBalance = Math.max(currentBalance - estimatedTotal, 0)
  localStorage.setItem('currentBalance', String(newBalance))
  setOnboarding('done')
  nav('/dashboard') // <-- send to dashboard, not onboarding/summary
}


  return (
    <OBShell>
      <OBProgress step={3} />
      <h1 className="mb-5 text-center text-3xl font-bold leading-tight md:text-4xl">
        Any regular bills we should plan for?
      </h1>

      {/* Bill options */}
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
        {defaults.map(x => (
          <Pill key={x} active={chosen.includes(x)} onClick={() => toggle(x)}>{x}</Pill>
        ))}
      </div>

      {/* Others Sub-dropdown + custom input */}
      {chosen.includes('Others') && (
        <div className="mx-auto mt-3 max-w-sm flex flex-col items-center">
          <div className="mb-2 text-sm text-gray-700">Select additional types:</div>
          <div className="grid grid-cols-2 gap-2 w-full mb-2">
            {otherOptions.map(opt => (
              <Pill key={opt} active={otherChosen.includes(opt)}
                onClick={() => toggleOther(opt)}>{opt}</Pill>
            ))}
          </div>
          {/* Custom entry section */}
          <div className="w-full flex flex-col gap-1 mb-2">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded border px-2 py-1 text-sm"
                type="text"
                placeholder="Other bill type"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
              />
              <input
                className="w-24 rounded border px-2 py-1 text-sm"
                type="number"
                min={0}
                placeholder="Amount"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
              />
              <button
                className="px-3 py-1 rounded bg-orange-200 hover:bg-orange-300 text-orange-900 font-medium text-sm"
                type="button"
                onClick={handleAddCustom}
              >
                Add
              </button>
            </div>
            {/* List custom entries as tags, allow removal */}
            <div className="flex flex-wrap gap-2 mt-1">
              {customBills.map(bill => (
                <span key={bill.label} className="inline-flex items-center rounded bg-orange-50 border border-orange-200 px-2 py-1 text-sm text-orange-900">
                  {bill.label} (${bill.amount})
                  <button className="ml-1 text-orange-700 focus:outline-none"
                    onClick={() => handleRemoveCustom(bill.label)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="mx-auto mt-4 max-w-sm text-center text-sm text-gray-600">
        You can skip this now and add later.
      </p>
      <div className="mx-auto mt-6 max-w-sm">
        <PrimaryCTA onClick={handleFinish}>Finish</PrimaryCTA>
      </div>
      <div className="mt-2">
        <LinkCTA onClick={() => nav('/dashboard')}>Skip</LinkCTA>
      </div>
    </OBShell>
  )
}
