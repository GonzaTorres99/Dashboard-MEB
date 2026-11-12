import { lines, type Dataset, type RawSheets, type Rows, type Unit } from './model.ts'
const text = (v: unknown) => String(v ?? '').trim()
// API uses UNFORMATTED_VALUE: numeric cells arrive as numbers, independent of locale.
export const numeric = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : null
  const s = text(v)
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : null
}
export function adapt(raw: RawSheets, syncedAt: string, source: Dataset['source']): Dataset {
  for (const sheet of ['COHORTES', 'RESULTADOS', 'REGIONES', 'MODALIDADES', 'MODALIDADES_REGION']) {
    if (!raw[sheet]?.[0]?.[0] || !text(raw[sheet][0][0]).startsWith('ID')) throw new Error('Estructura de planilla inesperada: ' + sheet)
  }
  const rows = (sheet: string): Rows => raw[sheet].slice(1).filter(r => text(r[0]))
  const results = new Map(rows('RESULTADOS').map(r => [text(r[0]), r]))
  const cohorts: Dataset['cohorts'] = []
  const ids = new Set<string>()
  for (const r of rows('COHORTES')) {
    if (text(r[6]) !== 'Publicada' || text(r[7]) !== 'SI') continue
    const line = lines.find(l => l.source === text(r[1]))
    if (!line) throw new Error('Línea de trabajo no reconocida')
    const id = text(r[0]); if (ids.has(id)) throw new Error('ID de cohorte duplicado'); ids.add(id)
    const v = results.get(id) ?? []
    cohorts.push({ id, line: line.id, number: text(r[2]), name: text(r[3]), date: text(r[4]), year: text(r[5]), regionalState: text(r[8]), enrolled: numeric(v[5]), finished: numeric(v[6]), certified: numeric(v[7]), schools: numeric(v[8]) })
  }
  const regions = rows('REGIONES').filter(r => ids.has(text(r[0])) && numeric(r[1]) !== null).map(r => ({ cohortId: text(r[0]), region: Number(r[1]), enrolled: text(r[7]) === 'Cargado' ? numeric(r[2]) : null, finished: text(r[7]) === 'Cargado' ? numeric(r[3]) : null, schools: text(r[7]) === 'Cargado' ? numeric(r[4]) : null, state: text(r[7]) }))
  const modalities: Dataset['modalities'] = []
  for (const [sheet, regional] of [['MODALIDADES', false], ['MODALIDADES_REGION', true]] as const) {
    for (const r of rows(sheet)) {
      const offset = regional ? 1 : 0; const unit = text(r[1 + offset])
      if (!ids.has(text(r[0])) || !['Docentes', 'Escuelas'].includes(unit)) continue
      modalities.push({ cohortId: text(r[0]), unit: unit as Unit, category: text(r[2 + offset]), count: numeric(r[3 + offset]), region: regional ? numeric(r[1]) : null })
    }
  }
  return { cohorts, regions, modalities, syncedAt, source }
}
