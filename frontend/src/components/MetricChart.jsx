import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export default function MetricChart({ data, metricKey = 'responseTimeMs', label = 'Response time (ms)', color = '#3D8BFD' }) {
  const formatted = data
    .filter((d) => d[metricKey] != null)
    .map((d) => ({
      ...d,
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }))

  return (
    <div className="border border-border bg-panel/60 rounded-lg p-5">
      <p className="text-sm font-medium text-slate-300 mb-3">{label}</p>
      {formatted.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">No checks recorded yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={formatted}>
            <CartesianGrid stroke="#242B38" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#161B24',
                border: '1px solid #242B38',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey={metricKey} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
