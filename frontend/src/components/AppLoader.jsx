import { useEffect, useState } from 'react'
import logoImg from '../assets/goodshop.svg'

const API_URL = import.meta.env.VITE_API_URL

export function AppLoader({ children }) {
  const [ready, setReady]       = useState(false)
  const [progress, setProgress] = useState(0)
  const [slow, setSlow]         = useState(false)

  useEffect(() => {
    // Warm-up: despertar el backend apenas entra el usuario
    const controller = new AbortController()
    
    fetch(`${API_URL}/health`, { signal: controller.signal })
      .then(() => setReady(true))
      .catch(() => setReady(true)) // si falla igual mostrar la app

    // Aviso de "esto puede tardar" si pasan 4 segundos sin respuesta
    const slowTimer = setTimeout(() => setSlow(true), 4000)

    // Barra de progreso animada independiente del fetch real
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 88) { clearInterval(interval); return 88 }
        return p + Math.random() * 12
      })
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(slowTimer)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (ready) {
      setProgress(100)
      // pequeño delay para que se vea el 100% antes de desaparecer
      const t = setTimeout(() => {}, 400)
      return () => clearTimeout(t)
    }
  }, [ready])

  // Solo mostrar el loader en el primer render de la sesión
  // Si el backend ya respondió rápido (<300ms), saltar el loader
  if (ready && progress < 30) return children

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col 
                      items-center justify-center z-[9999]">
        
        {/* Logo */}
        <img 
          src={logoImg} 
          alt="Good Shop" 
          className="h-14 brightness-0 invert mb-10 opacity-90" 
        />

        {/* Barra de progreso */}
        <div className="w-48 h-[2px] bg-[#1a1a1a] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#8B0000] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mensaje */}
        <p className="text-[#444] text-[11px] tracking-[3px] uppercase font-mono">
          {slow ? 'Iniciando servidor...' : 'Cargando...'}
        </p>

        {/* Aviso de demora si es lento */}
        {slow && (
          <p className="text-[#333] text-[10px] mt-2 font-mono">
            Esto puede tomar unos segundos
          </p>
        )}
      </div>
    )
  }

  return children
}
