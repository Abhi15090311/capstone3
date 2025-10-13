export default function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="h-2 w-full rounded-full bg-neutral-200/70">
      <div className="h-2 rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  )
}
