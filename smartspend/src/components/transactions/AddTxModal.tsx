import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Transaction as Tx, Mood, NWG } from '@/lib/types'
import { categories as CATEGORY_OBJECTS } from '@/lib/mock'

type Kind = Tx['type']

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fromLocalInputValue(s: string) {
  return new Date(s)
}

const days = Array.from({ length: 30 }, (_, i) => String(i + 1))
const weekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const moodOptions: Mood[] = ['happy', 'neutral']

export default function AddTxModal({
  kind, onClose, onSave
}: {
  kind: Kind
  onClose: () => void
  onSave: (tx: Tx & { recurrence?: boolean, payDate?: string, payDay?: string }) => void
}) {
  const now = useMemo(() => new Date(), [])
  const [step, setStep] = useState<1|2|3|4|5|6|7>(1)
  const [amount, setAmount] = useState(0)
  const [nwg, setNWG] = useState<NWG | null>(null)
  const [recurrence, setRecurrence] = useState<'yes'|'no'|null>(null)
  const [payDate, setPayDate] = useState<string>('')
  const [payDay, setPayDay] = useState<string>('')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState('')
  const [mood, setMood] = useState<Mood>('neutral')
  const [showDateModal, setShowDateModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [err, setErr] = useState('')
  const [addMore, setAddMore] = useState(false)
  const [occurLocal, setOccurLocal] = useState<string>(toLocalInputValue(now))
  const [state, setState] = useState<Tx>({
    id: crypto.randomUUID(),
    type: kind,
    amount: 0,
    occurred_at: now.toISOString(),
    merchant: '',
    category: kind === 'income' ? 'Income' : '',
    nwg: kind === 'income' ? null : null,
    late_night: false,
    mood: 'neutral',
    note: '',
  })

  // Sync state for save
  useEffect(() => {
    setState((s) => ({
      ...s,
      amount,
      nwg: kind === 'income' ? null : nwg,
      merchant,
      category,
      mood,
    }))
  }, [amount, nwg, kind, merchant, category, mood])

  useEffect(() => {
    if (kind === 'income') {
      setState((s) => ({
        ...s,
        occurred_at: fromLocalInputValue(occurLocal).toISOString(),
      }))
    }
  }, [occurLocal, kind])

  // Open weekday modal after date for non-(need+yes)
  useEffect(() => {
    if (
      payDate &&
      ((step === 5 && !payDay && !showDayModal) ||
      (step === 4 && recurrence !== 'yes' && !payDay && !showDayModal))
    ) {
      setShowDayModal(true)
    }
  }, [payDate, step, payDay, showDayModal, recurrence])

  useEffect(() => {
    if (payDay && (step === 5 || step === 4)) {
      setStep(6)
    }
  }, [payDay, step])

  useEffect(() => {
    if (merchant.trim() && step === 6) {
      setStep(7)
    }
  }, [merchant, step])

  // NWG selection
  const handleNWG = (value: string) => {
    setNWG(value as NWG)
    if (value === 'Need') setStep(3)
    else setShowDateModal(true)
  }

  // Recurrence selection
  const handleRecurrence = (value: 'yes'|'no') => {
    setRecurrence(value)
    if (value === 'yes') {
      setShowDateModal(true)
      setStep(4)
    } else {
      setShowDateModal(true)
      setStep(5)
    }
  }

  // Date selection after recurrence YES (save immediately)
  const handleRecurringDayPicked = (d: string) => {
    setPayDate(d)
    setShowDateModal(false)
    onSave({
      ...state,
      amount,
      nwg,
      recurrence: true,
      payDate: d,
    })
    if (addMore) {
      setAmount(0); setNWG(null); setRecurrence(null); setPayDate('')
      setPayDay(''); setMerchant(''); setCategory(''); setMood('neutral')
      setStep(1)
    } else {
      onClose()
    }
  }

  // Date selection for normal flow
  const handleDayPicked = (d: string) => {
    setPayDate(d)
    setShowDateModal(false)
    setStep(5)
  }

  const handleWeekDayPicked = (d: string) => {
    setPayDay(d)
    setShowDayModal(false)
  }

  const handleNextMerchant = () => {
    if (merchant.trim()) {
      setStep(7)
      setErr('')
    } else {
      setErr('Enter merchant.')
    }
  }

  const handleSaveExpense = () => {
    if (!amount || amount <= 0) return setErr('Amount must be greater than 0.')
    if (!nwg) return setErr('Select Need, Want, or Guilt.')
    if (!payDate) return setErr('Select a date.')
    if (!payDay) return setErr('Select a weekday.')
    if (!merchant.trim()) return setErr('Enter merchant.')
    if (!category.trim()) return setErr('Enter category.')
    setErr('')
    onSave({
      ...state,
      amount,
      nwg: nwg,
      recurrence: nwg === 'Need' ? recurrence === 'yes' : undefined,
      payDate,
      payDay,
      merchant,
      category,
      mood,
    })
    if (addMore) {
      setAmount(0); setNWG(null); setRecurrence(null); setPayDate('')
      setPayDay(''); setMerchant(''); setCategory(''); setMood('neutral')
      setStep(1)
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-soft bg-white p-5 shadow-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Add {kind === 'expense' ? 'Expense' : 'Income'}
          </h3>
          <button onClick={onClose}
                  className="rounded-xl px-2 py-1 text-sm hover:bg-gray-100"
                  aria-label="Close modal">Close
          </button>
        </div>
        {err && (
          <div className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
        )}

        {kind === 'expense' ? (
          <div className="grid gap-3">
            {step === 1 && (
              <>
                <Input
                  label="Amount"
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  autoFocus
                />
                <button className="btn-primary mt-2"
                  disabled={amount <= 0}
                  onClick={() => amount > 0 ? setStep(2) : setErr("Amount must be greater than 0.")}
                >Next</button>
              </>
            )}
            {step === 2 && (
              <Select
                label="N/W/G"
                value={nwg || ''}
                onChange={e => handleNWG(e.target.value)}
                autoFocus
              >
                <option value="" disabled>Select Need / Want / Guilt</option>
                <option value="Need">Need</option>
                <option value="Want">Want</option>
                <option value="Guilt">Guilt</option>
              </Select>
            )}
            {step === 3 && nwg === 'Need' && (
              <div className="my-2">
                <div className="mb-3 text-sm">Does this expense recur?</div>
                <div className="flex gap-2">
                  <button
                    className={`btn ${recurrence === 'yes' ? 'bg-brand-500 text-white' : 'border border-soft bg-white'}`}
                    onClick={() => handleRecurrence('yes')}
                  >Yes</button>
                  <button
                    className={`btn ${recurrence === 'no' ? 'bg-brand-500 text-white' : 'border border-soft bg-white'}`}
                    onClick={() => handleRecurrence('no')}
                  >No</button>
                </div>
              </div>
            )}
            {step === 6 && (
              <>
                <Input label="Merchant"
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  autoFocus />
                <button
                  className="btn-primary mt-2"
                  onClick={handleNextMerchant}
                >Next</button>
              </>
            )}
            {step === 7 && (
              <>
                <Input label="Category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  autoFocus />
                <Select label="Mood"
                  value={mood}
                  onChange={e => setMood(e.target.value as Mood)}>
                  {moodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={addMore} onChange={e => setAddMore(e.target.checked)} />
                    Save & add another
                  </label>
                  <div className="flex items-center gap-2">
                    <button onClick={onClose} className="btn-ghost">Cancel</button>
                    <button onClick={handleSaveExpense} className="btn-primary">Save</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          // Income: amount only!
          <div className="grid gap-3">
            <Input
              label="Amount"
              type="number"
              inputMode="decimal"
              value={state.amount}
              onChange={e => setState(s => ({ ...s, amount: Number(e.target.value) }))}
              autoFocus
            />
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={addMore} onChange={e => setAddMore(e.target.checked)} />
                Save & add another
              </label>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="btn-ghost">Cancel</button>
                <button
                  onClick={() => {
                    if (state.amount && state.amount > 0) {
                      onSave({ ...state, amount: state.amount })
                      if (addMore) setState(s => ({
                        ...s,
                        id: crypto.randomUUID(),
                        amount: 0,
                      }))
                      else onClose()
                    } else {
                      setErr("Amount must be greater than 0.")
                    }
                  }}
                  className="btn-primary"
                  disabled={!state.amount || state.amount <= 0}
                >Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Date Modal - after recurrence yes save immediately after pick! */}
        {showDateModal && recurrence === 'yes' && step === 4 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-xs w-full">
              <h2 className="mb-3 font-semibold text-center">Select recurring date (1-30):</h2>
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                {days.map(d =>
                  <button key={d}
                    className={`p-2 rounded ${payDate === d ? 'bg-orange-300 text-white' : 'hover:bg-orange-100'}`}
                    onClick={() => handleRecurringDayPicked(d)}
                  >{d}</button>
                )}
              </div>
              <button className="mt-4 text-xs text-gray-500 hover:underline w-full"
                onClick={() => { setShowDateModal(false); setStep(1); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Date Modal - normal flow */}
        {showDateModal && (!recurrence || recurrence === 'no') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-xs w-full">
              <h2 className="mb-3 font-semibold text-center">Select pay date (1-30):</h2>
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                {days.map(d =>
                  <button key={d}
                    className={`p-2 rounded ${payDate === d ? 'bg-orange-300 text-white' : 'hover:bg-orange-100'}`}
                    onClick={() => handleDayPicked(d)}
                  >{d}</button>
                )}
              </div>
              <button className="mt-4 text-xs text-gray-500 hover:underline w-full"
                onClick={() => { setShowDateModal(false); setStep(1); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Weekday Modal for Expense flows */}
        {showDayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-xs w-full">
              <h2 className="mb-3 font-semibold text-center">Select day of week:</h2>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {weekDays.map(w =>
                  <button key={w}
                    className={`p-2 rounded ${payDay === w ? 'bg-brand-500 text-white' : 'hover:bg-orange-100'}`}
                    onClick={() => handleWeekDayPicked(w)}
                  >{w}</button>
                )}
              </div>
              <button className="mt-4 text-xs text-gray-500 hover:underline w-full"
                onClick={() => { setShowDayModal(false); setStep(1); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
