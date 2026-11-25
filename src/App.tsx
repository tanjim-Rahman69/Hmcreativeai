import Marquee from './Marquee'
import Nav from './Nav'
import ServiceDetail from './ServiceDetail'
import Vision from './Vision'
import Team from './Team'
import Contact from './Contact'
import { useEffect, useMemo, useRef, useState } from 'react'
import Lenis from 'lenis'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { motion, useInView, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { SPRITE } from './sprite'
import { Gallery } from './cards'
import sheetUrl from './assets/runner-sheet.webp'
import logoUrl from './assets/logo.png'
import { Capsule3D } from './Capsule3D'
import { B, D, FOV, L, PC, goTo, S, SH, capClose, clamp, ease, rnd } from './shared'

const socialFiles = import.meta.glob<string>('./assets/social/*.png', { eager: true, query: '?url', import: 'default' })
type Shape = 'sq' | 'circ' | 'wide' | 'tile'
const LOGOS: { n: string; s: Shape; c: string; art?: number }[] = [
  { n: 'facebook', s: 'sq', c: '#3B5FB8' }, { n: 'instagram', s: 'circ', c: '#D62A9B' }, { n: 'tiktok', s: 'sq', c: '#2A0F25' },
  { n: 'youtube', s: 'wide', c: '#FF0000' }, { n: 'linkedin', s: 'circ', c: '#0B69C7' }, { n: 'whatsapp', s: 'circ', c: '#2AA61C' },
  { n: 'x', s: 'circ', c: '#0A0A0A' }, { n: 'messenger', s: 'circ', c: '#8A4DFF' }, { n: 'telegram', s: 'sq', c: '#1D9BE0' },
  { n: 'pinterest', s: 'circ', c: '#CB2027' }, { n: 'threads', s: 'sq', c: '#0A0A0A' }, { n: 'snapchat', s: 'sq', c: '#FFE600' },
  { n: 'google', s: 'tile', c: '#F4F6FA', art: 0.62 }, { n: 'gmail', s: 'tile', c: '#F4F6FA', art: 0.68 }, { n: 'tiktok-mono', s: 'circ', c: '#0A0A0A' },
]
const LOGO_URLS = LOGOS.map((l) => socialFiles[`./assets/social/${l.n}.png`])

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler()

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t
}

/* ───────── 3D ───────── */
function Rig() {
  const off = useRef({ x: 0, y: 0, init: false })
  useFrame(({ camera, pointer }, dt) => {
    const target = window.scrollY / window.innerHeight, o = off.current
    if (!o.init) { S.f = target; o.init = true }
    S.f += (target - S.f) * (1 - Math.exp(-dt * 16))
    o.x += (clamp(pointer.x, -1, 1) * 0.5 - o.x) * 0.05; o.y += (clamp(pointer.y, -1, 1) * 0.18 - o.y) * 0.05
    const cy = PC(S.f); camera.position.set(o.x, cy + o.y, D); camera.lookAt(0, cy, 0)
  })
  return null
}

function Road() {
  const g = useRef<THREE.Group>(null), mm = useRef<THREE.MeshBasicMaterial>(null), mf = useRef<THREE.MeshBasicMaterial>(null)
  const tex = useMemo(() => {
    const t = canvasTex(256, 256, (c) => {
      const gr = c.createLinearGradient(0, 0, 0, 256)
      gr.addColorStop(0, 'rgba(30,3,10,0)'); gr.addColorStop(0.4, 'rgba(30,3,10,.8)'); gr.addColorStop(1, 'rgba(14,1,5,.95)')
      c.fillStyle = gr; c.fillRect(0, 0, 256, 256); c.fillStyle = 'rgba(255,255,255,.35)'
      for (const y of [120, 170, 225]) c.fillRect(0, y, 140, y === 170 ? 7 : 5)
    })
    t.wrapS = THREE.RepeatWrapping; t.repeat.set(24, 1); return t
  }, [])
  useFrame((_, dt) => { tex.offset.x += dt * (0.9 + ease(clamp((S.f - 0.05) / 0.3)) * 0.9); g.current!.visible = S.f < 0.9; mm.current!.opacity = 0.5 * (1 - ease(clamp(S.f / 0.5))); mf.current!.opacity = 0.3 * (1 - ease(clamp(S.f / 0.5))) })
  return (
    <group ref={g}><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} renderOrder={-1}>
      <planeGeometry args={[60, 8]} /><meshBasicMaterial ref={mm} map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 11]} renderOrder={-1}><planeGeometry args={[60, 12]} /><meshBasicMaterial ref={mf} color="#2a0410" transparent opacity={0.3} depthWrite={false} toneMapped={false} /></mesh></group>
  )
}

function Runner() {
  const A = useLoader(THREE.TextureLoader, sheetUrl)
  const Bt = useMemo(() => { const t = A.clone(); t.needsUpdate = true; return t }, [A])
  const { cols, rows, n, fw, fh, fps } = SPRITE
  for (const t of [A, Bt]) { t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.anisotropy = 8; t.repeat.set(1 / cols, 1 / rows) }
  const H = 2.4, W = (H * fw) / fh, rest = -0.45 - W / 2
  const g = useRef<THREE.Group>(null), sh = useRef<THREE.Mesh>(null), mb = useRef<THREE.MeshBasicMaterial>(null)
  const st = useRef<(THREE.Mesh | null)[]>([]), fr = useRef(0)
  const shTex = useMemo(() => canvasTex(128, 128, (c) => {
    const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = r; c.fillRect(0, 0, 128, 128)
  }), [])
  const put = (t: THREE.Texture, i: number) => t.offset.set((i % cols) / cols, 1 - (Math.floor(i / cols) + 1) / rows)
  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime, e = ease(clamp(t / 2)), s = ease(clamp((S.f - 0.05) / 0.3))
    g.current!.visible = S.f < 0.7
    fr.current = (fr.current + dt * fps * 1.25 * (1 + s * 0.4)) % n
    const i0 = Math.floor(fr.current); put(A, i0); put(Bt, (i0 + 1) % n); mb.current!.opacity = fr.current - i0
    g.current!.position.set(-9 + (rest + 9) * e + s * 17, 0, 0.7)
    g.current!.rotation.y = clamp(pointer.x, -1, 1) * 0.16
    const air = Math.abs(Math.sin((fr.current / n) * Math.PI * 4))
    sh.current!.scale.set(1.4 - air * 0.12, 0.32 - air * 0.03, 1)
    st.current.forEach((o, i) => {
      if (!o) return
      const life = ((t * (4 + s * 5) + i * 1.1) % 2.6) / 2.6
      o.position.x = -W / 2 - 0.2 - life * 2.4; (o.material as THREE.MeshBasicMaterial).opacity = (1 - life) * 0.4 * (e > 0.9 ? 1 : 0)
    })
  })
  return (
    <group ref={g}>
      <mesh ref={sh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><circleGeometry args={[1, 32]} /><meshBasicMaterial map={shTex} transparent depthWrite={false} /></mesh>
      <mesh position={[0, H / 2 + 0.04, 0]} renderOrder={1}><planeGeometry args={[W, H]} /><meshBasicMaterial map={A} transparent depthWrite={false} toneMapped={false} /></mesh>
      <mesh position={[0, H / 2 + 0.04, 0.002]} renderOrder={2}><planeGeometry args={[W, H]} /><meshBasicMaterial ref={mb} map={Bt} transparent depthWrite={false} toneMapped={false} /></mesh>
      {[0.55, 1.1, 1.65].map((y, i) => (
        <mesh key={i} ref={(el) => { st.current[i] = el }} position={[0, y, -0.05]}>
          <planeGeometry args={[1, 0.025]} /><meshBasicMaterial color="#ffc2d1" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ───────── Glossy 3D logo tokens (small, saturated, with tiny wings) ───────── */
type Extra = 'heart' | 'star' | 'notif'
const EXTRAS: Extra[] = ['heart', 'star', 'notif', 'heart', 'star', 'notif']
const N = 30
function pileRest(i: number) {
  const R = 1.1, bottom = -2.4 + R, layer = Math.floor(i / 6), ang = i * 2.399 + layer * 0.9
  const y = -2.0 + layer * 0.46 + rnd(i + 5) * 0.08
  const lim = y < bottom ? Math.sqrt(Math.max(0, R * R - (y - bottom) ** 2)) - 0.36 : R - 0.36
  const r = Math.max(0, lim) * (i % 6 === 0 ? 0.25 : 0.55 + 0.45 * rnd(i + 13))
  return new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r * 0.9)
}
const ITEMS = Array.from({ length: N }, (_, i) => {
  const wall = i < 15, r = rnd(i + 1), r2 = rnd(i + 50), r3 = rnd(i + 99), ang = i * 2.399, rad = 0.05 + 0.34 * Math.sqrt(r)
  return {
    wall, extra: null as Extra | null, logo: i < 15 ? i : (i * 4 + 3) % 15,
    sx: (r2 - 0.5) * 9, sy: 5.5 + r3 * 2, ph: r * 6.28, hz: (rnd(i + 7) - 0.5) * 0.5,
    a: wall ? 0.06 + i * 0.012 : 0.14 + ((i - 15) / 21) * 0.28, d: 0.3 + r * 0.12,
    rest: pileRest(i), rq: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd(i + 31) * 6.28, rnd(i + 41) * 6.28, rnd(i + 61) * 6.28)),
  }
})
const heroHome = (i: number, aspect: number): [number, number] => {
  const narrow = aspect < 1, cols = narrow ? 3 : 5, dx = 0.82, x0 = narrow ? 0.35 : 1.1, row = Math.floor(i / cols)
  return [x0 + (i % cols) * dx + (row % 2) * 0.4 + (rnd(i + 3) - 0.5) * 0.12, 0.55 + row * 0.66 + (rnd(i + 9) - 0.5) * 0.1]
}
const TS = 0.46 // token size in hero

function Tokens({ k, aspect }: { k: number; aspect: number }) {
  const texs = useLoader(THREE.TextureLoader, LOGO_URLS)
  const kit = useMemo(() => {
    texs.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16 })
    const T = 0.19, BV = 0.16, prof: THREE.Vector2[] = [new THREE.Vector2(0, -T), new THREE.Vector2(0.47 - BV, -T)]
    for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push(new THREE.Vector2(0.47 - BV + BV * Math.sin(a), -T + BV - BV * Math.cos(a))) }
    for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push(new THREE.Vector2(0.47 - BV + BV * Math.cos(a), T - BV + BV * Math.sin(a))) }
    prof.push(new THREE.Vector2(0, T))
    const coin = new THREE.LatheGeometry(prof, 48); coin.rotateX(Math.PI / 2)
    const wing = new THREE.Shape()
    wing.moveTo(0, 0); wing.bezierCurveTo(0.15, 0.4, 0.55, 0.65, 1.1, 0.6); wing.lineTo(0.85, 0.47); wing.lineTo(1.02, 0.36); wing.lineTo(0.76, 0.26); wing.lineTo(0.88, 0.12); wing.bezierCurveTo(0.6, 0.12, 0.3, 0.05, 0, 0)
    const ext = { depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 5, curveSegments: 24 }
    const heart = new THREE.Shape(); heart.moveTo(0, -0.45); heart.bezierCurveTo(-0.7, 0.05, -0.45, 0.6, 0, 0.25); heart.bezierCurveTo(0.45, 0.6, 0.7, 0.05, 0, -0.45)
    const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? 0.22 : 0.5, a = (i / 10) * Math.PI * 2 + Math.PI / 2; i ? star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : star.moveTo(Math.cos(a) * rr, Math.sin(a) * rr) }
    const hg = new THREE.ExtrudeGeometry(heart, ext), sg = new THREE.ExtrudeGeometry(star, ext); hg.center(); sg.center()
    const notifTex = canvasTex(256, 180, (c) => { c.fillStyle = '#fff'; c.font = '800 110px Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♥ 1', 128, 98) })
    const gl = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.05, envMapIntensity: 1.2 })
    return {
      geo: { sq: new RoundedBoxGeometry(0.98, 0.98, 0.38, 5, 0.16), tile: new RoundedBoxGeometry(0.98, 0.98, 0.38, 5, 0.16), wide: new RoundedBoxGeometry(0.99, 0.7, 0.38, 5, 0.16), circ: coin },
      wing: new THREE.ShapeGeometry(wing, 12), heart: hg, star: sg, notif: new RoundedBoxGeometry(0.98, 0.7, 0.38, 5, 0.16),
      body: LOGOS.map((l) => gl(l.c)),
      face: texs.map((t) => new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })),
      ex: { heart: gl('#E8202E'), star: gl('#FFC21A'), notif: gl('#E8202E') },
      notifFace: new THREE.MeshBasicMaterial({ map: notifTex, transparent: true, toneMapped: false, depthWrite: false }),
      wmat: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#cfe3ff', emissiveIntensity: 0.25, roughness: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }),
    }
  }, [texs])
  const refs = useRef<(THREE.Group | null)[]>([]), wr = useRef<(THREE.Group | null)[]>([]), wl = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ITEMS.forEach((it, n) => {
      const o = refs.current[n]; if (!o) return
      const u = clamp((S.f - it.a) / it.d), e = Math.pow(u, 1.6)
      let sc = 0, px = it.sx, py = it.sy, pz = 0
      if (it.wall) {
        const [hx, hy] = heroHome(n, aspect), rise = ease(clamp((t - 0.6 - n * 0.11) / 1))
        px = hx * k + Math.sin(t * 0.9 + it.ph) * 0.08 + Math.sin(t * 2.2 + n) * 0.02; pz = it.hz
        py = hy * k * rise - 1.2 * (1 - rise) + Math.sin(t * 1.7 + it.ph) * 0.07; sc = TS * k * Math.max(rise, 0.0001)
      } else if (u > 0) sc = 0.42
      if (sc === 0) { o.visible = false; return }
      o.visible = true
      _v.copy(it.rest).multiplyScalar(B.scale).applyQuaternion(B.quat).add(B.pos)
      const sway = Math.sin(u * Math.PI * 3 + n) * 0.25 * (1 - u)
      const ex = ease(clamp(e / 0.5)), ez = ease(clamp(e / 0.7))
      o.position.set(px + (_v.x - px) * ex + sway, py + (_v.y - py) * e, pz + (_v.z - pz) * ez)
      _e.set(u * 5, u * 4 + Math.sin(t * 1.2 + n) * 0.1 * (1 - e), u * 3); _q.setFromEuler(_e)
      _q2.multiplyQuaternions(B.quat, it.rq); o.quaternion.copy(_q.slerp(_q2, e))
      o.scale.setScalar(Math.max(0.0001, (sc + (0.5 * B.scale - sc) * e)))
      const a = wr.current[n], b = wl.current[n]
      if (a && b) { const fl = 0.3 + 0.5 * Math.sin(t * 15 + it.ph * 3), ws = Math.max(0.0001, 1 - ease(clamp((e - 0.5) / 0.4))); a.rotation.z = fl; b.rotation.z = -fl; a.scale.setScalar(ws); b.scale.setScalar(ws) }
    })
  })
  return (
    <>{ITEMS.map((it, n) => {
      if (it.extra) {
        const x = it.extra
        return (
          <group key={n} ref={(el) => { refs.current[n] = el }} visible={false}>
            <mesh geometry={kit[x]} material={kit.ex[x]} />
            {x === 'notif' && <mesh position={[0, 0, 0.192]} renderOrder={3}><planeGeometry args={[0.98, 0.7]} /><primitive object={kit.notifFace} attach="material" /></mesh>}
          </group>
        )
      }
      const l = LOGOS[it.logo], art = l.art ?? 1, half = l.s === 'wide' ? 0.5 : 0.47
      return (
        <group key={n} ref={(el) => { refs.current[n] = el }} visible={false}>
          <mesh geometry={kit.geo[l.s]} material={kit.body[it.logo]} />
          <mesh position={[0, 0, 0.192]} scale={art} material={kit.face[it.logo]} renderOrder={3}><planeGeometry args={[1, 1]} /></mesh>
          <mesh position={[0, 0, -0.192]} rotation={[0, Math.PI, 0]} scale={art} material={kit.face[it.logo]} renderOrder={3}><planeGeometry args={[1, 1]} /></mesh>
          <group ref={(el) => { wr.current[n] = el }} position={[half, 0.04, -0.04]}><mesh geometry={kit.wing} material={kit.wmat} scale={0.36} /></group>
          <group ref={(el) => { wl.current[n] = el }} position={[-half, 0.04, -0.04]}><mesh geometry={kit.wing} material={kit.wmat} scale={[-0.36, 0.36, 0.36]} /></group>
        </group>
      )
    })}</>
  )
}

function Scene() {
  const aspect = useThree((s) => s.size.width / s.size.height), k = aspect < 1 ? 0.5 : Math.min(1, aspect / 1.5)
  return (
    <>
      <Rig />
      <ambientLight intensity={0.5} /><directionalLight position={[3, 5, 4]} intensity={1.1} />
      <Environment resolution={64}>
        <Lightformer intensity={2.6} position={[0, 5, 3]} scale={[10, 3, 1]} form="rect" />
        <Lightformer intensity={2.2} position={[-3.5, 3.5, 3]} scale={[3, 3, 1]} form="rect" />
        <Lightformer intensity={1.6} position={[-5, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 6, 1]} />
        <Lightformer intensity={1.3} color="#ffb3c4" position={[5, 1, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 6, 1]} />
        <Lightformer intensity={1.2} position={[0, -2, 4]} scale={[8, 1.5, 1]} form="rect" />
      </Environment>
      <group scale={k}><Road /><Runner /></group>
      <Capsule3D vw={SH * aspect} />
      <Tokens k={k} aspect={aspect} />
    </>
  )
}

/* ───────── Text ───────── */
const EASE = [0.16, 1, 0.3, 1] as const
function Word({ w, i, accent, hero, ex, when }: { w: string; i: number; accent: boolean; hero: boolean; ex: number; when?: boolean }) {
  const { scrollY } = useScroll(), vh = window.innerHeight, a = (ex + i * 0.025) * vh, b = a + 0.3 * vh
  const y = useTransform(scrollY, [a, b], [0, -40]), o = useTransform(scrollY, [a, b], [1, 0])
  const ref = useRef<HTMLSpanElement>(null), inView = useInView(ref, { amount: 0.3 })
  const cls = 'inline-block ' + (accent ? 'text-[#FFC2D1]' : '')
  const hid = { y: '115%', opacity: 0, filter: 'blur(10px)' }, shown = { y: '0%', opacity: 1, filter: 'blur(0px)' }
  return (
    <span ref={ref} className="mr-[0.24em] inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] pt-[0.1em] -mt-[0.1em] align-top">
      {hero ? (
        <motion.span className="inline-block" initial={hid} animate={shown} transition={{ duration: 1.3, delay: 0.35 + i * 0.09, ease: EASE }}>
          <motion.span className={cls} style={{ y, opacity: o }}>{w}</motion.span>
        </motion.span>
      ) : (
        <motion.span className="inline-block" initial={hid} animate={(when ?? inView) ? shown : hid} transition={(when ?? inView) ? { duration: 0.9, delay: 0.15 + i * 0.06, ease: EASE } : { duration: 0.25, ease: 'easeIn' }}>
          <span className={cls}>{w}</span>
        </motion.span>
      )}
    </span>
  )
}
function Words({ text, hero = false, ex = 0.03, when }: { text: string; hero?: boolean; ex?: number; when?: boolean }) {
  let n = 0
  return <>{text.split(/(\*[^*]+\*)/).filter(Boolean).flatMap((p) => {
    const accent = p.startsWith('*'); return p.replace(/\*/g, '').split(' ').filter(Boolean).map((w) => <Word key={n} w={w} i={n++} accent={accent} hero={hero} ex={ex} when={when} />)
  })}</>
}
function Exit({ a, b, children, className }: { a: number; b: number; children: React.ReactNode; className?: string }) {
  const { scrollY } = useScroll(), vh = window.innerHeight
  const o = useTransform(scrollY, [a * vh, b * vh], [1, 0]), y = useTransform(scrollY, [a * vh, b * vh], [0, -30])
  return <motion.div className={className} style={{ opacity: o, y }}>{children}</motion.div>
}
const fade = (d: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.1, delay: d, ease: EASE } })
const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { amount: 0.5 }, transition: { duration: 1.1, ease: EASE } }
const H2 = 'serif text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.04] tracking-[-0.02em]'
const inFrame = window.self !== window.top

function Site({ onPhone }: { onPhone: () => void }) {
  const [shut, setShut] = useState(false), [live, setLive] = useState(true), { scrollY } = useScroll(), canvasO = useTransform(scrollY, [window.innerHeight * 1.35, window.innerHeight * 1.8], [1, 0])
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 }); L.lenis = l; let id = 0
    const raf = (t: number) => { l.raf(t); id = requestAnimationFrame(raf) }; id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); l.destroy(); L.lenis = null }
  }, [])
  useMotionValueEvent(capClose, 'change', (v) => setShut(v > 0.92))
  useMotionValueEvent(scrollY, 'change', (y) => setLive(y < window.innerHeight * 1.9))
  return (
    <>
      <div className="bg-grad fixed inset-0 z-0 overflow-hidden">
        <div className="bg-orb" style={{ width: '46vw', height: '46vw', left: '-8vw', top: '-12vw', background: 'rgba(255,60,100,.35)', animation: 'drift1 16s ease-in-out infinite' }} />
        <div className="bg-orb" style={{ width: '40vw', height: '40vw', right: '-10vw', bottom: '-14vw', background: 'rgba(120,10,40,.5)', animation: 'drift2 20s ease-in-out infinite' }} />
      </div>
      <motion.div className="fixed inset-0 z-0" style={{ opacity: canvasO }}>
        <Canvas flat frameloop={live ? 'always' : 'never'} dpr={[1, 1.25]} camera={{ position: [0, 2.3, D], fov: FOV }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} eventSource={document.getElementById('root') as HTMLElement} eventPrefix="client">
          <Scene />
        </Canvas>
      </motion.div>
      <Nav />
      <ServiceDetail />
      {!inFrame && <button onClick={onPhone} className="fixed bottom-4 right-4 z-40 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/60">📱 Phone view</button>}
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
        <section id="work" className="relative h-screen">
          <div className="absolute inset-x-0 top-[9vh] px-5 text-center">
            <h2 className="hv hv-shadow text-[clamp(1.4rem,3.4vw,3rem)]"><Words when={shut} text="We bring you *all in one solution*" /></h2>
          </div>
          <div className="absolute inset-x-0 bottom-[4vh]">
            <h2 className="hv hv-shadow mb-5 px-5 text-center text-[clamp(1.2rem,2.6vw,2.3rem)]"><Words when={shut} text="We already *solved their*" /></h2>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={shut ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 1.1, delay: 0.5, ease: EASE }}><Marquee /></motion.div>
          </div>
        </section>
        <Gallery heading={<h2 className="hv hv-shadow text-[clamp(1.4rem,3.2vw,2.7rem)]"><Words text="Our *solutions*" /></h2>} />
        <Vision />
        <Team />
        <Contact />
      </main>
    </>
  )
}

export default function App() {
  const [doc, setDoc] = useState<string | null>(null)
  if (doc !== null) {
    const sc = Math.min(1, (window.innerHeight - 70) / 864)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0f14]">
        <div style={{ width: 390, height: 844, transform: `scale(${sc})` }} className="relative shrink-0 overflow-hidden rounded-[46px] border-[10px] border-[#050608] shadow-[0_30px_80px_rgba(0,0,0,.6)]">
          <iframe title="Phone view" srcDoc={doc} className="h-full w-full border-0" />
        </div>
        <button onClick={() => setDoc(null)} className="fixed bottom-4 right-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20">🖥 Desktop view</button>
      </div>
    )
  }
  return <Site onPhone={() => setDoc('<!doctype html>' + document.documentElement.outerHTML)} />
}
