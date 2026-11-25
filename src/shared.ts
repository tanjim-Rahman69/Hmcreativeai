import { motionValue } from 'framer-motion'
import type Lenis from 'lenis'

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const ease = (t: number) => t * t * (3 - 2 * t)
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
export const D = 12, FOV = 36, SH = 2 * D * Math.tan((FOV * Math.PI) / 360)
export const PC = (k: number) => 2.3 - k * SH
export const S = { f: 0 }
export const capClose = motionValue(0)
export const L: { lenis: Lenis | null } = { lenis: null }

export const goTo = (id: string) => {
  const el = document.getElementById(id); if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY
  if (L.lenis) L.lenis.scrollTo(y, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

/* cached scroll values: reading window.scrollY / innerHeight every frame forces layout */
export const V = { y: 0, vh: typeof window === 'undefined' ? 800 : window.innerHeight }
if (typeof window !== 'undefined') {
  V.y = window.scrollY
  window.addEventListener('scroll', () => { V.y = window.scrollY }, { passive: true })
  window.addEventListener('resize', () => { V.vh = window.innerHeight }, { passive: true })
}
/* weak / touch devices get a lighter 3D scene (same look, less work) */
export const LITE = typeof window !== 'undefined' && (window.matchMedia('(pointer:coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4)
