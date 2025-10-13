import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '@/components/layout/AuthShell'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getOnboarding, setUser } from '@/lib/auth'

export default function Login() {
  const nav = useNavigate(); const loc = useLocation()
  const [email, setEmail] = useState('sandeep@example.com')
  const [pw, setPw] = useState('password')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState<string>('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Please enter a valid email address.'); return }
    if (!pw) { setErr('Password is required.'); return }
    setUser({ id:'u1', email, name:'Sandeep' })
    const back = (loc.state as any)?.from?.pathname
    const onb = getOnboarding()
    if (onb && onb !== 'done' && onb !== 'none') return nav(`/onboarding/${onb==='balance'?'balance':onb==='pay'?'pay-cadence':'bills'}`, { replace:true })
    nav(back || '/dashboard', { replace: true })
  }

  return (
    <AuthShell>
      <h1 className="mb-1 text-xl font-semibold">Log in</h1>
      <p className="mb-4 text-sm text-gray-600">Welcome back to SmartSpend.</p>

      {/* live region for error */}
      <div role="alert" aria-live="polite" className="min-h-0">
        {err && <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} inputMode="email" />
        <div className="relative">
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={pw}
            onChange={e=>setPw(e.target.value)}
          />
          <button
            type="button"
            onClick={()=>setShowPw(s=>!s)}
            aria-pressed={showPw}
            className="absolute right-3 top-8 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        <Button type="submit">Log in</Button>
      </form>

      <p className="mt-3 text-center text-xs text-gray-500">Secure sign-in with encryption.</p>

      <div className="mt-4 text-center text-sm">
        No account? <Link to="/signup" className="text-brand-600 underline-offset-2 hover:underline">Sign up</Link>
      </div>
    </AuthShell>
  )
}
