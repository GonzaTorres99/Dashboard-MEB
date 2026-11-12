import { test } from 'node:test'
import assert from 'node:assert/strict'
import { adapt } from '../shared/adapter.ts'
import type { Cohort, RawSheets } from '../shared/model.ts'
import { chartRate, completionTrend, programComparison } from '../src/utils/chartData.ts'

const cohort = (overrides: Partial<Cohort> = {}): Cohort => ({ id: 'ACO-1', line: 'acompanamiento', number: '1', name: 'Primera', date: '', year: '2024', regionalState: '', enrolled: 100, finished: 80, certified: null, schools: null, ...overrides })

test('gráficos reciben solo cohortes publicadas y habilitadas del adaptador', () => {
  const raw: RawSheets = { COHORTES: [['ID'], ['A', 'Acompañamiento', 1, '', '', 2024, 'Publicada', 'SI'], ['B', 'Acompañamiento', 2, '', '', 2024, 'Borrador', 'SI'], ['C', 'Acompañamiento', 3, '', '', 2024, 'Publicada', 'NO']], RESULTADOS: [['ID'], ['A', '', '', '', '', 100, 80]], REGIONES: [['ID']], MODALIDADES: [['ID']], MODALIDADES_REGION: [['ID']] }
  const data = adapt(raw, '', 'live')
  assert.deepEqual(completionTrend(data.cohorts, 'acompanamiento').points.map(p => p.id), ['A'])
  assert.equal(programComparison(data.cohorts)[0].value, 80)
})
test('comparación usa tasa de sumas y ambos gráficos respetan año y línea', () => {
  const input = [cohort(), cohort({ id: '2', number: '2', enrolled: 900, finished: 180, year: '2025' }), cohort({ line: 'liga' })]
  assert.equal(programComparison(input)[0].value, 26)
  assert.equal(programComparison(input, '2024')[0].value, 80)
  assert.equal(completionTrend(input, 'acompanamiento', '2025').points.length, 1)
})
test('nulos no son cero ni se agregan tasas parciales', () => {
  assert.equal(programComparison([cohort(), cohort({ finished: null })])[0].plotted, null)
  assert.equal(chartRate(null, 20).plotted, null)
  assert.equal(chartRate(100, null).plotted, null)
  assert.equal(chartRate(100, 0).plotted, 0)
  assert.equal(chartRate(0, 0).plotted, null)
})
test('orden numérico estable, huecos conservados y entrada sin mutar', () => {
  const input = [cohort({ number: '10' }), cohort({ number: '2', finished: null }), cohort({ number: '1' }), cohort({ number: '3' })]
  const copy = structuredClone(input)
  const result = completionTrend(input, 'acompanamiento')
  assert.deepEqual(result.points.map(p => p.label), ['1.ª', '2.ª', '3.ª', '10.ª'])
  assert.equal(result.points[1].plotted, null)
  assert.equal(result.kind, 'line')
  assert.deepEqual(input, copy)
})
test('una o dos cohortes válidas no sugieren tendencia', () => {
  assert.equal(completionTrend([cohort()], 'acompanamiento').kind, 'bar')
  assert.equal(completionTrend([cohort(), cohort()], 'acompanamiento').kind, 'bar')
  assert.equal(completionTrend([cohort(), cohort({ finished: null }), cohort({ finished: null })], 'acompanamiento').kind, 'bar')
})
test('líneas ausentes y selección vacía quedan explícitas', () => {
  assert.equal(programComparison([cohort()])[1].status, 'Sin cohortes en este período')
  assert.ok(programComparison([], '2024').every(p => p.plotted === null))
  assert.deepEqual(completionTrend([], 'liga').points, [])
})
test('anomalías se informan sin truncar ni ocultarse en totales', () => {
  assert.equal(chartRate(100, 120).value, 120)
  assert.equal(chartRate(100, 120).plotted, null)
  for (const values of [[-10, 0], [10, -1], [0, 1], [Infinity, 1], [10, NaN]]) assert.equal(chartRate(values[0], values[1]).status, 'Datos fuera de rango')
  const result = programComparison([cohort({ finished: 120 }), cohort({ enrolled: 900, finished: 100 })])[0]
  assert.equal(result.value, 22)
  assert.equal(result.plotted, null)
  assert.match(result.status, /fuera de rango/)
})
