import type { Dataset } from '../../shared/model'
export async function fetchData(snapshot = false): Promise<Dataset> {
  const response = await fetch(snapshot ? '/data/snapshot.json' : '/api/dashboard', { signal: AbortSignal.timeout(25000) })
  if (snapshot && !response.ok) throw new Error('La copia de consulta no está disponible en esta instalación. Configurá la conexión con Google Sheets.')
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('La API no está disponible. Usá Vercel Dev para conectar Google Sheets o abrí la copia de consulta.')
  const data = await response.json()
  if (!response.ok) throw new Error(data.message ?? 'No pudimos cargar los datos.')
  if (!Array.isArray(data.cohorts) || !Array.isArray(data.regions) || !Array.isArray(data.modalities) || !data.syncedAt) throw new Error('La respuesta de datos no tiene el formato esperado.')
  return data as Dataset
}

