import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { B } from './b3d'
import { LITE, PC, S, SH, capClose, clamp, ease } from './shared'

/* Capsule in local units: total length 4.8, radius 0.9. Cap covers the top, glass body the bottom. */
export const CAP = { len: 4.8, R: 1.1, split: 0.1 }

function lathe(pts: [number, number][], seg = LITE ? 36 : 64) {
  return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)
}
function textTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512
  const g = c.getContext('2d')!; g.clearRect(0, 0, 1024, 512)
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.font = '700 124px "Plus Jakarta Sans Variable",Inter,Arial,sans-serif'; g.fillText('HM Creative', 512, 205)
  g.font = '700 108px "Plus Jakarta Sans Variable",Inter,Arial,sans-serif'; g.fillText('AI', 512, 345)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t
}
function softTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(0,0,0,.6)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

export function Capsule3D({ vw }: { vw: number }) {
  const { R, split } = CAP
  const g = useRef<THREE.Group>(null), cap = useRef<THREE.Group>(null), ring = useRef<THREE.Mesh>(null)
  const st = useRef({ drop: 0, tb: 0, want: false, landed: false, ringT: 9, bob: 0 })
  const scale = Math.min((0.55 * SH) / CAP.len, (vw * 0.55) / (2 * R))

  const hx = Math.min(2.0, Math.max(0.4, (vw / 2 / scale - CAP.R) * 0.7))
  const kit = useMemo(() => {
    const bodyTop = split + 0.25, cylBot = -CAP.len / 2 + R, Rc = R + 0.045
    // glass body: bottom hemisphere + cylinder, open on top
    const body: [number, number][] = [[0, -CAP.len / 2]]
    for (let i = 1; i <= 20; i++) { const a = (i / 20) * (Math.PI / 2); body.push([Math.sin(a) * R, cylBot - Math.cos(a) * R]) }
    body.push([R, bodyTop])
    // cap: rounded rim, cylinder, hemisphere dome
    const capH = CAP.len / 2 - split - Rc
    const capP: [number, number][] = [[Rc - 0.05, 0.015], [Rc - 0.02, 0.006], [Rc, 0.04]]
    for (let i = 1; i <= 4; i++) { const a = (i / 4) * (Math.PI / 2) * 0; capP.push([Rc, 0.04 + i * 0.02 + a]) }
    capP.push([Rc, capH])
    for (let i = 1; i <= 24; i++) { const a = (i / 24) * (Math.PI / 2); capP.push([Math.cos(a) * Rc, capH + Math.sin(a) * Rc]) }
    const glassF = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 3.2, depthWrite: false })
    const glassB = new THREE.MeshPhysicalMaterial({ color: '#ffc9d6', transparent: true, opacity: 0.07, roughness: 0.05, envMapIntensity: 1.2, side: THREE.BackSide, depthWrite: false })
    const capM = new THREE.MeshPhysicalMaterial({ color: '#8c0e2c', metalness: 0.55, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.3, side: THREE.DoubleSide, emissive: new THREE.Color('#ff2d5f'), emissiveIntensity: 0, transparent: true })
    const label = new THREE.MeshBasicMaterial({ map: textTex(), transparent: true, toneMapped: false, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
    const band = new THREE.MeshPhysicalMaterial({ color: '#3a0612', metalness: 0.6, roughness: 0.3, clearcoat: 1 })
    return {
      bodyG: lathe(body), capG: lathe(capP), glassF, glassB, capM, label, band, capH, Rc, bodyTop,
      labelG: new THREE.CylinderGeometry(Rc + 0.006, Rc + 0.006, 1.02, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3),
      rimG: new THREE.TorusGeometry(R + 0.004, 0.03, 12, 64), grooveG: new THREE.TorusGeometry(Rc + 0.002, 0.012, 8, 64),
      shadow: softTex(),
    }
  }, [])

  useFrame(({ clock, pointer }, dt) => {
    const f = S.f, t = clock.elapsedTime, s = st.current, o = g.current!, c = cap.current!
    const appear = ease(clamp((f - 0.22) / 0.28))
    o.visible = appear > 0.001
    // pointer-driven rotation gives real reflections
    o.rotation.y += ((pointer.x * 0.32 + Math.sin(t * 0.5) * 0.05) - o.rotation.y) * 0.06
    o.rotation.x += ((-pointer.y * 0.06) - o.rotation.x) * 0.06
    const bob = Math.sin(t * 1.3) * 0.035
    o.position.set(0, PC(1) + 0.4 + bob - (1 - appear) * 0.5, 0)
    o.scale.setScalar(scale * (0.94 + 0.06 * appear))
    kit.glassF.opacity = 0.1 * appear; kit.glassB.opacity = 0.07 * appear; kit.capM.opacity = appear; kit.label.opacity = appear

    // cap state machine
    if (f > 0.86) s.want = true; else if (f < 0.8) s.want = false
    const DROP = 0.62
    if (s.want) {
      if (s.drop < DROP) s.drop = Math.min(DROP, s.drop + dt)
      else { s.tb += dt; if (!s.landed) { s.landed = true; s.ringT = 0; capClose.set(1) } }
    } else {
      if (s.drop > 0) s.drop = Math.max(0, s.drop - dt * 1.7)
      if (s.landed) { s.landed = false; s.tb = 0; capClose.set(0) }
    }
    const p = s.drop / DROP, hover = 1 - p
    const drop = p * p * p, lift = 1 - drop
    const settle = s.landed ? Math.exp(-9 * s.tb) * Math.sin(30 * s.tb) * 0.05 : 0
    const sway = Math.sin(t * 1.5) * 0.06 * lift, bobY = Math.sin(t * 1.9) * 0.08 * lift
    const ex = 1 - (1 - p) * (1 - p)
    c.position.set(hx * (1 - ex), split + 2.7 * lift + bobY + Math.max(0, settle), -0.5 * hover)
    c.rotation.set(0.1 * hover, 0, -0.42 * lift + sway)
    kit.capM.emissiveIntensity = s.landed ? Math.max(0, 0.55 * Math.exp(-5 * s.tb)) : 0.0
    // impact ring
    const rg = ring.current!; s.ringT += dt
    const rp = clamp(s.ringT / 0.7); rg.visible = rp < 1
    rg.scale.setScalar(1 + rp * 0.9); ;(rg.material as THREE.MeshBasicMaterial).opacity = (1 - rp) * 0.7

    B.pos.set(o.position.x, o.position.y, 0); B.quat.copy(o.quaternion); B.scale = scale
  })

  return (
    <group ref={g}>
      <mesh position={[0, -CAP.len / 2 - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.9, 1.9, 1]} renderOrder={0}>
        <planeGeometry args={[2.4, 2.4]} /><meshBasicMaterial map={kit.shadow} transparent depthWrite={false} toneMapped={false} opacity={0.8} />
      </mesh>
      <mesh geometry={kit.bodyG} material={kit.glassB} renderOrder={1} />
      <mesh position={[0, kit.bodyTop, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={kit.rimG} material={kit.glassF} renderOrder={6} />
      <mesh geometry={kit.bodyG} material={kit.glassF} renderOrder={6} />
      <group ref={cap}>
        <mesh geometry={kit.capG} material={kit.capM} renderOrder={2} />
        <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={kit.grooveG} material={kit.band} />
        <mesh position={[0, 0.64, 0]} geometry={kit.labelG} material={kit.label} renderOrder={4} />
        <mesh ref={ring} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} visible={false} renderOrder={7}>
          <torusGeometry args={[CAP.R + 0.05, 0.025, 8, 64]} /><meshBasicMaterial color="#ffc2d1" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
