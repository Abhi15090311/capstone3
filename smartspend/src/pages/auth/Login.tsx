import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '@/components/layout/AuthShell'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getOnboarding, setUser } from '@/lib/auth'

// Make sure this matches your public image filename
const dashboardIllustration = '/logo1.jpg'

export default function Login() {
  const nav = useNavigate()
  const loc = useLocation()
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
    if (onb && onb !== 'done' && onb !== 'none')
      return nav(`/onboarding/${onb==='balance'?'balance':onb==='pay'?'pay-cadence':'bills'}`, { replace:true })
    nav(back || '/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto px-4 py-10">
        {/* Left -- Illustration + Welcome */}
        <div className="flex-1 flex flex-col items-center pr-0 md:pr-10 mb-8 md:mb-0">
          <div className="flex items-center mb-3">
            <img src="/favicon.svg" alt="SmartSpend" className="h-10 w-10 mr-2" />
            <span className="text-xl font-semibold">SmartSpend</span>
          </div>
          <h2 className="mb-2 text-3xl md:text-4xl font-bold text-left w-full">Welcome back <span role="img" aria-label="wave">👋</span></h2>
          <p className="mb-5 text-gray-600 text-left w-full">
            Track your balance, predict days left, and coach smarter micro-spends.
          </p>
          <img
            src={dashboardIllustration}
            alt="Financial dashboard, charts, and piggy bank"
            className="rounded-xl bg-white w-full max-w-2xl shadow-sm"
            draggable={false}
          />
        </div>

        {/* Right -- Login form */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="mb-1 text-xl font-semibold">Log in</h1>
          <p className="mb-4 text-sm text-gray-600">Welcome back to SmartSpend.</p>
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
        </div>
      </div>
    </div>
  )
}
