import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Bell, CheckCircle2, CirclePlus, Clock3, Coffee, Command, LayoutDashboard, MapPin, Moon, Search, SlidersHorizontal, Sparkles, Sun, UsersRound, UtensilsCrossed, X } from 'lucide-react'
import { useTheme } from './contexts/ThemeContext'
import { useOrdersReducer } from './hooks/useOrdersReducer'
import OrderTable from './components/OrderTable'

const filters = ['Todos', 'Nuevo', 'En barra', 'Listo']

const menuItems = [
  { name: 'Flat white de altura', detail: 'Doble espresso, leche texturizada', price: 14.5, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85', tag: 'Más pedido' },
  { name: 'Cold brew tonic', detail: 'Cítrico, burbuja fina, mucho hielo', price: 16, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85', tag: 'Refrescante' },
  { name: 'Matcha ceremonial', detail: 'Uji, avena y vainilla de Madagascar', price: 15, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=900&q=85', tag: 'De temporada' },
  { name: 'Croissant de almendras', detail: 'Mantequilla francesa y praliné', price: 9.5, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85', tag: 'Horneado hoy' },
]

function App() {
  const { theme, toggleTheme } = useTheme()
  const [{ orders, filter, sortBy }, dispatch] = useOrdersReducer()
  const [page, setPage] = useState('operations')
  const [isComposerOpen, setComposerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isSynced, setSynced] = useState(true)
  const [isOnDuty, setOnDuty] = useState(true)
  const inputRef = useRef(null)
  const syncTimerRef = useRef(null)
  const nextOrderIdRef = useRef(1043)

  useEffect(() => {
    if (!isComposerOpen) return undefined
    inputRef.current?.focus()
    return () => inputRef.current?.blur()
  }, [isComposerOpen])

  useEffect(() => {
    setSynced(false)
    window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(() => setSynced(true), 700)
    return () => window.clearTimeout(syncTimerRef.current)
  }, [orders])

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return orders
      .filter((order) => filter === 'Todos' || order.status === filter)
      .filter((order) => !normalizedQuery || `${order.guest} ${order.drink} ${order.id}`.toLowerCase().includes(normalizedQuery))
      .toSorted((a, b) => (sortBy === 'total' ? b.total - a.total : b.id.localeCompare(a.id)))
  }, [orders, filter, query, sortBy])

  const stats = useMemo(() => ({
    revenue: orders.reduce((total, order) => total + order.total, 0),
    active: orders.filter((order) => order.status !== 'Listo').length,
    ready: orders.filter((order) => order.status === 'Listo').length,
  }), [orders])

  const setFilter = useCallback((nextFilter) => dispatch({ type: 'SET_FILTER', payload: nextFilter }), [])
  const advanceOrder = useCallback((id) => dispatch({ type: 'ADVANCE_STATUS', payload: id }), [])
  const removeOrder = useCallback((id) => dispatch({ type: 'REMOVE_ORDER', payload: id }), [])
  const createOrder = useCallback((guest, drink, total, channel = 'Salón') => {
    const id = `BR-${nextOrderIdRef.current}`
    nextOrderIdRef.current += 1
    dispatch({ type: 'ADD_ORDER', payload: { id, guest, drink, time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }), status: 'Nuevo', total, channel } })
  }, [])
  const addOrder = useCallback((event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const guest = form.get('guest').trim()
    const drink = form.get('drink').trim()
    if (!guest || !drink) return
    createOrder(guest, drink, Number(form.get('total')) || 12, form.get('channel'))
    setComposerOpen(false)
  }, [createOrder])
  const addMenuItem = useCallback((item) => {
    createOrder('Cliente de barra', item.name, item.price, 'Para llevar')
    setPage('operations')
  }, [createOrder])

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Bruma inicio"><span><Coffee size={21} /></span><b>BRUMA</b><em>café de origen</em></a>
        <nav>
          <button className={page === 'operations' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('operations')}><LayoutDashboard size={19} /> Operaciones</button>
          <button className={page === 'menu' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('menu')}><UtensilsCrossed size={19} /> Carta del día</button>
          <button className={page === 'team' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('team')}><UsersRound size={19} /> Equipo</button>
        </nav>
        <div className="sidebar-footer"><span className="avatar">RH</span><div><b>Renzo Hinojosa</b><small>Barista principal</small></div></div>
      </aside>

      <section className="content" id="top">
        <header className="topbar"><div className="mobile-brand"><Coffee size={19} /> BRUMA</div><p><span className={isSynced ? 'sync-dot' : 'sync-dot syncing'} />{isSynced ? 'Todo sincronizado' : 'Sincronizando...'}</p><div className="header-actions"><button className="icon-button" aria-label="Notificaciones"><Bell size={19} /></button><button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button></div></header>

        {page === 'operations' && <><div className="page-heading"><div><p className="eyebrow">MIÉRCOLES, 15 OCTUBRE</p><h1>Buen día, Renzo <span>✦</span></h1><p className="subtitle">El ritmo de la barra está en su punto.</p></div><button className="primary-button" onClick={() => setComposerOpen(true)}><CirclePlus size={18} /> Nuevo pedido</button></div>

        <section className="metrics" aria-label="Resumen de hoy">
          <article><span className="metric-icon amber"><Command size={20} /></span><p>Ventas del turno</p><strong>S/ {stats.revenue.toFixed(2)}</strong><small>+12.4% <b>vs. martes</b></small></article>
          <article><span className="metric-icon rose"><Coffee size={20} /></span><p>En preparación</p><strong>{stats.active}</strong><small><b>pedidos activos</b></small></article>
          <article><span className="metric-icon green"><Sparkles size={20} /></span><p>Listos para servir</p><strong>{stats.ready}</strong><small><b>sin esperas</b></small></article>
        </section>

        <section className="orders-card" id="pedidos">
          <div className="section-header"><div><h2>Flujo de pedidos</h2><p>{visibleOrders.length} pedidos visibles · turno mañana</p></div><div className="tools"><label className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pedido" /></label><button className="sort-button" onClick={() => dispatch({ type: 'SET_SORT', payload: sortBy === 'recent' ? 'total' : 'recent' })}><SlidersHorizontal size={16} />{sortBy === 'recent' ? 'Más recientes' : 'Mayor total'}</button></div></div>
          <div className="filter-row">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'filter active' : 'filter'}>{item}</button>)}</div>
          <OrderTable orders={visibleOrders} onAdvance={advanceOrder} onRemove={removeOrder} />
        </section>
        </>}

        {page === 'menu' && <MenuPage onAdd={addMenuItem} />}
        {page === 'team' && <TeamPage isOnDuty={isOnDuty} onToggleDuty={() => setOnDuty((current) => !current)} />}
      </section>

      {isComposerOpen && <div className="modal-backdrop" role="presentation"><form className="composer" onSubmit={addOrder}><button className="close" type="button" onClick={() => setComposerOpen(false)} aria-label="Cerrar"><X size={19} /></button><div className="composer-mark"><Coffee size={23} /></div><p className="eyebrow">NUEVA COMANDA</p><h2>Que empiece la molienda.</h2><label>Nombre del cliente<input ref={inputRef} name="guest" placeholder="Ej. Camila Torres" required /></label><label>Pedido<input name="drink" placeholder="Ej. Flat white con leche de almendras" required /></label><div className="form-grid"><label>Total (S/)<input name="total" type="number" min="1" step="0.5" defaultValue="12" /></label><label>Canal<select name="channel" defaultValue="Salón"><option>Salón</option><option>Para llevar</option></select></label></div><button className="primary-button full" type="submit"><CirclePlus size={18} /> Crear pedido</button></form></div>}
    </main>
  )
}

export default App

function MenuPage({ onAdd }) {
  return <><div className="page-heading menu-heading"><div><p className="eyebrow">SELECCIÓN DE LA CASA</p><h1>Carta del día <span>✦</span></h1><p className="subtitle">Pequeños lotes, ingredientes honestos y una pausa bien hecha.</p></div><span className="menu-date"><Clock3 size={16} /> Disponible hoy</span></div><section className="menu-grid" id="menu">{menuItems.map((item) => <article className="menu-card" key={item.name}><img src={item.image} alt={item.name} /><div className="menu-card-body"><span className="menu-tag">{item.tag}</span><h2>{item.name}</h2><p>{item.detail}</p><div><strong>S/ {item.price.toFixed(2)}</strong><button onClick={() => onAdd(item)} aria-label={`Agregar ${item.name}`}><CirclePlus size={17} /> Agregar</button></div></div></article>)}</section><section className="menu-note"><Coffee size={21} /><div><b>¿Una recomendación?</b><p>El flat white de altura y el croissant de almendras están pensados para acompañarse.</p></div><ArrowUpRight size={18} /></section></>
}

function TeamPage({ isOnDuty, onToggleDuty }) {
  return <><div className="page-heading team-heading"><div><p className="eyebrow">COORDINACIÓN DE TURNO</p><h1>Equipo de barra <span>✦</span></h1><p className="subtitle">El servicio se construye en conjunto, taza por taza.</p></div><button className={isOnDuty ? 'duty-button active' : 'duty-button'} onClick={onToggleDuty}>{isOnDuty ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}{isOnDuty ? 'En turno' : 'Marcar entrada'}</button></div><section className="team-layout" id="equipo"><article className="team-profile"><span className="profile-avatar">RH</span><div><p className="eyebrow">BARISTA PRINCIPAL</p><h2>Renzo Hinojosa</h2><p className="team-muted"><MapPin size={15} /> Barra central · estación 02</p></div><span className={isOnDuty ? 'attendance live' : 'attendance'}>{isOnDuty ? 'Disponible' : 'Fuera de turno'}</span></article><article className="team-card"><p className="eyebrow">PULSO DEL TURNO</p><strong>08:00 — 14:00</strong><p>4 pedidos activos · extracción promedio: 27 s</p><div className="progress"><i /></div></article><article className="team-card"><p className="eyebrow">MICRO-OBJETIVO</p><strong>Servicio fluido</strong><p>Prioriza pedidos con espera mayor a 8 minutos antes de abrir una nueva comanda.</p></article></section></>
}
