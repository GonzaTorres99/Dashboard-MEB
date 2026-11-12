import { useId, useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Text, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber, type Modality, type Unit } from '../../../shared/model'
import { modalityChartData } from '../../utils/modalityChartData'
import { useTooltipTrigger } from './useTooltipTrigger'

function CategoryTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return <Text x={x - 8} y={y} width={140} maxLines={3} textAnchor="end" verticalAnchor="middle" fill="var(--text-muted)" fontSize={12}>{payload?.value ?? ''}</Text>
}

export function ModalityChart({ records, cohortId, unit, region }: { records: Modality[]; cohortId: string; unit: Unit; region: number | null }) {
  const { points, partial, pending, duplicates } = modalityChartData(records, cohortId, unit, region)
  const [expanded, setExpanded] = useState(false)
  const [tooltipHost, setTooltipHost] = useState<HTMLDivElement | null>(null)
  const titleId = useId()
  const plotId = useId()
  const trigger = useTooltipTrigger()
  const visible = expanded ? points : points.slice(0, 5)
  const scope = region === null ? 'Todas · desglose general' : `Región ${region}`
  return <section className="modality-chart" aria-labelledby={titleId}>
    <h3 id={titleId}>Distribución de {unit.toLowerCase()} por nivel educativo</h3>
    <p className="muted">{scope}. Cantidades absolutas por nivel o modalidad.</p>
    {pending ? <p className="chart-empty" role="status">{region === null ? 'Todavía no hay cantidades disponibles para este desglose general.' : 'Todavía no hay datos de modalidades para esta región.'}</p> : <>
      {partial && <p className="footnote" role="status">Distribución posiblemente incompleta: se muestran únicamente las cantidades disponibles, sin completar categorías faltantes.</p>}
      <div className="modality-tooltip-host" ref={setTooltipHost}/>
      <div id={plotId} className="modality-chart-scroll" tabIndex={expanded ? 0 : undefined} role="region" aria-label="Gráfico de modalidades; desplazamiento vertical al ver todas">
        <div className="chart-frame" style={{ height: Math.max(280, visible.length * 54 + 36) }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={visible} layout="vertical" accessibilityLayer margin={{ top: 8, right: 40, bottom: 0, left: 0 }}>
              <CartesianGrid horizontal={false} stroke="var(--border-subtle)" strokeDasharray="3 3"/>
              <XAxis type="number" domain={[0, 'auto']} allowDecimals={false} tickFormatter={formatNumber} tickLine={false} axisLine={false}/>
              <YAxis type="category" dataKey="category" width={150} interval={0} tick={<CategoryTick/>} tickLine={false} axisLine={false}/>
              <Tooltip portal={tooltipHost ?? undefined} position={{ x: 0, y: 0 }} trigger={trigger} isAnimationActive={false} cursor={{ fill: 'var(--surface-workspace)' }} content={({ active, label }) => {
                const point = visible.find(p => p.category === label)
                return active && point ? <div className="chart-tooltip" role="status"><strong>{point.category}</strong><p>{unit}: {formatNumber(point.count)}<br/>{scope}</p></div> : null
              }}/>
              <Bar dataKey="count" fill="var(--brand-magenta-ink)" barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                <LabelList dataKey="count" position="right" formatter={v => typeof v === 'number' ? formatNumber(v) : ''} fill="var(--brand-blue)"/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {points.length > 5 && <button className="text-button" aria-expanded={expanded} aria-controls={plotId} onClick={() => setExpanded(!expanded)}>{expanded ? 'Ver solo las cinco principales' : `Ver todas las categorías (${points.length})`}</button>}
      <p className="footnote">Se muestran {visible.length} de {points.length} categorías con cantidad informada. Los ceros son valores válidos; las categorías sin datos no se grafican. Los nombres completos y los valores originales permanecen en el listado.</p>
    </>}
    {duplicates.length > 0 && <p className="footnote">Categorías repetidas pendientes de revisión, sin sumar ni graficar: {duplicates.join('; ')}.</p>}
  </section>
}
