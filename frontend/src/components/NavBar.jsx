import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-sm font-medium transition ${
    isActive ? 'bg-accent/15 text-accent' : 'text-slate-400 hover:text-white'
  }`

export default function NavBar() {
  return (
    <header className="border-b border-border bg-panel/60 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-display font-semibold text-lg tracking-tight">
          Ops<span className="text-accent">Pulse</span>
        </span>
        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/logs" className={linkClass}>
            Logs
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
