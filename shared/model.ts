export const lines = [
  { id: 'acompanamiento', source: 'Acompañamiento', name: 'Acompañamiento a Escuelas', description: 'Proyectos de comunicación que crecen en la escuela.', color: 'var(--brand-magenta-ink)', icon: 'school' },
  { id: 'ensenar', source: 'Enseñar con medios', name: 'Enseñar con medios', description: 'Los medios como parte de la experiencia de enseñar.', color: 'var(--brand-turquoise-ink)', icon: 'book' },
  { id: 'taller', source: 'Taller de radios', name: 'Taller de radios', description: 'Herramientas para aprender y producir en radio.', color: 'var(--brand-blue)', icon: 'radio' },
  { id: 'liga', source: 'Liga de radios escolares', name: 'Liga de radios escolares', description: 'Voces y experiencias de nuestras radios escolares.', color: 'var(--brand-violet)', icon: 'mic' },
] as const
export type LineId = typeof lines[number]['id']
export type Unit = 'Docentes' | 'Escuelas'
export interface Metrics { enrolled: number | null; finished: number | null; certified: number | null; schools: number | null }
export interface Cohort extends Metrics { id: string; line: LineId; number: string; name: string; date: string; year: string; regionalState: string }
export interface Region { cohortId: string; region: number; enrolled: number | null; finished: number | null; schools: number | null; state: string }
export interface Modality { cohortId: string; unit: Unit; category: string; count: number | null; region: number | null }
export interface Dataset { cohorts: Cohort[]; regions: Region[]; modalities: Modality[]; syncedAt: string; source: 'live' | 'snapshot' }
export type Rows = (string | number | boolean | null)[][]
export type RawSheets = Record<string, Rows>
export const formatNumber = (n: number | null) => n === null ? 'Sin datos' : new Intl.NumberFormat('es-AR').format(n)
export const rate = (enrolled: number | null, finished: number | null) => enrolled !== null && enrolled > 0 && finished !== null ? finished / enrolled * 100 : null
export const formatRate = (n: number | null) => n === null ? 'Sin datos' : new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(n) + ' %'
export function aggregate(cohorts: Cohort[]) {
  const sum = (key: keyof Metrics) => { const values = cohorts.map(c => c[key]); return values.length && values.every(v => v !== null) ? values.reduce<number>((a, v) => a + (v ?? 0), 0) : null }
  return { enrolled: sum('enrolled'), finished: sum('finished'), certified: sum('certified'), schools: sum('schools') }
}

