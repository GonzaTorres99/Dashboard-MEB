import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { lines, formatNumber, type Cohort, type LineId } from '../../../shared/model'
import { completionTrend, rateDescription } from '../../utils/chartData'
import { ChartPanel } from './ChartPanel'
import { useTooltipTrigger } from './useTooltipTrigger'

export function CompletionTrendChart({ cohorts, lineId, year }: { cohorts: Cohort[]; lineId: LineId; year: string }) {
  const { points, kind } = completionTrend(cohorts, lineId, year)
  const color = lines.find(l => l.id === lineId)!.color
  const trigger = useTooltipTrigger()
  return <ChartPanel title="Tasa de finalización por cohorte" description="Resultados por cohorte, ordenados por número. Escala de 0 a 100 %.">
    {points.some(p => p.plotted !== null) ? <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart data={points} margin={{ top: 10, right: 12, bottom: 0, left: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3"/>
          <XAxis dataKey="id" tickFormatter={id => points.find(p => p.id === id)?.label ?? id} tickLine={false} axisLine={false} minTickGap={16}/>
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} width={48} tickFormatter={v => `${v} %`} tickLine={false} axisLine={false}/>
          <Tooltip trigger={trigger} isAnimationActive={false} content={({ active, label }) => {
            const point = points.find(p => p.id === label)
            return active && point ? <div className="chart-tooltip" role="status"><strong>{point.label} cohorte · {point.year || 'Año sin datos'}</strong><p>Inscriptos: {formatNumber(point.enrolled)}<br/>Finalizaron: {formatNumber(point.finished)}<br/>{rateDescription(point)}</p></div> : null
          }}/>
          {kind === 'line' ? <Line type="linear" dataKey="plotted" stroke={color} strokeWidth={2} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} connectNulls={false} isAnimationActive={false}/> : <Bar dataKey="plotted" fill={color} maxBarSize={36} radius={[4, 4, 0, 0]} isAnimationActive={false}/>}
        </ComposedChart>
      </ResponsiveContainer>
    </div> : <p className="chart-empty">Sin tasas válidas para este período.</p>}
    <p className="footnote">{kind === 'bar' ? 'Resultados individuales; no se representa una tendencia. ' : ''}Consultá los valores completos en las cohortes de abajo. Tocá un resultado o usá Tab y las flechas para consultarlo.</p>
    {points.some(p => p.status) && <p className="footnote">No se grafican: {points.filter(p => p.status).map(p => `${p.label}: ${rateDescription(p)}`).join('; ')}.</p>}
  </ChartPanel>
}
