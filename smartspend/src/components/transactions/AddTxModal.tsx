import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Transaction as Tx, Mood, NWG } from '@/lib/types'
import { categories as CATEGORY_OBJECTS } from '@/lib/mock' // Category -> NWG

type Kind = Tx['type']

// Build a map Category -> NWG from your categories mock
const CATEGORY_TO_NWG: Record<string, NWG> = CATEGORY_OBJECTS.reduce((acc, c) => {
  acc[c.name] = c.nwg
  return acc
}, {} as Record<string, NWG>)

// Helpers for datetime-local (expenses only)
function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fromLocalInputValue(s: string) {
  return new Date(s) // local
}
function isLate(d: Date) {
  const h = d.getHours()
  return h >= 22 || h < 5
}

export default function AddTxModal({
  kind, onClose, onSave
}: {
  kind: Kind
  onClose: () => void
  onSave: (tx: Tx) => void
}) {
  const now = useMemo(() => new Date(), [])
  const [occurLocal, setOccurLocal] = useState<string>(toLocalInputValue(now)) // used only for expenses

  // Initialize state: income has no late-night/time logic
  const [state, setState] = useState<Tx>({
    id: crypto.randomUUID(),
    type: kind,
    amount: 0,
    occurred_at: now.toISOString(),      // always stored as ISO
    merchant: '',
    category: kind === 'income' ? 'Income' : 'Dining',
    nwg: kind === 'income' ? null : 'Want',
    late_night: kind === 'income' ? false : isLate(now),
    mood: 'neutral',
    note: '',
  })
  const [err, setErr] = useState('')
  const [addMore, setAddMore] = useState(false)

  // Close on ESC
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  // Keep occurred_at + late-night in sync ONLY FOR EXPENSE
  useEffect(() => {
    if (state.type !== 'expense') return
    const d = fromLocalInputValue(occurLocal)
    setState(s => ({ ...s, occurred_at: d.toISOString(), late_night: isLate(d) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occurLocal])

  // Auto N/W/G from category for expenses; income stays null
  useEffect(() => {
    setState(s => {
      if (s.type === 'income') return { ...s, nwg: null }
      const mapped = CATEGORY_TO_NWG[s.category] ?? s.nwg ?? 'Want'
      return { ...s, nwg: mapped }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.category, state.type])

  const canSubmit =
    state.amount > 0 && (state.type === 'income' || !!state.merchant.trim())

  const save = () => {
    if (state.type === 'expense' && !state.merchant.trim()) {
      setErr('Merchant is required.')
      return
    }
    if (!state.amount || state.amount <= 0) {
      setErr('Amount must be greater than 0.')
      return
    }
    setErr('')

    // For income, ensure late_night is false and occurred_at stays as initial (no time calc)
    const toSave: Tx = state.type === 'income'
      ? { ...state, late_night: false }
      : state

    onSave(toSave)

    if (addMore) {
      const next = new Date()
      setOccurLocal(toLocalInputValue(next))
      setState(s => ({
        ...s,
        id: crypto.randomUUID(),
        amount: 0,
        merchant: s.type === 'income' ? '' : '',
        occurred_at: next.toISOString(),
        late_night: s.type === 'income' ? false : isLate(next),
        note: '',
      }))
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add {kind === 'expense' ? 'Expense' : 'Income'}</h3>
          <button onClick={onClose} className="rounded-xl px-2 py-1 text-sm hover:bg-gray-100" aria-label="Close modal">Close</button>
        </div>

        {err && <div className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

        <div className="grid gap-3">
          <div className={`grid ${kind === 'expense' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            <Input
              label="Amount"
              type="number"
              inputMode="decimal"
              value={state.amount}
              onChange={(e) => setState(s => ({ ...s, amount: Number(e.target.value) }))}
            />
            {kind === 'expense' && (
              <Input
                label="Date & time"
                type="datetime-local"
                value={occurLocal}
                onChange={(e) => setOccurLocal(e.target.value)}
              />
            )}
          </div>

          {kind === 'expense' && (
            <Input
              label="Merchant"
              value={state.merchant}
              onChange={(e) => setState(s => ({ ...s, merchant: e.target.value }))}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              value={state.category}
              onChange={(e) => setState(s => ({ ...s, category: e.target.value }))}
            />
            <Select
              label="N/W/G"
              value={state.nwg ?? 'Want'}
              onChange={(e) => setState(s => ({ ...s, nwg: (e.target.value as NWG) }))}
              disabled={kind === 'income'}
            >
              <option value="Need">Need</option>
              <option value="Want">Want</option>
              <option value="Guilt">Guilt</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Mood"
              value={state.mood ?? 'neutral'}
              onChange={(e) => setState(s => ({ ...s, mood: e.target.value as Mood }))}
            >
              <option value="happy">happy</option>
              <option value="neutral">neutral</option>
              <option value="impulse">impulse</option>
              <option value="stressed">stressed</option>
            </Select>

            {/* Late-night only matters for expenses; hide for income */}
            {kind === 'expense' ? (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={state.late_night}
                  onChange={(e) => setState(s => ({ ...s, late_night: e.target.checked }))}
                />
                Late-night spend
              </label>
            ) : (
              <div className="text-sm text-gray-500 self-end">No time/late-night for income</div>
            )}
          </div>

          <Input
            label="Note"
            value={state.note ?? ''}
            onChange={(e) => setState(s => ({ ...s, note: e.target.value }))}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={addMore} onChange={(e) => setAddMore(e.target.checked)} />
            Save & add another
          </label>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={save} className="btn-primary" disabled={!canSubmit}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
