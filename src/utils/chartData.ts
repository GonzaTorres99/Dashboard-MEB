import { aggregate, lines, rate, formatRate, type Cohort, type LineId } from '../../shared/model.ts'

export interface ChartRate {
  value: number | null
  plotted: number | null
  status: string
}

// Preserve the source rate; anomalous values are explained, never clamped to the axis.
export function chartRate(enrolled: number | null, finished: number | null): ChartRate {
  const value = rate(enrolled, finished)
  if (enrolled === null || finished === null) return { value, plotted: null, status: 'Datos incompletos' }
  if (!Number.isFinite(enrolled) || !Number.isFinite(finished) || enrolled < 0 || finished < 0 || finished > enrolled)
    return { value, plotted: null, status: 'Datos fuera de rango' }
  if (enrolled === 0) return { value, plotted: null, status: 'Sin inscripciones' }
  return { value, plotted: value, status: '' }
}

// Cohort is the published-only model produced by shared/adapter.ts.
export function chartCohorts(cohorts: Cohort[], year = '', line?: LineId) {
  return cohorts.filter(c => (!year || c.year === year) && (!line || c.line === line))
}

export function programComparison(cohorts: Cohort[], year = '') {
  const selected = chartCohorts(cohorts, year)
  const shortNames = ['Acompañamiento', 'Enseñar con medios', 'Taller de radios', 'Liga de radios']
  return lines.map((line, index) => {
    const subset = selected.filter(c => c.line === line.id)
    const totals = aggregate(subset)
    let result = chartRate(totals.enrolled, totals.finished)
    if (!subset.length) result = { value: null, plotted: null, status: 'Sin cohortes en este período' }
    else if (subset.some(c => chartRate(c.enrolled, c.finished).status === 'Datos fuera de rango'))
      result = { ...result, plotted: null, status: 'Incluye cohortes con datos fuera de rango' }
    return { ...line, shortName: shortNames[index], ...totals, ...result }
  })
}

export function completionTrend(cohorts: Cohort[], line: LineId, year = '') {
  const points = chartCohorts(cohorts, year, line).slice().sort((a, b) =>
    a.number.localeCompare(b.number, 'es-AR', { numeric: true }) || a.year.localeCompare(b.year) || a.id.localeCompare(b.id)
  ).map(c => ({ ...c, label: `${c.number}.ª`, ...chartRate(c.enrolled, c.finished) }))
  return { points, kind: points.length >= 3 && points.filter(p => p.plotted !== null).length >= 3 ? 'line' as const : 'bar' as const }
}

export function rateDescription(point: ChartRate) {
  return point.status ? `${point.status}${point.value !== null && Number.isFinite(point.value) ? ` (${formatRate(point.value)})` : ''}` : formatRate(point.value)
}
