import { useEffect, useState } from 'react'

export function useTooltipTrigger() {
  const [touch, setTouch] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setTouch(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return touch ? 'click' as const : 'hover' as const
}
