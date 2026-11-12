import type { Modality, Unit } from '../../shared/model.ts'

export interface ModalityPoint { category: string; count: number }

export function modalityChartData(records: Modality[], cohortId: string, unit: Unit, region: number | null) {
  const selection = records.filter(m => m.cohortId === cohortId && m.unit === unit && m.region === region)
  const groups = new Map<string, Modality[]>()
  for (const row of selection) groups.set(row.category, [...(groups.get(row.category) ?? []), row])
  const points: ModalityPoint[] = []
  const duplicates: string[] = []
  let missing = 0
  for (const [category, rows] of groups) {
    // No duplicates exist in the current source. Without an additive dimension,
    // summing repeated categories could double-count: retain them only in the list.
    if (rows.length > 1) { duplicates.push(category); continue }
    const count = rows[0].count
    if (count === null || !Number.isFinite(count) || count < 0) { missing++; continue }
    points.push({ category, count })
  }
  points.sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'es-AR'))
  const present = new Set(selection.map(m => m.category))
  // General categories are a coverage reference only, never a source of regional counts.
  const absent = region !== null && records.some(m => m.cohortId === cohortId && m.unit === unit && m.region === null && !present.has(m.category))
  return { points, missing, duplicates, partial: missing > 0 || duplicates.length > 0 || absent, pending: points.length === 0 }
}
