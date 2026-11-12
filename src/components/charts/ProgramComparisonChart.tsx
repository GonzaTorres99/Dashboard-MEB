import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatRate, type Cohort } from '../../../shared/model'
import { programComparison, rateDescription } from '../../utils/chartData'
import { ChartPanel } from './ChartPanel'
import { useTooltipTrigger } from './useTooltipTrigger'

export function ProgramComparisonChart({ cohorts, year }: { cohorts: Cohort[]; year: string }) {
  const data = programComparison(cohorts, year)
  const trigger = useTooltipTrigger()
  return <ChartPanel title="Tasa de finalización por línea" description="Porcentaje de inscripciones que finalizaron cada propuesta">
    {data.some(p => p.plotted !== null) ? <div className="chart-frame comparison-chart">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 52, bottom: 0, left: 0 }} accessibilityLayer>
          <CartesianGrid horizontal={false} stroke="var(--border-subtle)" strokeDasharray="3 3"/>
          <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={v => `${v} %`} tickLine={false} axisLine={false}/>
          <YAxis type="category" dataKey="shortName" width={138} tickLine={false} axisLine={false}/>
          <Tooltip trigger={trigger} isAnimationActive={false} cursor={{ fill: 'var(--surface-workspace)' }} content={({ active, label }) => {
            const point = data.find(p => p.shortName === label)
            return active && point ? <div className="chart-tooltip" role="status"><strong>{point.name}</strong><p>{rateDescription(point)}</p></div> : null
          }}/>
          <Bar dataKey="plotted" barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map(p => <Cell key={p.id} fill={p.color}/>)}
            <LabelList dataKey="plotted" position="right" formatter={v => typeof v === 'number' ? formatRate(v) : ''} fill="var(--brand-blue)"/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div> : <p className="chart-empty">Sin tasas válidas para este período.</p>}
    <details className="chart-data"><summary>Consultar valores por línea</summary><dl>{data.map(p => <div key={p.id}><dt>{p.name}</dt><dd>{rateDescription(p)}</dd></div>)}</dl></details>
    {data.some(p => p.status) && <p className="footnote">{data.filter(p => p.status).map(p => `${p.name}: ${rateDescription(p)}.`).join(' ')}</p>}
  </ChartPanel>
}
