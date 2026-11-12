import { useId, type ReactNode } from 'react'

export function ChartPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const id = useId()
  return <section className="panel chart-panel" aria-labelledby={id}>
    <h2 id={id}>{title}</h2><p className="muted chart-description">{description}</p>{children}
  </section>
}

