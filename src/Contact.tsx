import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES } from './data/services'
import { SITE } from './data/site'
import { Reveal, Rise, glass, glassBg } from './ui'
import fb from './assets/social/facebook.png'
import ig from './assets/social/instagram.png'
import tt from './assets/social/tiktok.png'

const ICON: Record<string, string> = { facebook: fb, instagram: ig, tiktok: tt }
const field = 'w-full rounded-xl border border-white/15 bg-white/[.07] px-4 py-3 text-[14px] text-white outline-none transition placeholder:text-white/40 focus:border-white/50 focus:bg-white/[.12]'

export default function Contact() {
  const [sel, setSel] = useState<string[]>([]), [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  useEffect(() => { const f = (e: Event) => setSel((s) => { const t = (e as CustomEvent<string>).detail; return s.includes(t) ? s : [...s, t] }); window.addEventListener('hm:select', f); return () => window.removeEventListener('hm:select', f) }, [])
  const toggle = (t: string) => setSel((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget); setState('sending')
    const body = new URLSearchParams({ 'form-name': 'inquiry', name: String(f.get('name')), contact: String(f.get('contact')), services: sel.join(', '), message: String(f.get('message') || '') })
    try { const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() }); setState(r.ok ? 'done' : 'error') } catch { setState('error') }
  }
  const socials = Object.entries(SITE.social).filter(([, u]) => u)
  return (
    <section id="contact" className="relative z-10 flex min-h-screen flex-col justify-center px-5 pb-10 pt-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Reveal text="Let's build *your growth*" className="hv hv-shadow text-[clamp(2rem,4.6vw,4rem)]" />
          <Rise delay={0.15} className="mt-6 max-w-md text-[15px] leading-relaxed text-white/70">Tell us what you need. Pick the services you're interested in and we'll come back with a plan.</Rise>
          <Rise delay={0.25} className="mt-8 space-y-4 text-[15px]">
            {SITE.phones.map((p) => <a key={p.href} href={p.href} className="group flex w-fit items-center gap-3 transition hover:translate-x-1"><span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10">☎</span><span className="font-semibold">{p.label}</span></a>)}
            <a href={'mailto:' + SITE.email} className="group flex w-fit items-center gap-3 transition hover:translate-x-1"><span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10">✉</span><span className="font-semibold">{SITE.email}</span></a>
            {socials.length > 0 && <div className="flex gap-3 pt-2">{socials.map(([k, u]) => <a key={k} href={u} target="_blank" rel="noreferrer" aria-label={k} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:-translate-y-1 hover:bg-white/20"><img src={ICON[k]} alt="" className="h-5 w-5" /></a>)}</div>}
          </Rise>
        </div>
        <Rise delay={0.1}>
          <div className={glass + ' relative overflow-hidden p-6 sm:p-8'}>
            <div className="absolute inset-0 -z-10" style={glassBg} />
            <AnimatePresence mode="wait">
              {state === 'done' ? (
                <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid min-h-[340px] place-items-center text-center">
                  <div><div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white text-2xl text-[#ee0039]">✓</div><h3 className="hv text-xl">Thank you</h3><p className="mt-2 text-white/65">We got your brief and will reply soon.</p></div>
                </motion.div>
              ) : (
                <motion.form key="f" onSubmit={submit} name="inquiry" method="POST" data-netlify="true" className="space-y-4" exit={{ opacity: 0 }}>
                  <input type="hidden" name="form-name" value="inquiry" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input required name="name" placeholder="Your name" className={field} />
                    <input required name="contact" placeholder="Phone or email" className={field} />
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[.12em] text-white/60">What do you need?</p>
                    <div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => {
                      const on = sel.includes(c.title)
                      return <button type="button" key={c.id} onClick={() => toggle(c.title)} className={'rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition ' + (on ? 'border-white bg-white text-[#ee0039]' : 'border-white/20 bg-white/[.06] text-white/85 hover:bg-white/15')}>{c.title}</button>
                    })}</div>
                  </div>
                  <textarea name="message" rows={4} placeholder="Tell us about your business (optional)" className={field + ' resize-none'} />
                  <button disabled={state === 'sending'} className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-[#ee0039] shadow-[0_14px_34px_rgba(0,0,0,.35)] transition hover:-translate-y-0.5 disabled:opacity-60">{state === 'sending' ? 'Sending…' : 'Send brief →'}</button>
                  {state === 'error' && <p className="text-center text-[13px] text-[#FFC2D1]">Could not send right now. Please email {SITE.email} or call {SITE.phones[0].label}.</p>}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Rise>
      </div>
      <p className="mt-16 text-center text-[12px] text-white/45">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
    </section>
  )
}
