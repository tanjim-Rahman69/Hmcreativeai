import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from './data/services'
import { L, goTo } from './shared'
import { EASE } from './ui'

const idFromHash = () => window.location.hash.match(/^#\/(.+)$/)?.[1] ?? null

/* Full-screen detail view for a service category. Route: #/<category-id>. Content comes only from data/services.ts (the Excel sheet). */
export default function ServiceDetail() {
  const [id, setId] = useState<string | null>(idFromHash)
  useEffect(() => { const f = () => setId(idFromHash()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f) }, [])
  const k = CATEGORIES.findIndex((c) => c.id === id), cat = CATEGORIES[k]
  const close = () => { history.replaceState(null, '', window.location.pathname + window.location.search); setId(null) }
  useEffect(() => {
    if (!cat) return
    L.lenis?.stop(); document.documentElement.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('keydown', esc); document.documentElement.style.overflow = ''; L.lenis?.start() }
  }, [cat])
  const go = (n: number) => { window.location.hash = '#/' + CATEGORIES[(n + CATEGORIES.length) % CATEGORIES.length].id }
  const pick = () => { window.dispatchEvent(new CustomEvent('hm:select', { detail: cat.title })); close(); setTimeout(() => goTo('contact'), 60) }
  return (
    <AnimatePresence>
      {cat && (
        <motion.div key="sd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain" data-lenis-prevent role="dialog" aria-modal="true" aria-label={cat.title}
          style={{ background: `radial-gradient(70% 60% at 85% 0%,${cat.accent}55,transparent 60%),linear-gradient(160deg,#2c0814 0%,#17030a 55%,#0b0105 100%)` }}>
          <motion.div key={cat.id} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}
            className="mx-auto grid min-h-full w-full max-w-6xl gap-10 px-5 pb-28 pt-24 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:pt-28">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="text-[clamp(4rem,10vw,8rem)] font-extrabold leading-none" style={{ fontFamily: 'Montserrat', WebkitTextStroke: `2px ${cat.accent}`, color: 'transparent' }}>{cat.no}</div>
              <h2 className="hv hv-shadow mt-4 text-[clamp(1.7rem,3.6vw,3rem)]">{cat.title}</h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">{cat.goal}</p>
              <div className="mt-6 h-[3px] w-24 rounded-full" style={{ background: cat.accent }} />
              <div className="mt-9 flex flex-wrap gap-3">
                <button onClick={pick} className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#ee0039] shadow-[0_14px_34px_rgba(0,0,0,.35)] transition hover:-translate-y-0.5">Get this service →</button>
                <button onClick={close} className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold transition hover:bg-white/20">Back to all</button>
              </div>
            </div>
            <ol className="space-y-3.5">
              {cat.services.map((s, i) => (
                <motion.li key={s.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: EASE }}
                  className="group flex gap-5 rounded-3xl border border-white/[.12] bg-white/[.05] p-5 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/[.09] sm:p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: cat.accent }}>{i + 1}</span>
                  <div><h3 className="text-[1.05rem] font-bold">{s.name}</h3><p className="mt-1.5 text-[14px] leading-relaxed text-white/65">{s.deliverables}</p></div>
                </motion.li>
              ))}
            </ol>
          </motion.div>
          <button onClick={close} aria-label="Close" className="fixed right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/30 text-lg transition hover:bg-white/20">✕</button>
          <div className="fixed inset-x-0 bottom-5 z-10 flex justify-center gap-3">
            <button onClick={() => go(k - 1)} aria-label="Previous service" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/40 transition hover:bg-white/20">←</button>
            <span className="grid place-items-center rounded-full border border-white/15 bg-black/40 px-4 text-xs text-white/70">{cat.no} / {String(CATEGORIES.length).padStart(2, '0')}</span>
            <button onClick={() => go(k + 1)} aria-label="Next service" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/40 transition hover:bg-white/20">→</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
