import { useEffect, useState } from 'react'
import { LayoutDashboard, School, BookOpen, Radio, Mic, Menu, X, RefreshCw, ExternalLink, AlertCircle, CalendarDays } from 'lucide-react'
import { lines, type Dataset } from '../shared/model'
import { fetchData } from './services/data'
import { Dashboard } from './pages/Dashboard'

const icons = [School, BookOpen, Radio, Mic]
export default function App() {
  const [data,setData] = useState<Dataset | null>(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [route,setRoute] = useState(location.hash.slice(2))
  const [year,setYear] = useState('')
  const [menu,setMenu] = useState(false)
  const [logo,setLogo] = useState(true)
  const line = lines.find(l=>l.id===route)
  const validRoute = !route || Boolean(line)
  async function load(snapshot=false) {
    setLoading(true); setError('')
    try { setData(await fetchData(snapshot)) } catch(e) { setError(e instanceof Error ? e.message : 'Error de conexión') } finally { setLoading(false) }
  }
  useEffect(()=>{ let active = true; fetchData().then(value=>{if(active)setData(value)}).catch(e=>{if(active)setError(e instanceof Error ? e.message : 'Error de conexión')}).finally(()=>{if(active)setLoading(false)}); return ()=>{active=false} },[])
  useEffect(()=>{
    const change=()=>{setRoute(location.hash.slice(2));setYear('');setMenu(false)}
    window.addEventListener('hashchange',change)
    return ()=>window.removeEventListener('hashchange',change)
  },[])
  const years = [...new Set(data?.cohorts.filter(c=>!line || c.line===line.id).map(c=>c.year).filter(Boolean))].sort().reverse()
  return <div className="app-shell">
    <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();document.getElementById("main")?.focus()}}>Saltar al contenido</a>
    <header className="mobile-header"><span>Medios Escolares</span><button className="icon-button" aria-label={menu?'Cerrar menú':'Abrir menú'} aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
    <aside className={'sidebar '+(menu?'is-open':'')}>
      <div className="brand">{logo && <img src="/images/logo-meb.png" alt="Medios Escolares Bonaerenses" onError={()=>setLogo(false)}/>}<div>Medios<br/><strong>Escolares</strong><span>BONAERENSES</span></div></div>
      <div className="sidebar-rule"/>
      <p className="nav-label">ESTADÍSTICAS</p>
      <nav id="navigation" aria-label="Navegación principal">
        <a href="#/" aria-current={!route?'page':undefined}><LayoutDashboard size={19}/>Resumen general</a>
        <p className="nav-label">LÍNEAS DE TRABAJO</p>
        {lines.map((l,i)=>{const Icon=icons[i];return <a key={l.id} href={'#/'+l.id} aria-current={route===l.id?'page':undefined}><Icon size={19}/>{l.name}</a>})}
      </nav>
      <div className="sidebar-bottom"><span className="province-label">Provincia de Buenos Aires</span><p>Dirección General de Cultura y Educación</p><p>Dirección de Tecnología Educativa</p></div>
    </aside>
    <div className="workspace">
      <div className="topbar"><span>Medios Escolares <span className="separator">/</span> <strong>Resultados de formación</strong></span><a href="https://docs.google.com/spreadsheets/d/1AGn4zMEcx1gYJFXXXt0vuNm-uByVYGKgZ6pjpoN-EJo/edit" target="_blank" rel="noreferrer">Ver fuente <ExternalLink size={14}/></a></div>
      <main id="main" tabIndex={-1}>
        <div className="page-heading"><div><p className="eyebrow">EDUCACIÓN · COMUNICACIÓN · TERRITORIO</p><h1>{line?.name ?? 'Nuestro recorrido, en datos'}</h1><p>{line?.description ?? 'Conocé los resultados de las propuestas formativas de Medios Escolares Bonaerenses.'}</p></div><span className="edition">OBSERVATORIO<br/><strong>Medios Escolares</strong></span></div>
        <div className="toolbar"><div><h2>{line?'Resultados de la línea':'Resumen general'}</h2><span className="muted">Cohortes publicadas · {year || 'Todo el recorrido'}</span></div><div className="toolbar-actions"><label><CalendarDays size={16}/><span className="sr-only">Filtrar por año</span><select value={year} onChange={e=>setYear(e.target.value)}><option value="">Todos los años</option>{years.map(y=><option key={y}>{y}</option>)}</select></label><button disabled={loading} className="button" onClick={()=>void load()}><RefreshCw size={16} className={loading?'spinning':''}/>Actualizar</button></div></div>
        {error && <div className="error" role="alert"><AlertCircle size={22}/><div><strong>No se pudo sincronizar</strong><p>{error}</p><div className="error-actions"><button className="button" disabled={loading} onClick={()=>void load()}>Reintentar conexión</button><button className="text-button" disabled={loading} onClick={()=>void load(true)}>Ver copia de consulta</button></div></div></div>}
        {data && <div className={'source-status '+(data.source==='snapshot'?'snapshot':'')} role="status"><span className="status-dot"/><span>{data.source==='snapshot'?'Copia de consulta · sin conexión en vivo':'Última sincronización exitosa'}: {new Date(data.syncedAt).toLocaleString('es-AR',{timeZone:'America/Argentina/Buenos_Aires'})}{data.source==='snapshot'?' · Los cambios de la planilla no se actualizan en esta copia.':''}{error?' · Se conservan los últimos datos disponibles.':''}</span></div>}
        {loading && <div className="loading" role="status"><RefreshCw className="spinning"/> Consultando los datos…</div>}
        {!validRoute ? <div className="empty"><h2>Sección no encontrada</h2><a href="#/">Volver al resumen</a></div> : data && <Dashboard key={(line?.id??'overview')+year} data={data} lineId={line?.id??null} year={year}/>}
        {!data && !loading && <div className="empty"><h2>Tu recorrido está listo para consultar</h2><p>Conectá la fuente de datos o elegí la copia de consulta para explorar los resultados publicados.</p></div>}
        <footer>Medios Escolares Bonaerenses <span>Información educativa para seguir construyendo.</span></footer>
      </main>
    </div>
  </div>
}

