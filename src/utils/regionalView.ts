import type { LineId, Region } from '../../shared/model.ts'

export const EDUCATIONAL_REGIONS = 25
export const showsSchools = (line: LineId) => line === 'acompanamiento' || line === 'liga'

// Presentation only: preserve original amounts, including explicit zeroes.
export function regionalView(records: Region[], line: LineId, state: string) {
  const schools = showsSchools(line)
  const available = records.filter(r => r.state === 'Cargado' &&
    (r.enrolled !== null || r.finished !== null || (schools && r.schools !== null)))
  const covered = new Set(available.map(r => r.region)).size
  const incomplete = covered < EDUCATIONAL_REGIONS || state === 'Pendiente' ||
    available.some(r => r.enrolled === null || r.finished === null || (schools && r.schools === null))
  return { available, schools, covered, incomplete }
}
