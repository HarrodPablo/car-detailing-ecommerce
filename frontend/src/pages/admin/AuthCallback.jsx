import { useEffect } from 'react';
import useAuthStore from '../../store/auth.store';

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      window.location.href = '/admin/login?error=no-autorizado';
      return;
    }

    try {
      // Decodificar el JWT para obtener el email (sin librería, atob básico)
      // El payload de un JWT es la segunda parte separada por punto
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      const user = { email: payload.email, role: payload.role };
      
      // Llamar al método del store para que persista en localStorage ('good-shop-auth')
      useAuthStore.getState().login(token, user);
      

      
      // Reload completo - ahora Zustand ya tiene el token persistido
      window.location.href = '/admin';
    } catch (e) {
      console.error('❌ Error decodificando o guardando token:', e);
      window.location.href = '/admin/login?error=no-autorizado';
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0A0A0A',
      color: 'white',
      gap: '16px'
    }}>
      <h2 style={{ fontSize: '1.25rem', color: '#8B0000', marginBottom: '1rem' }}>
        Autenticando con Google...
      </h2>
      <div style={{ 
        width: '4rem', 
        height: '4rem', 
        border: '4px solid #8B0000', 
        borderTopColor: 'transparent', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
