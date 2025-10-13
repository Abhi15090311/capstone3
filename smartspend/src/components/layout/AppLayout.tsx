import { useState, type ReactNode } from 'react'
import SidebarNav from '@/components/layout/SidebarNav'
import Topbar from '@/components/layout/Topbar'

export default function AppLayout({ children }: { children: ReactNode }) {
  // one state drives both mobile drawer and desktop collapse
  const [open, setOpen] = useState(true)
  const toggle = () => setOpen(o => !o)
  const closeMobile = () => setOpen(false)
  const openMobile = () => setOpen(true)

  return (
    <div className="min-h-screen bg-cream text-gray-900">
      {/* Top bar (hamburger always visible) */}
      <Topbar onMenuToggle={toggle} />

      {/* Mobile drawer backdrop */}
      {/* Shown only on mobile; on desktop we don't use a backdrop */}
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile drawer panel (off-canvas) */}
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-[260px] overflow-y-auto rounded-r-2xl bg-shell/95 p-3 shadow-xl backdrop-blur transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <SidebarNav onNavigate={closeMobile} />
      </aside>

      {/* Desktop layout as grid; first column width toggles between 240px and 0 */}
      <div className="mx-auto max-w-[1440px] px-3 sm:px-4">
        <div
          className={`md:grid md:gap-4 md:pt-4 ${
            open ? 'md:grid-cols-[240px_1fr]' : 'md:grid-cols-[0px_1fr]'
          }`}
        >
          {/* Desktop sidebar column (kept in flow so content shifts nicely) */}
          <aside className="hidden md:block">
            <div
              className={`sticky top-20 overflow-hidden rounded-2xl bg-shell/80 p-3 shadow-navbar backdrop-blur transition-[padding,opacity] duration-200 ${
                open ? 'max-h-[calc(100vh-100px)] opacity-100' : 'max-h-0 p-0 opacity-0'
              }`}
              aria-hidden={!open}
            >
              {/* When collapsed, we still mount but visually hide & remove padding */}
              <SidebarNav />
            </div>
          </aside>

          {/* Main content */}
          <main className="pt-2 md:pt-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
