import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const COLORS = { cpu: '#3D8BFD', memory: '#A78BFA', disk: '#34D399' }

export default function MetricChart({ data, metricKey, label }) {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }))

  return (
    <div className="border border-border bg-panel/60 rounded-lg p-5">
      <p className="text-sm font-medium text-slate-300 mb-3">{label}</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={formatted}>
          <CartesianGrid stroke="#242B38" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: '#161B24',
              border: '1px solid #242B38',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey={metricKey}
            stroke={COLORS[metricKey]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
