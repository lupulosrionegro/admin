import { auth, signIn } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
        <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', textAlign: 'center', maxWidth: 360, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>🌿</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f7', marginBottom: 4, letterSpacing: '-0.01em' }}>Lúpulos Río Negro</div>
          <div style={{ fontSize: 13, color: '#636366', marginBottom: 32, fontWeight: 400 }}>Panel de administración</div>
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/' })
            }}
          >
            <button type="submit" style={{ width: '100%', padding: '12px 20px', background: '#5fba7a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif", transition: 'all 0.15s' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Ingresar con Google
            </button>
          </form>
          <div style={{ marginTop: 16, fontSize: 11, color: '#636366' }}>Solo el email autorizado tiene acceso</div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
      <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', textAlign: 'center', maxWidth: 400, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>🌿</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#f5f5f7', marginBottom: 2, letterSpacing: '-0.01em' }}>Bienvenido</div>
        <div style={{ fontSize: 13, color: '#636366', marginBottom: 24 }}>{session.user?.email}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="https://qr.lupulosrionegro.com.ar/admin" style={{ width: '100%', padding: '12px 20px', background: '#5fba7a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            📦 Ir a trazabilidad (QR)
          </a>
          <a href="/admin" style={{ width: '100%', padding: '12px 20px', background: 'rgba(255,255,255,0.06)', color: '#f5f5f7', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            🗺 Ir a hileras
          </a>
        </div>
        <div style={{ marginTop: 20 }}>
          <form
            action={async () => {
              'use server'
              const { signOut } = await import('@/lib/auth')
              await signOut({ redirectTo: '/' })
            }}
          >
            <button type="submit" style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
