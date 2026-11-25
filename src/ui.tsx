import { useRef, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

export const EASE = [0.16, 1, 0.3, 1] as const

/* Word-by-word mask reveal (rise + blur→sharp). *accent* words are soft pink. */
export function Reveal({ text, className = '', delay = 0, as: Tag = 'h2' }: { text: string; className?: string; delay?: number; as?: 'h1' | 'h2' | 'h3' | 'p' }) {
  const ref = useRef<HTMLElement>(null), on = useInView(ref, { once: false, amount: 0.6 })
  let n = 0
  const words = text.split(/(\*[^*]+\*)/).filter(Boolean).flatMap((p) => {
    const accent = p.startsWith('*'); return p.replace(/\*/g, '').split(' ').filter(Boolean).map((w) => ({ w, accent, i: n++ }))
  })
  return (
    <Tag ref={ref as never} className={className}>
      {words.map(({ w, accent, i }) => (
        <span key={i} className="mr-[0.24em] inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] pt-[0.1em] -mt-[0.1em] align-top">
          <motion.span className={'inline-block ' + (accent ? 'text-[#FFC2D1]' : '')} initial={{ y: '115%', opacity: 0, filter: 'blur(8px)' }}
            animate={on ? { y: '0%', opacity: 1, filter: 'blur(0px)' } : { y: '115%', opacity: 0, filter: 'blur(8px)' }}
            transition={on ? { duration: 0.9, delay: delay + i * 0.06, ease: EASE } : { duration: 0.3 }}>{w}</motion.span>
        </span>
      ))}
    </Tag>
  )
}

export function Rise({ children, delay = 0, className = '', y = 40 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.25 }} transition={{ duration: 1, delay, ease: EASE }}>{children}</motion.div>
}

/* Pointer tilt + moving specular glare (no re-render: CSS variables only). */
export function Tilt({ children, className = '', max = 9 }: { children: ReactNode; className?: string; max?: number }) {
  const r = useRef<HTMLDivElement>(null)
  const move = (e: React.PointerEvent) => {
    const el = r.current; if (!el) return
    const b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height, s = el.style
    s.setProperty('--rx', `${(0.5 - y) * max}deg`); s.setProperty('--ry', `${(x - 0.5) * max * 1.2}deg`); s.setProperty('--mx', `${x * 100}%`); s.setProperty('--my', `${y * 100}%`)
  }
  const leave = () => { const s = r.current?.style; if (!s) return; s.setProperty('--rx', '0deg'); s.setProperty('--ry', '0deg'); s.setProperty('--my', '-30%') }
  return (
    <div ref={r} onPointerMove={move} onPointerLeave={leave} className={'relative transition-transform duration-300 ease-out ' + className}
      style={{ transform: 'perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))', willChange: 'transform' }}>
      {children}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: 'radial-gradient(380px circle at var(--mx,50%) var(--my,-30%),rgba(255,255,255,.16),transparent 45%)' }} />
    </div>
  )
}

export const glass = 'rounded-[28px] border border-white/[.14] shadow-[0_30px_70px_-25px_rgba(0,0,0,.65),inset_0_1px_0_rgba(255,255,255,.3)]'
export const glassBg = { background: 'linear-gradient(165deg,rgba(255,255,255,.08),transparent 40%),linear-gradient(180deg,#2c0814 0%,#17030a 55%,#0f0206 100%)' }
