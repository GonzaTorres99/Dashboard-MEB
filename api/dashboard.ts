import { JWT } from 'google-auth-library'
import { adapt } from '../shared/adapter.ts'
import type { Dataset, Rows } from '../shared/model.ts'
let cache: Dataset | undefined
let pending: Promise<Dataset> | undefined
const TTL = 60_000
const ranges = ['COHORTES!A5:L', 'RESULTADOS!A5:I', 'REGIONES!A5:I', 'MODALIDADES!A5:D', 'MODALIDADES_REGION!A5:E']
export async function GET() {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY
  const headers = { 'Cache-Control': 'no-store' }
  if (!id || !email || !key) return Response.json({ code: 'NOT_CONFIGURED', message: 'La conexión con Google Sheets todavía no está configurada.' }, { status: 503, headers })
  try {
    if (!cache || Date.now() - Date.parse(cache.syncedAt) >= TTL) {
      pending ??= (async () => {
        const auth = new JWT({ email, key: key.replace(/\\n/g, '\n'), scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] })
        const url = new URL('https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(id) + '/values:batchGet')
        ranges.forEach(range => url.searchParams.append('ranges', range))
        url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE')
        url.searchParams.set('dateTimeRenderOption', 'FORMATTED_STRING')
        const response = await auth.request<{ valueRanges: { values?: Rows }[] }>({ url: url.toString(), method: 'GET', timeout: 15_000, retry: false })
        return adapt(Object.fromEntries(ranges.map((range, i) => [range.split('!')[0], response.data.valueRanges[i]?.values ?? []])), new Date().toISOString(), 'live')
      })()
      try { cache = await pending } finally { pending = undefined }
    }
    return Response.json(cache, { headers })
  } catch {
    return Response.json({ code: 'UPSTREAM_ERROR', message: 'No pudimos consultar Google Sheets. Intentá nuevamente en unos momentos.' }, { status: 502, headers })
  }
}
