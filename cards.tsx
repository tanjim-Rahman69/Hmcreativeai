import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { L, clamp } from './shared'
import { CATEGORIES, type Category } from './data/services'

const social = import.meta.glob<string>('./assets/social/*.webp', { eager: true, query: '?url', import: 'default' })
const logo = (n: string) => social[`./assets/social/${n}.webp`]
/* one bright palette per service: a = bright accent, b = mid, d1/d2 = deep body tones */
const PAL: Record<string, { a: string; b: string; d1: string; d2: string }> = {
  'digital-marketing': { a: '#ff4d6d', b: '#c3123f', d1: '#3a0716', d2: '#17030a' },
  'graphic-design': { a: '#b45cff', b: '#6a1fd0', d1: '#25103f', d2: '#0f0620' },
  'video-production': { a: '#ffae2e', b: '#e0620f', d1: '#3d1c06', d2: '#170a02' },
  'web-development': { a: '#35b0ff', b: '#1561d6', d1: '#0b2347', d2: '#050f22' },
  'ecommerce-growth': { a: '#2fe0a0', b: '#0b9a6b', d1: '#07352a', d2: '#031610' },
  'ai-automation': { a: '#ff5ce0', b: '#c01fa6', d1: '#3a0b36', d2: '#16041a' },
}
const SOFT = 'color-mix(in srgb,var(--a) 55%,#fff)', FADE = 'color-mix(in srgb,var(--a) 60%,transparent)'
/* depth layer: moves with the pointer on the front card only */
const Par = ({ d = 10, children }: { d?: number; children: ReactNode }) => <div className="par pointer-events-none absolute inset-0" style={{ '--d': d } as React.CSSProperties}>{children}</div>
const A = (n: string, d = 0, dur = 5) => ({ animation: `${n} ${dur}s ${d}s infinite` })
const Img = ({ n, style, size = 36, d = 16 }: { n: string; style: React.CSSProperties; size?: number; d?: number }) => (
  <Par d={d}><img src={logo(n)} alt="" width={size} height={size} loading="lazy" decoding="async" className="absolute rounded-xl shadow-[0_8px_20px_rgba(0,0,0,.4)]" style={{ width: size, height: size, ...style }} /></Par>
)

/* ───── animated mini-scenes (one per solution) ───── */
const V1 = () => (
  <div className="absolute inset-0">
    <svg viewBox="0 0 300 170" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--a)', stopOpacity: 0.7 }} /><stop offset="1" style={{ stopColor: 'var(--a)', stopOpacity: 0 }} /></linearGradient></defs>
      {[45, 85, 125].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="rgba(255,255,255,.08)" />)}
      <path d="M0 140 C40 130 60 100 100 105 S160 70 200 58 S260 30 300 18 V170 H0Z" fill="url(#gm)" style={A('fadeloop', 0, 4.5)} />
      <path d="M0 140 C40 130 60 100 100 105 S160 70 200 58 S260 30 300 18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" style={A('draw', 0, 4.5)} />
    </svg>
    <Img n="facebook" style={{ left: '8%', top: '14%', ...A('floaty', 0, 4) }} d={18} />
    <Img n="instagram" style={{ left: '30%', top: '30%', ...A('floaty', 0.6, 4.4) }} size={32} d={12} />
    <Img n="google" style={{ right: '9%', top: '27%', background: '#fff', padding: 5, ...A('floaty', 1.1, 4.2) }} size={34} d={22} />
    <Img n="tiktok" style={{ right: '32%', top: '48%', ...A('floaty', 1.6, 4.8) }} size={30} d={14} />
    <Par d={6}><div className="absolute bottom-3 left-4 flex items-end gap-1.5">
      {[40, 65, 50, 80, 62, 92].map((h, i) => <i key={i} className="w-2 origin-bottom rounded-sm bg-white/80" style={{ height: h * 0.32, ...A('grow', i * 0.2, 3) }} />)}
    </div></Par>
  </div>
)

const V2 = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.35) 1px,transparent 1px)', backgroundSize: '16px 16px' }} />
    <svg viewBox="0 0 300 170" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <path d="M40 125 C80 20 140 20 150 92 S230 165 268 50" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray="1" style={A('draw', 0, 4.5)} />
      {[[40, 125], [150, 92], [268, 50]].map(([x, y], i) => <rect key={i} x={x - 4} y={y - 4} width="8" height="8" stroke="#fff" strokeWidth="1.5" style={{ fill: 'var(--a)', transformBox: 'fill-box', transformOrigin: 'center', ...A('pop', i * 0.7, 4.5) }} />)}
    </svg>
    <Par d={14}><div className="tight absolute left-5 top-3 text-[64px] leading-none text-white/90" style={A('floaty', 0, 5)}>Aa</div></Par>
    <Par d={20}><div className="absolute bottom-4 right-4 flex gap-2">
      {['var(--d1)', 'var(--b)', 'var(--a)', SOFT].map((c, i) => <i key={i} className="h-8 w-8 rounded-full border border-white/30 shadow-lg" style={{ background: c, ...A('floaty', i * 0.3, 3.6) }} />)}
    </div></Par>
  </div>
)

const V3 = () => (
  <div className="absolute inset-0 p-4">
    <div className="par h-[54%]" style={{ '--d': 6 } as React.CSSProperties}><div className="relative h-full overflow-hidden rounded-xl border border-white/20" style={{ background: 'linear-gradient(135deg,var(--a),var(--d1))' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 90% at 72% 25%,rgba(255,255,255,.5),transparent)', ...A('fadeloop', 0, 5) }} />
      <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90"><i className="ml-0.5 border-y-[7px] border-l-[11px] border-y-transparent" style={{ borderLeftColor: 'var(--d1)' }} /></div>
      <span className="absolute bottom-1.5 right-2 rounded bg-black/50 px-1.5 text-[8px] font-semibold tracking-wide">9:16 · 4K</span>
    </div></div>
    <div className="relative mt-3 space-y-1.5">
      {[[0, 38, 'var(--a)'], [30, 40, SOFT], [6, 24, 'var(--b)']].map(([l, w, c], r) => (
        <div key={r} className="relative h-4 rounded bg-white/10">
          <i className="absolute top-0.5 bottom-0.5 rounded-sm" style={{ left: `${l}%`, width: `${w}%`, background: c as string, opacity: 0.9 }} />
          <i className="absolute top-0.5 bottom-0.5 rounded-sm" style={{ left: `${Number(l) + Number(w) + 8}%`, width: '20%', background: c as string, opacity: 0.45 }} />
        </div>
      ))}
      <div className="pointer-events-none absolute -bottom-1 -top-1 left-[2%] w-[94%]" style={{ background: 'linear-gradient(#fff,#fff) left/1px 100% no-repeat', animation: 'playhead 5s linear infinite' }} />
    </div>
    <div className="mt-2 flex h-5 items-center gap-[3px]">{Array.from({ length: 36 }, (_, i) => <i key={i} className="w-[3px] origin-center rounded-full bg-white/70" style={{ height: '100%', ...A('grow', (i % 9) * 0.12, 1.2 + (i % 5) * 0.15) }} />)}</div>
  </div>
)

const V4 = () => (
  <div className="absolute inset-0 p-4">
    <Par d={7}><div className="absolute inset-4 overflow-hidden rounded-xl border border-white/20 shadow-2xl" style={{ background: 'color-mix(in srgb,var(--d2) 92%,transparent)' }}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <i key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />)}
        <span className="ml-2 flex-1 rounded-full bg-white/10 px-2 text-[8px] leading-4 text-white/55">hmcreative.ai</span>
      </div>
      <div className="p-3">
        {[72, 48].map((w, i) => <div key={i} className="mb-1.5 h-3 rounded bg-white/90" style={{ width: `${w}%`, ...A('slidein', i * 0.25, 6) }} />)}
        <div className="h-2 w-3/4 rounded bg-white/30" style={A('slidein', 0.5, 6)} />
        <div className="mt-3 inline-block rounded-full px-3 py-1 text-[8px] font-bold text-[#06121f]" style={{ background: 'var(--a)', ...A('slidein', 0.8, 6) }}>Get started</div>
        <div className="mt-3 grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--a),var(--b))', opacity: 0.8, ...A('slidein', 1.1 + i * 0.25, 6) }} />)}</div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" className="absolute left-6 top-14" style={{ animation: 'cursor 6s ease-in-out infinite' }}><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#111" strokeWidth="1.5" /></svg>
    </div></Par>
    <Par d={20}><div className="absolute bottom-6 right-6 rounded-lg px-2.5 py-1 text-xs font-bold text-[#06121f] shadow-lg" style={{ background: 'var(--a)', ...A('floaty', 0, 3.4) }}>{'</>'}</div></Par>
  </div>
)

const V5 = () => (
  <div className="absolute inset-0 p-4">
    <div className="par" style={{ '--d': 9 } as React.CSSProperties}><div className="grid grid-cols-3 gap-2.5">
      {['var(--a)', SOFT, 'var(--b)'].map((c, i) => (
        <div key={i} className="rounded-xl border border-white/20 bg-white/10 p-2" style={A('floaty', i * 0.4, 4)}>
          <div className="h-14 rounded-lg" style={{ background: `linear-gradient(135deg,${c},rgba(255,255,255,.2))` }} />
          <div className="mt-2 h-1.5 w-4/5 rounded bg-white/60" /><div className="mt-1 h-1.5 w-1/2 rounded bg-white/30" />
        </div>
      ))}
    </div></div>
    <Par d={22}><div className="absolute right-5 top-11 grid h-8 w-8 place-items-center rounded-full" style={{ background: 'var(--a)', boxShadow: '0 0 18px var(--a)', ...A('bounce', 0, 2.4) }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06150f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h3l2 12h10l2-8H7" /><circle cx="10" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>
    </div></Par>
    <div className="par mt-4 space-y-1.5" style={{ '--d': 5 } as React.CSSProperties}>
      {[100, 72, 44].map((w, i) => <div key={w} className="h-3 origin-left rounded-r" style={{ width: `${w}%`, background: 'linear-gradient(90deg,var(--b),var(--a))', ...A('growx', i * 0.25, 4.5) }} />)}
    </div>
    <span className="absolute bottom-3 left-4 rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[9px] font-semibold">Daraz</span>
    <span className="absolute bottom-3 left-[84px] rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[9px] font-semibold">Amazon</span>
  </div>
)

const V6 = () => (
  <div className="absolute inset-0">
    <svg viewBox="0 0 300 170" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      {[[42, 36], [258, 36], [42, 134], [258, 134]].map(([x, y]) => <line key={x + '-' + y} x1="150" y1="85" x2={x} y2={y} strokeWidth="1.6" strokeDasharray="4 4" style={{ stroke: SOFT, animation: 'dash 1s linear infinite' }} />)}
    </svg>
    {[0, 1].map((i) => <i key={i} className="absolute left-1/2 top-1/2 -ml-8 -mt-8 h-16 w-16 rounded-full border" style={{ borderColor: 'var(--a)', ...A('pulse', i * 1.2, 2.4) }} />)}
    <Par d={8}><div className="tight absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xl" style={{ background: 'linear-gradient(135deg,var(--a),var(--b))', boxShadow: '0 0 30px var(--a)' }}>AI</div></Par>
    <Img n="messenger" style={{ left: 'calc(14% - 18px)', top: 'calc(21% - 18px)', ...A('floaty', 0, 4) }} d={16} />
    <Img n="whatsapp" style={{ left: 'calc(86% - 18px)', top: 'calc(21% - 18px)', ...A('floaty', 0.7, 4.4) }} d={20} />
    <Img n="gmail" style={{ left: 'calc(14% - 18px)', top: 'calc(79% - 18px)', background: '#fff', padding: 4, ...A('floaty', 1.2, 4.2) }} d={22} />
    <Img n="telegram" style={{ left: 'calc(86% - 18px)', top: 'calc(79% - 18px)', ...A('floaty', 1.7, 4.6) }} d={14} />
    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-white/20 px-3 py-1.5">{[0, 1, 2].map((i) => <i key={i} className="h-1.5 w-1.5 rounded-full bg-white" style={A('dots', i * 0.2, 1.2)} />)}</div>
  </div>
)
const VISUALS: Record<string, () => ReactNode> = { 'digital-marketing': V1, 'graphic-design': V2, 'video-production': V3, 'web-development': V4, 'ecommerce-growth': V5, 'ai-automation': V6 }
const CHIPS: Record<string, string[]> = {
  'digital-marketing': ['Social Media', 'Paid Ads', 'SEO', 'Email & SMS'], 'graphic-design': ['Brand Identity', 'Social Creatives', 'Print', 'Retouching'],
  'video-production': ['Reels & Shorts', 'Commercial Ads', 'Motion Graphics', 'AI Video'], 'web-development': ['E-commerce Stores', 'Websites', 'Landing Pages', 'Support'],
  'ecommerce-growth': ['Marketplaces', 'Inventory', 'CRO', 'Analytics'], 'ai-automation': ['AI Content', 'Chatbots', 'Workflows'],
}

/* ───── 3D card ───── */
const Card = memo(function Card({ i, pos, cat, cw, ch, active, onSelect, onOpen }: { i: number; pos: MotionValue<number>; cat: Category; cw: number; ch: number; active: boolean; onSelect: (i: number) => void; onOpen: (id: string) => void }) {
  const T = useTransform(pos, (v) => {
    const d = i - v, a = Math.abs(d), s = Math.sign(d)
    const x = s * (Math.min(a, 1) * cw * 0.78 + Math.max(0, Math.min(a, 2.5) - 1) * cw * 0.32)
    return `translate3d(${x}px,0,${-Math.min(a, 2.5) * 160}px) rotateY(${Math.max(-48, Math.min(48, -d * 38))}deg) scale(${1 - Math.min(a, 2.5) * 0.08})`
  })
  const O = useTransform(pos, (v) => Math.max(0.1, 1 - Math.min(Math.abs(i - v), 2.5) * 0.36))
  const DIM = useTransform(pos, (v) => Math.min(Math.abs(i - v), 2) * 0.2)
  const Z = useTransform(pos, (v) => 100 - Math.round(Math.abs(i - v) * 10))
  const inner = useRef<HTMLDivElement>(null), raf = useRef(0), pt = useRef({ x: 0.5, y: 0.5 })
  const Visual = VISUALS[cat.id], P = PAL[cat.id]
  const apply = () => {
    raf.current = 0; const s = inner.current?.style; if (!s) return
    const { x, y } = pt.current
    s.setProperty('--mx', `${x * 100}%`); s.setProperty('--my', `${y * 100}%`); s.setProperty('--rx', `${(0.5 - y) * 10}deg`); s.setProperty('--ry', `${(x - 0.5) * 12}deg`)
    s.setProperty('--px', String((x - 0.5) * 2)); s.setProperty('--py', String((y - 0.5) * 2))
  }
  const move = (e: React.PointerEvent) => {
    if (!active || !inner.current) return
    const r = inner.current.getBoundingClientRect()
    pt.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
    if (!raf.current) raf.current = requestAnimationFrame(apply)
  }
  const leave = () => { pt.current = { x: 0.5, y: 0.5 }; if (!raf.current) raf.current = requestAnimationFrame(apply); inner.current?.style.setProperty('--my', '-20%') }
  useEffect(() => { if (!active) leave() }, [active])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const vars = { '--a': P.a, '--b': P.b, '--d1': P.d1, '--d2': P.d2 } as React.CSSProperties
  return (
    <motion.div className="pointer-events-auto absolute left-1/2 top-1/2 [transform-style:preserve-3d]" style={{ width: cw, height: ch, marginLeft: -cw / 2, marginTop: -ch / 2, transform: T, opacity: O, zIndex: Z } as unknown as React.ComponentProps<typeof motion.div>['style']}>
      <div ref={inner} data-active={active ? '1' : '0'} onPointerMove={move} onPointerLeave={leave} onClick={() => (active ? onOpen(cat.id) : onSelect(i))} role="button" tabIndex={0}
        className={`group card-in relative h-full w-full cursor-pointer overflow-hidden rounded-[28px] border text-left ${active ? '' : 'card-idle'}`}
        style={{ ...vars, transform: 'perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))', borderColor: `color-mix(in srgb,${P.a} 45%,transparent)`,
          background: `linear-gradient(165deg,color-mix(in srgb,${P.a} 22%,transparent),transparent 42%),linear-gradient(180deg,color-mix(in srgb,${P.b} 46%,${P.d1}) 0%,color-mix(in srgb,${P.b} 14%,${P.d2}) 100%)`,
          boxShadow: `0 40px 80px -20px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.35) inset, 0 0 80px -26px ${P.a}` }}>
        <div className="relative h-[50%] overflow-hidden border-b border-white/15" style={{ background: `radial-gradient(90% 90% at 80% 0%,color-mix(in srgb,${P.a} 55%,transparent),transparent 62%),linear-gradient(160deg,${P.b},${P.d1})` }}>
          <Visual />
          <span className="tight absolute left-4 top-3 text-sm text-white/70">{cat.no}</span>
          <span className="absolute right-4 top-3 rounded-full border border-white/25 bg-black/25 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-white/90">{cat.services.length} SERVICES</span>
        </div>
        <div className="flex h-[50%] flex-col p-5 sm:p-6">
          <h3 className="hv text-[clamp(1rem,1.5vw,1.28rem)]">{cat.title}</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">{cat.goal}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{CHIPS[cat.id].map((c) => <span key={c} className="chip rounded-full border border-white/20 bg-white/[.08] px-2.5 py-1 text-[10.5px] font-medium text-white/90">{c}</span>)}</div>
          <div className="mt-auto flex items-center justify-between pt-3 text-[13px] font-semibold">
            <span style={{ color: P.a }}>View details</span>
            <span className="mag grid h-8 w-8 place-items-center rounded-full font-bold text-black/80" style={{ background: P.a }}>→</span>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,-20%),rgba(255,255,255,.2),transparent 45%)' }} />
        <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: DIM, background: P.d2 }} />
        {active && <div className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{ animation: 'sheen 5s 1s ease-in-out infinite' }} />}
      </div>
    </motion.div>
  )
})

/* ───── Gallery (page 3) ───── */
export function Gallery({ heading }: { heading: ReactNode }) {
  const N = CATEGORIES.length, sec = useRef<HTMLElement>(null), idxRef = useRef(0), [idx, setIdx] = useState(0)
  const { scrollYProgress } = useScroll({ target: sec, offset: ['start start', 'end end'] })
  const raw = useTransform(scrollYProgress, [0.03, 0.97], [0, N - 1], { clamp: true })
  const pos = useSpring(raw, { stiffness: 130, damping: 26, mass: 0.8 })
  useMotionValueEvent(pos, 'change', (v) => { const r = clamp(Math.round(v), 0, N - 1); if (r !== idxRef.current) { idxRef.current = r; setIdx(r) } })
  const [dim, setDim] = useState({ cw: 400, ch: 560 })
  useEffect(() => {
    const f = () => setDim({ cw: Math.min(410, Math.max(250, window.innerWidth * 0.76)), ch: Math.min(590, Math.max(430, window.innerHeight * 0.62)) })
    f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f)
  }, [])
  const go = useCallback((n: number) => {
    const k = clamp(n, 0, N - 1), el = sec.current; if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY + (el.offsetHeight - window.innerHeight) * (0.03 + (k / (N - 1)) * 0.94)
    if (L.lenis) L.lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: 'smooth' })
  }, [N])
  const open = useCallback((id: string) => { window.location.hash = '#/' + id }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { const r = sec.current?.getBoundingClientRect(); if (!r || r.top > 0 || r.bottom < window.innerHeight) return; if (e.key === 'ArrowRight') go(idxRef.current + 1); if (e.key === 'ArrowLeft') go(idxRef.current - 1) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [go])
  useEffect(() => {
    const el = sec.current; if (!el) return
    const io = new IntersectionObserver(([e]) => el.setAttribute('data-paused', e.isIntersecting ? '0' : '1'), { threshold: 0.05 }); io.observe(el)
    return () => io.disconnect()
  }, [])
  const drag = useRef(0)
  const arrow = (dir: number, side: string) => (
    <button aria-label={dir > 0 ? 'Next' : 'Previous'} onClick={() => go(idx + dir)} disabled={dir > 0 ? idx >= N - 1 : idx <= 0}
      className={`absolute top-1/2 z-[300] grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/30 text-lg transition hover:scale-110 hover:bg-white/20 disabled:opacity-25 disabled:hover:scale-100 ${side}`}>{dir > 0 ? '→' : '←'}</button>
  )
  return (
    <section ref={sec} id="services" className="relative" style={{ height: `${100 + (N - 1) * 20}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
      <div className="absolute inset-x-0 top-[11vh] z-10 px-5 text-center">{heading}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[9vh] top-[20vh] touch-pan-y [perspective:1700px] [transform-style:preserve-3d]"
        onPointerDown={(e) => { drag.current = e.clientX }} onPointerUp={(e) => { const dx = e.clientX - drag.current; if (Math.abs(dx) > 55) go(idx - Math.sign(dx)) }}>
        {CATEGORIES.map((c, i) => <Card key={c.id} i={i} pos={pos} cat={c} cw={dim.cw} ch={dim.ch} active={i === idx} onSelect={go} onOpen={open} />)}
      </div>
      {arrow(-1, 'left-[3vw]')}{arrow(1, 'right-[3vw]')}
      <div className="absolute inset-x-0 bottom-[3.5vh] z-10 flex items-center justify-center gap-2">
        {CATEGORIES.map((c, i) => <button key={c.id} aria-label={c.title} onClick={() => go(i)} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === idx ? 28 : 8, background: i === idx ? '#fff' : 'rgba(255,255,255,.3)' }} />)}
        <span className="tight ml-3 text-xs text-white/50">{String(idx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
      </div>
      </div>
    </section>
  )
}
