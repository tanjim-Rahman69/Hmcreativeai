import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV } from './data/site'
import { goTo } from './shared'
import logoUrl from './assets/logo.png'

export default function Nav() {
  const [active, setActive] = useState(''), [open, setOpen] = useState(false), [solid, setSolid] = useState(false)
  useEffect(() => {
    const ids = ['work', 'services', 'vision', 'team', 'contact']; let raf = 0
    const tick = () => {
      raf = 0; setSolid(window.scrollY > 40)
      let cur = ''; for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) cur = id }
      setActive(cur === 'team' ? 'vision' : cur)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    window.addEventListener('scroll', on, { passive: true }); tick()
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  const go = (id: string) => { setOpen(false); setTimeout(() => goTo(id), open ? 250 : 0) }
  return (
    <>
      <motion.nav initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 md:px-10" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Top"><img src={logoUrl} alt="HM Creative AI" className="h-9 w-auto" style={{ filter: 'brightness(0) invert(1)' }} /></button>
        <div className={'absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border p-1.5 transition-colors duration-500 md:flex ' + (solid ? 'border-white/20 bg-[#1d0309]/70' : 'border-white/10 bg-white/[.06]')}>
          {NAV.map((l) => (
            <button key={l.id} onClick={() => go(l.id)} className="relative rounded-full px-4 py-2 text-[13px] font-medium text-white/70 transition-colors hover:text-white">
              {active === l.id && <motion.span layoutId="navpill" className="absolute inset-0 rounded-full bg-white/[.16]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className={'relative ' + (active === l.id ? 'text-white' : '')}>{l.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => go('contact')} className="hidden rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#ee0039] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,.35)] sm:block">Start a project</button>
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 md:hidden">
            <span className="relative block h-3 w-4"><span className={'absolute left-0 h-[2px] w-4 bg-white transition-all ' + (open ? 'top-[5px] rotate-45' : 'top-0')} /><span className={'absolute left-0 top-[10px] h-[2px] w-4 bg-white transition-all ' + (open ? 'top-[5px] -rotate-45' : '')} /></span>
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-[#1d0309]/95 md:hidden">
            {[...NAV, { id: 'contact', label: 'Start a project' }].map((l, i) => (
              <motion.button key={l.label} onClick={() => go(l.id)} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="hv text-3xl">{l.label}</motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
