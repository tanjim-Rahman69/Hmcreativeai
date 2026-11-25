import { lazy, memo, Suspense, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { motion, useInView, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import Marquee from './Marquee'
import Nav from './Nav'
import ServiceDetail from './ServiceDetail'
import Vision from './Vision'
import Team from './Team'
import Contact from './Contact'
import { Gallery } from './cards'
import { L, V, capClose, goTo } from './shared'

const Stage = lazy(() => import('./Scene3D'))

/* ───────── Text ───────── */
const EASE = [0.16, 1, 0.3, 1] as const
const WRAP = 'mr-[0.24em] inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] pt-[0.1em] -mt-[0.1em] align-top'
const hid = { y: '115%', opacity: 0, filter: 'blur(10px)' }, shown = { y: '0%', opacity: 1, filter: 'blur(0px)' }
function HeroWord({ w, i, accent, ex }: { w: string; i: number; accent: boolean; ex: number }) {
  const { scrollY } = useScroll(), vh = V.vh, a = (ex + i * 0.025) * vh, b = a + 0.3 * vh
  const y = useTransform(scrollY, [a, b], [0, -40]), o = useTransform(scrollY, [a, b], [1, 0])
  return (
    <span className={WRAP}>
      <motion.span className="inline-block" initial={hid} animate={shown} transition={{ duration: 1.3, delay: 0.35 + i * 0.09, ease: EASE }}>
        <motion.span className={'inline-block ' + (accent ? 'text-[#FFC2D1]' : '')} style={{ y, opacity: o }}>{w}</motion.span>
      </motion.span>
    </span>
  )
}
function Word({ w, i, accent, when }: { w: string; i: number; accent: boolean; when?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null), inView = useInView(ref, { amount: 0.3 }), on = when ?? inView
  return (
    <span ref={ref} className={WRAP}>
      <motion.span className="inline-block" initial={hid} animate={on ? shown : hid} transition={on ? { duration: 0.9, delay: 0.15 + i * 0.06, ease: EASE } : { duration: 0.25, ease: 'easeIn' }}>
        <span className={'inline-block ' + (accent ? 'text-[#FFC2D1]' : '')}>{w}</span>
      </motion.span>
    </span>
  )
}
function Words({ text, hero = false, ex = 0.03, when }: { text: string; hero?: boolean; ex?: number; when?: boolean }) {
  let n = 0
  return <>{text.split(/(\*[^*]+\*)/).filter(Boolean).flatMap((p) => {
    const accent = p.startsWith('*'); return p.replace(/\*/g, '').split(' ').filter(Boolean).map((w) => hero ? <HeroWord key={n} w={w} i={n++} accent={accent} ex={ex} /> : <Word key={n} w={w} i={n++} accent={accent} when={when} />)
  })}</>
}
function Exit({ a, b, children, className }: { a: number; b: number; children: React.ReactNode; className?: string }) {
  const { scrollY } = useScroll(), vh = V.vh
  const o = useTransform(scrollY, [a * vh, b * vh], [1, 0]), y = useTransform(scrollY, [a * vh, b * vh], [0, -30])
  return <motion.div className={className} style={{ opacity: o, y }}>{children}</motion.div>
}

const fade = (d: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.1, delay: d, ease: EASE } })

const Backdrop = memo(function Backdrop() {
  return (
    <div className="bg-grad fixed inset-0 z-0 overflow-hidden">
      <div className="bg-orb" style={{ width: '60vw', height: '60vw', left: '-15vw', top: '-19vw', background: 'radial-gradient(closest-side,rgba(255,60,100,.38),rgba(255,60,100,.16) 55%,transparent)', animation: 'drift1 16s ease-in-out infinite' }} />
      <div className="bg-orb" style={{ width: '54vw', height: '54vw', right: '-17vw', bottom: '-21vw', background: 'radial-gradient(closest-side,rgba(120,10,40,.55),rgba(120,10,40,.22) 55%,transparent)', animation: 'drift2 20s ease-in-out infinite' }} />
    </div>
  )
})

/* the 3D stage loads after the first paint, lives in its own component so scroll state never re-renders the page */
const Canvas3D = memo(function Canvas3D() {
  const { scrollY } = useScroll(), canvasO = useTransform(scrollY, [V.vh * 1.35, V.vh * 1.8], [1, 0])
  const [mount, setMount] = useState(false), [live, setLive] = useState(true), [ready, setReady] = useState(false)
  useEffect(() => {
    let off = false
    const go = () => { Promise.race([document.fonts.load('700 20px "Plus Jakarta Sans Variable"'), new Promise((r) => setTimeout(r, 1500))]).then(() => { if (!off) setMount(true) }) }
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback; if (ric) ric(go, { timeout: 800 }); else setTimeout(go, 250)
    return () => { off = true }
  }, [])
  useMotionValueEvent(scrollY, 'change', (y) => setLive((p) => (p ? y < V.vh * 2.4 : y < V.vh * 2.1)))
  return (
    <motion.div className="fixed inset-0 z-0" style={{ opacity: canvasO }}>
      <div className="h-full w-full transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
        <Suspense fallback={null}>{mount && <Stage live={live} onReady={() => setReady(true)} />}</Suspense>
      </div>
    </motion.div>
  )
})

function Section2() {
  const [shut, setShut] = useState(false)
  useMotionValueEvent(capClose, 'change', (v) => setShut(v > 0.92))
  return (
    <section id="work" className="relative h-screen">
      <div className="absolute inset-x-0 top-[9vh] px-5 text-center">
        <h2 className="hv hv-shadow text-[clamp(1.4rem,3.4vw,3rem)]"><Words when={shut} text="We bring you *all in one solution*" /></h2>
      </div>
      <div className="absolute inset-x-0 bottom-[4vh]">
        <h2 className="hv hv-shadow mb-5 px-5 text-center text-[clamp(1.2rem,2.6vw,2.3rem)]"><Words when={shut} text="We already *solved their*" /></h2>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={shut ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 1.1, delay: 0.5, ease: EASE }}><Marquee /></motion.div>
      </div>
    </section>
  )
}

function Site() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 }); L.lenis = l; let id = 0
    const raf = (t: number) => { l.raf(t); id = requestAnimationFrame(raf) }; id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); l.destroy(); L.lenis = null }
  }, [])
  return (
    <>
      <Backdrop />
      <Canvas3D />
      <Nav />
      <ServiceDetail />
      <main className="relative z-10">
        <section className="relative h-screen">
          <div className="absolute inset-x-0 top-[14vh] px-5 text-center">
            <h1 className="hv hv-shadow mx-auto max-w-[24ch] text-[clamp(1.7rem,4.5vw,4.2rem)]"><Words hero text="Are you also struggling with *online marketing?*" /></h1>
            <Exit a={0.03} b={0.3}>
              <motion.div {...fade(1.4)} className="mt-8 flex flex-wrap justify-center gap-3">
                <button onClick={() => goTo('contact')} className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#ee0039] shadow-[0_12px_30px_rgba(0,0,0,.35)] transition hover:-translate-y-0.5">Get a free brief →</button>
                <button onClick={() => goTo('services')} className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold transition hover:bg-white/20">See how we fix it ↓</button>
              </motion.div>
            </Exit>
          </div>
        </section>
        <Section2 />
        <Gallery heading={<h2 className="hv hv-shadow text-[clamp(1.4rem,3.2vw,2.7rem)]"><Words text="Our *solutions*" /></h2>} />
        <Vision />
        <Team />
        <Contact />
      </main>
    </>
  )
}

export default function App() {
  return <Site />
}
