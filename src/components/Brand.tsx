import { useState } from 'react'

export function Brand({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const [failed, setFailed] = useState(false)
  return <a className={compact ? 'brand brand-compact' : 'brand'} href="#/" onClick={onNavigate} aria-label="Medios Escolares Bonaerenses · Inicio">
    {!failed && <img src="/images/logo-meb.png" alt={compact ? '' : 'Medios Escolares Bonaerenses'} width="765" height="765" onError={() => setFailed(true)} />}
    {(compact || failed) && <span className="brand-name">Medios Escolares<span>Bonaerenses</span></span>}
  </a>
}
