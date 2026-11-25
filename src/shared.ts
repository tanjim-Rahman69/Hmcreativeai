import { motionValue } from 'framer-motion'
import * as THREE from 'three'
import type Lenis from 'lenis'

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const ease = (t: number) => t * t * (3 - 2 * t)
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
export const D = 12, FOV = 36, SH = 2 * D * Math.tan((FOV * Math.PI) / 360)
export const PC = (k: number) => 2.3 - k * SH
export const S = { f: 0 }
export const capClose = motionValue(0)
export const B = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 1 }
export const L: { lenis: Lenis | null } = { lenis: null }

export const goTo = (id: string) => {
  const el = document.getElementById(id); if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY
  if (L.lenis) L.lenis.scrollTo(y, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}
