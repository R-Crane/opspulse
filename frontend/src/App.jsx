import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ServerDetail from './pages/ServerDetail'
import Logs from './pages/Logs'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/servers/:id" element={<ServerDetail />} />
      <Route path="/logs" element={<Logs />} />
    </Routes>
  )
}
