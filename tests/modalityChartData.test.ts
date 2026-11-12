import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Modality } from '../shared/model.ts'
import { modalityChartData } from '../src/utils/modalityChartData.ts'

const row = (overrides: Partial<Modality> = {}): Modality => ({ cohortId: 'ACO-06', unit: 'Docentes', region: null, category: 'Nivel primario', count: 12, ...overrides })

test('modalidades filtra cohorte y unidad; general no se recalcula desde regiones', () => {
  const records = [row(), row({ cohortId: 'ACO-11', count: 99 }), row({ unit: 'Escuelas', count: 3 }), row({ region: 1, count: 7 }), row({ region: 2, count: 8 })]
  assert.deepEqual(modalityChartData(records, 'ACO-06', 'Docentes', null).points, [{ category: 'Nivel primario', count: 12 }])
  assert.equal(modalityChartData(records, 'ACO-06', 'Escuelas', null).points[0].count, 3)
  assert.equal(modalityChartData(records, 'ACO-06', 'Docentes', 1).points[0].count, 7)
  assert.equal(modalityChartData(records, 'ACO-11', 'Docentes', null).points[0].count, 99)
})
test('región sin registros o con todos los valores nulos queda pendiente sin fallback', () => {
  const records = [row(), row({ region: 1, count: null })]
  for (const region of [1, 2]) {
    const result = modalityChartData(records, 'ACO-06', 'Docentes', region)
    assert.equal(result.pending, true)
    assert.deepEqual(result.points, [])
  }
})
test('ceros válidos se conservan y nulos no se convierten en cero', () => {
  const result = modalityChartData([row({ count: 0 }), row({ category: 'CFI', count: null })], 'ACO-06', 'Docentes', null)
  assert.deepEqual(result.points, [{ category: 'Nivel primario', count: 0 }])
  assert.equal(result.pending, false)
  assert.equal(result.partial, true)
})
test('orden descendente con desempate alfabético, nombres completos y sin mutaciones', () => {
  const records = [row({ category: 'Psicología Comunitaria y Pedagogía Social (CEC)', count: 1 }), row({ category: 'CSC', count: 5 }), row({ category: 'CFI', count: 5 }), row({ category: 'Nivel inicial', count: 8 })]
  const copy = structuredClone(records)
  const result = modalityChartData(records, 'ACO-06', 'Docentes', null)
  assert.deepEqual(result.points.map(p => p.category), ['Nivel inicial', 'CFI', 'CSC', 'Psicología Comunitaria y Pedagogía Social (CEC)'])
  assert.deepEqual(records, copy)
})
test('región parcial conserva valores y detecta categorías ausentes sin copiar generales', () => {
  const records = [row(), row({ category: 'CFI', count: 4 }), row({ region: 1, count: 7 })]
  const result = modalityChartData(records, 'ACO-06', 'Docentes', 1)
  assert.equal(result.partial, true)
  assert.deepEqual(result.points, [{ category: 'Nivel primario', count: 7 }])
})
test('categorías repetidas no se suman sin evidencia; denominaciones distintas no se mezclan', () => {
  const records = [row(), row(), row({ category: 'Educación Artística', count: 4 }), row({ category: 'Nivel Secundario (Artística)', count: 2 })]
  const result = modalityChartData(records, 'ACO-06', 'Docentes', null)
  assert.deepEqual(result.duplicates, ['Nivel primario'])
  assert.equal(result.points.length, 2)
  assert.equal(result.partial, true)
})
test('valores inválidos no se grafican; selección vacía es pendiente', () => {
  for (const count of [NaN, Infinity, -1]) assert.equal(modalityChartData([row({ count })], 'ACO-06', 'Docentes', null).pending, true)
  assert.equal(modalityChartData([], 'ACO-06', 'Escuelas', null).pending, true)
})
