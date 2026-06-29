import { useEffect, useState, useCallback } from 'react'
import logoImg from '../assets/goodshop_logo.svg'

const API_URL = import.meta.env.VITE_API_URL

export function AppLoader({ children }) {
  const [ready, setReady] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [failed, setFailed] = useState(false)
  
  const MAX_ATTEMPTS = 40;

  const pingServer = useCallback(async (currentAttempt) => {
    if (currentAttempt >= MAX_ATTEMPTS) {
      setFailed(true);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        if (currentAttempt > 0) {
          // Si estaba en cold start y despertó, recargamos la página
          window.location.reload();
        } else {
          // Si respondió instantáneamente a la primera, quitamos el loader
          setReady(true);
        }
        return;
      }
    } catch (error) {
      clearTimeout(timeoutId);
    }

    // Si falló, intentar de nuevo en 3 segundos
    setTimeout(() => {
      setAttempts(prev => prev + 1);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!failed && !ready) {
      pingServer(attempts);
    }
  }, [attempts, failed, ready, pingServer]);

  // Si respondió instantáneamente sin intentos extra
  if (ready && attempts === 0) return children;

  // Si ya respondió y estamos esperando el reload
  if (ready) return null; 

  const progress = Math.min((attempts / MAX_ATTEMPTS) * 100, 95);

  let message = "Iniciando servidor...";
  if (attempts >= 5 && attempts < 10) {
    message = "Esto puede tomar unos segundos...";
  } else if (attempts >= 10 && attempts < 20) {
    message = "Casi listo, el servidor está despertando...";
  } else if (attempts >= 20) {
    message = "Tardando más de lo usual, por favor espera...";
  }

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center z-[9999] px-4">
      
      {/* Logo */}
      <img 
        src={logoImg} 
        alt="Good Shop" 
        className="h-14 brightness-0 invert mb-10 opacity-90" 
      />

      {!failed ? (
        <>
          {/* Barra de progreso */}
          <div className="w-48 md:w-64 h-[2px] bg-[#1a1a1a] rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[#8B0000] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Mensaje */}
          <p className="text-[#888] text-[11px] tracking-[3px] uppercase font-mono text-center max-w-[300px]">
            {message}
          </p>
          <p className="text-[#333] text-[9px] mt-3 font-mono">
            INTENTO {attempts + 1} DE {MAX_ATTEMPTS}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center text-center">
          <p className="text-[#8B0000] text-sm tracking-widest uppercase font-mono font-bold mb-6">
            El servidor tardó demasiado en responder
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                setFailed(false);
                setAttempts(0);
              }}
              className="px-6 py-2.5 bg-[#8B0000] text-white hover:bg-[#a00000] rounded transition-colors font-sans text-sm tracking-wider uppercase"
            >
              Reintentar
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="text-[#666] hover:text-white transition-colors text-xs uppercase tracking-widest"
            >
              Ir al sitio de todas formas
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
