import { Users, GraduationCap, Award, School, Layers, Percent } from 'lucide-react'
import { aggregate, formatNumber, formatRate, rate, type Cohort } from '../../shared/model'
export function Stats({ cohorts, schools = false }: { cohorts: Cohort[]; schools?: boolean }) {
  const totals = aggregate(cohorts)
  const cards = [
    { label: 'Cohortes publicadas', value: formatNumber(cohorts.length), icon: Layers },
    { label: 'Inscripciones', value: formatNumber(totals.enrolled), icon: Users },
    { label: 'Finalizaciones', value: formatNumber(totals.finished), icon: GraduationCap },
    { label: 'Certificados', value: formatNumber(totals.certified), icon: Award },
    { label: 'Tasa de finalización', value: formatRate(rate(totals.enrolled, totals.finished)), icon: Percent },
    ...(schools ? [{ label: 'Participaciones de escuelas', value: formatNumber(totals.schools), icon: School }] : []),
  ]
  return <><div className="stats">{cards.map(c => <article className="stat" key={c.label}><div className="stat-top"><span>{c.label}</span><c.icon size={18} aria-hidden="true" /></div><strong>{c.value}</strong></article>)}</div><p className="footnote">Las sumas entre cohortes representan participaciones, no personas ni instituciones únicas. Si falta algún valor, el total correspondiente se muestra como «Sin datos».</p></>
}
