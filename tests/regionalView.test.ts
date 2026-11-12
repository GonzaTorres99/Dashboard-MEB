import { test } from 'node:test'
import assert from 'node:assert/strict'
import { regionalView } from '../src/utils/regionalView.ts'
import type { Region } from '../shared/model.ts'
const record: Region = { cohortId: 'test', region: 1, enrolled: null, finished: null, schools: null, state: 'Pendiente' }
test('regiones pendientes o cargadas sin valores no generan filas vacías', () => {
  assert.equal(regionalView([record, { ...record, state: 'Cargado' }], 'acompanamiento', 'Pendiente').available.length, 0)
})
test('el cero cargado es visible; campos faltantes marcan información parcial', () => {
  const view = regionalView([{ ...record, state: 'Cargado', enrolled: 0 }], 'ensenar', 'Con registros')
  assert.equal(view.available[0].enrolled, 0)
  assert.equal(view.incomplete, true)
  assert.equal(view.schools, false)
})
test('las columnas y completitud dependen de la unidad de la línea', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ ...record, region: i + 1, state: 'Cargado', enrolled: 0, finished: 0 }))
  assert.equal(regionalView(rows, 'taller', 'Con registros').incomplete, false)
  assert.equal(regionalView(rows, 'liga', 'Con registros').incomplete, true)
  assert.equal(regionalView(rows, 'liga', 'Con registros').schools, true)
})
