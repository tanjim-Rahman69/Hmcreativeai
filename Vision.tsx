import { motion } from 'framer-motion'
import { Reveal, Rise, Tilt, glass, glassBg, EASE } from './ui'
import { goTo } from './shared'

const Icon = ({ k }: { k: number }) => {
  const p = [
    <><path d="M12 3l2.2 5.3L20 10l-5.8 1.7L12 17l-2.2-5.3L4 10l5.8-1.7z" /><path d="M19 17l.8 1.9 1.9.8-1.9.8L19 22l-.8-1.9-1.9-.8 1.9-.8z" /></>,
    <><rect x="3" y="4" width="18" height="5" rx="1.5" /><rect x="3" y="11" width="18" height="5" rx="1.5" /><rect x="3" y="18" width="18" height="3" rx="1.5" /></>,
    <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
  ][k]
  return (
    <motion.svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: false }} transition={{ duration: 1.4, ease: EASE }}>{p}</motion.svg>
  )
}

const PILLARS = [
  { t: 'AI-powered', d: 'We use AI to move faster: sharper content, automated follow-ups and cleaner reporting, so your brand never waits on busywork.' },
  { t: 'One package', d: 'Social media, design, video, web, e-commerce growth and automation, handled by one connected team instead of six separate vendors.' },
  { t: 'Results first', d: 'Every post, ad and page is tied to a clear goal: more attention, more leads, and more customers walking through your door.' },
]

export default function Vision() {
  return (
    <section id="vision" className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-24 text-center">
      <Reveal text="Our *vision*" className="hv hv-shadow text-[clamp(2rem,5vw,4.4rem)]" />
      <Rise delay={0.2} className="mx-auto mt-6 max-w-2xl text-[clamp(.95rem,1.3vw,1.15rem)] leading-relaxed text-white/75">
        Business owners shouldn't have to chase every new platform. We build one connected growth system, so your brand shows up everywhere, consistently, while you focus on running the business.
      </Rise>
      <div className="relative mt-10 grid w-full max-w-6xl gap-5 md:grid-cols-3">
        <motion.div aria-hidden className="absolute left-[16%] right-[16%] top-[3.1rem] hidden h-px origin-left bg-gradient-to-r from-transparent via-white/40 to-transparent md:block"
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: false }} transition={{ duration: 1.6, ease: EASE }} />
        {PILLARS.map((p, i) => (
          <Rise key={p.t} delay={0.1 + i * 0.14}>
            <Tilt className={glass + ' h-full p-7 text-left'}>
              <div className="absolute inset-0 -z-10 rounded-[inherit]" style={glassBg} />
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10"><Icon k={i} /></div>
              <h3 className="hv text-[1.25rem]">{p.t}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/65">{p.d}</p>
            </Tilt>
          </Rise>
        ))}
      </div>
      <Rise delay={0.1} className="mt-12 flex flex-col items-center">
        <Reveal text="You grow. We handle *the rest.*" className="hv hv-shadow text-[clamp(1.5rem,3.4vw,3rem)]" />
        <button onClick={() => goTo('contact')} className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#ee0039] shadow-[0_14px_34px_rgba(0,0,0,.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,.4)]">Start a project →</button>
      </Rise>
    </section>
  )
}
