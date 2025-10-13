import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '@/components/layout/AuthShell'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { setOnboarding, setUser } from '@/lib/auth'

export default function Signup() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('sandeep@example.com')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [err, setErr] = useState<string>('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')

    if (!name.trim()) return setErr('Please enter your name.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Please enter a valid email address.')
    if (password.length < 6) return setErr('Password must be at least 6 characters.')
    if (password !== confirm) return setErr('Passwords do not match.')

    setUser({ id: 'u1', name, email })
    setOnboarding('balance')
    nav('/onboarding/balance', { replace: true })
  }

  return (
    <AuthShell>
      <h1 className="mb-1 text-xl font-semibold">Create account</h1>
      <p className="mb-4 text-sm text-gray-600">Start with a quick setup.</p>

      {err && (
        <div
          role="alert"
          className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {err}
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        {/* Password Field */}
        <div className="relative">
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="At least 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-pressed={showPw}
            className="absolute right-3 top-8 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-pressed={showConfirm}
            className="absolute right-3 top-8 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {showConfirm ? 'Hide' : 'Show'}
          </button>
        </div>

        <Button type="submit">Continue</Button>
      </form>

      <p className="mt-3 text-center text-xs text-gray-500">
        No credit card needed • Takes less than 1 minute
      </p>

      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 underline-offset-2 hover:underline">
          Log in
        </Link>
      </div>
    </AuthShell>
  )
}
