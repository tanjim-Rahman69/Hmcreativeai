import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { Reveal } from './ui'

const photos = import.meta.glob<string>('./assets/team/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })
const photoOf = (key: string) => Object.entries(photos).find(([k]) => k.toLowerCase().includes(key))?.[1]

const PEOPLE = [
  { key: 'himel', mono: 'HM', badge: 'Founder', name: 'Himel Mostakim', roles: ['Digital Marketing Expert', 'Business Development', 'Business Development Consultant'],
    chips: ['Digital Marketing', 'Business Development', 'Growth Consulting', 'Brand Strategy'],
    bio: "Himel leads HM Creative AI. He turns a business's goals into a clear growth plan across social media, advertising and sales, and keeps every channel pulling in the same direction." },
  { key: 'tanjim', mono: 'TR', badge: 'Co-founder', name: 'Tanjim Rahman', roles: ['AI Developer', 'Business Automation Developer'],
    chips: ['AI Development', 'Business Automation', 'Workflow Design', 'Web Development'],
    bio: 'Tanjim builds the technology behind the agency. He designs the AI tools and automations that take repetitive work off your plate, and the websites and systems that connect everything.' },
]

function useVW() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth))
  useEffect(() => { const f = () => setW(window.innerWidth); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  return w
}

function Card({ p, x, y, s, ry, o, z, shade, front }: { p: (typeof PEOPLE)[number]; x: MotionValue<number>; y: MotionValue<number>; s: MotionValue<number>; ry: MotionValue<number>; o: MotionValue<number>; z: MotionValue<number>; shade: MotionValue<number>; front?: boolean }) {
  const src = photoOf(p.key)
  return (
    <motion.div className="absolute left-1/2 top-1/2" style={{ x, y, scale: s, rotateY: ry, opacity: o, zIndex: z, marginLeft: 'calc(var(--cw) / -2)', marginTop: 'calc(var(--ch) / -2)', width: 'var(--cw)', height: 'var(--ch)', willChange: 'transform' }}>
      <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-[#1a0309]"
        style={{ boxShadow: front ? '0 70px 130px -10px rgba(0,0,0,.95), 0 0 0 2px rgba(255,255,255,.28), inset 0 1px 0 rgba(255,255,255,.4)' : '0 40px 80px -10px rgba(0,0,0,.8), 0 0 0 2px rgba(255,194,209,.22), inset 0 1px 0 rgba(255,255,255,.3)' }}>
        {src ? <img src={src} alt={p.name} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} draggable={false} />
          : <div className="absolute inset-0 grid place-items-center bg-[#3a0816]"><span className="hv text-6xl">{p.mono}</span></div>}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.28) 24%,rgba(0,0,0,0) 38%,rgba(0,0,0,0) 52%,rgba(0,0,0,.85) 72%,#050102 100%)' }} />
        <div className="absolute inset-x-0 top-0 p-5 sm:p-6">
          <span className="inline-block rounded-full border border-white/35 bg-black/30 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[.14em]">{p.badge}</span>
          <h3 className="t3d mt-3 text-[clamp(1.45rem,2.3vw,2rem)]">{p.name}</h3>
          <p className="t3d-sm mt-1.5 text-[12.5px] font-bold leading-snug">{p.roles.join('  ·  ')}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="text-[12.5px] leading-relaxed text-white/80">{p.bio}</p>
          <div className="mt-3.5 flex flex-wrap gap-1.5">{p.chips.map((c) => <span key={c} className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/90">{c}</span>)}</div>
        </div>
        <motion.div className="pointer-events-none absolute inset-0 bg-[#1d0309]" style={{ opacity: shade }} />
      </div>
    </motion.div>
  )
}

export default function Team() {
  const sec = useRef<HTMLElement>(null), vw = useVW(), mobile = vw < 768
  const { scrollYProgress: p } = useScroll({ target: sec, offset: ['start 88%', 'end end'] })
  const d = mobile ? 0 : Math.min(vw * 0.255, 330), far = vw * 0.75 + 420
  const T = [0, 0.27, 0.5, 0.64, 0.8, 0.92]
  const tr = (v: number[]) => useTransform(p, T, v)
  /* A = Founder, B = Co-founder. They enter from opposite sides, rest, then cross: A passes in front, B passes behind, and they swap. */
  const A = mobile
    ? { x: tr([-far, 0, 0, vw * 0.5, vw * 1.2, vw * 1.2]), y: tr([0, 0, 0, 0, 0, 0]), s: tr([1, 1, 1, 0.9, 0.8, 0.8]), ry: tr([-30, 0, 0, 14, 20, 20]), o: tr([0, 1, 1, 1, 0, 0]), z: tr([10, 10, 10, 10, 10, 10]), sh: tr([0, 0, 0, 0.45, 0.7, 0.7]) }
    : { x: tr([-far, -d, -d, 0, d, d]), y: tr([0, 0, 0, -6, 0, 0]), s: tr([1, 1, 1, 1.1, 1, 1]), ry: tr([-28, 6, 6, 0, -6, -6]), o: tr([0, 1, 1, 1, 1, 1]), z: tr([20, 20, 20, 20, 20, 20]), sh: tr([0, 0, 0, 0, 0, 0]) }
  const Bc = mobile
    ? { x: tr([-vw * 1.2, -vw * 1.2, -vw * 1.2, -vw * 0.5, 0, 0]), y: tr([0, 0, 0, 0, 0, 0]), s: tr([0.8, 0.8, 0.8, 0.9, 1, 1]), ry: tr([-20, -20, -20, -14, 0, 0]), o: tr([0, 0, 0, 1, 1, 1]), z: tr([20, 20, 20, 20, 20, 20]), sh: tr([0.7, 0.7, 0.7, 0.45, 0, 0]) }
    : { x: tr([far, d, d, 0, -d, -d]), y: tr([0, 0, 0, 52, 0, 0]), s: tr([1, 1, 1, 0.8, 1, 1]), ry: tr([28, -6, -6, 0, 6, 6]), o: tr([0, 1, 1, 1, 1, 1]), z: tr([10, 10, 10, 10, 10, 10]), sh: tr([0, 0, 0, 0.72, 0, 0]) }
  const head = useTransform(p, [0, 0.04, 0.96, 1], [0, 1, 1, 1])
  return (
    <section ref={sec} id="team" className="relative z-10" style={{ height: mobile ? '240vh' : '200vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden" style={{ ['--cw' as string]: mobile ? 'min(82vw,360px)' : 'min(400px,29vw)', ['--ch' as string]: mobile ? 'min(66vh,540px)' : 'min(61vh,540px)', }}>
        <motion.div style={{ opacity: head }} className="absolute inset-x-0 top-[9.5vh] z-30 text-center">
          <Reveal text="Our *introduction*" className="hv hv-shadow text-[clamp(1.8rem,4.2vw,3.6rem)]" />
        </motion.div>
        <div className="absolute inset-0" style={{ perspective: 1400, top: '9vh' }}>
          <Card front p={PEOPLE[0]} x={A.x} y={A.y} s={A.s} ry={A.ry} o={A.o} z={A.z} shade={A.sh} />
          <Card p={PEOPLE[1]} x={Bc.x} y={Bc.y} s={Bc.s} ry={Bc.ry} o={Bc.o} z={Bc.z} shade={Bc.sh} />
        </div>
      </div>
    </section>
  )
}
