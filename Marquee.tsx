const mods = import.meta.glob('./assets/clients/*.webp', { eager: true, import: 'default' }) as Record<string, string>
const LOGOS = Object.keys(mods).sort().map((k) => mods[k])
const A = LOGOS.filter((_, i) => i % 2 === 0)
const B = LOGOS.filter((_, i) => i % 2 === 1)

function Row({ items, reverse, speed }: { items: string[]; reverse?: boolean; speed: number }) {
  const set = (k: string) => items.map((s, i) => (
    <div key={k + i} className="mq-chip"><img src={s} alt="" loading="lazy" draggable={false} /></div>
  ))
  return (
    <div className="mq-mask">
      <div className="mq-track" style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        <div className="mq-set">{set('a')}</div>
        <div className="mq-set" aria-hidden>{set('b')}</div>
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <Row items={A} speed={60} />
      <Row items={B} speed={70} reverse />
    </div>
  )
}
