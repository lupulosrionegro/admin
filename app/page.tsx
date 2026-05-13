import { auth } from '@/lib/auth'
import LoginButton from '@/components/LoginButton'
import SignOutButton from '@/components/SignOutButton'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
        <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', textAlign: 'center', maxWidth: 360, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          <div><img src="/android-chrome-512x512.png" alt="Lúpulos" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'inline-block' }} /></div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f7', marginBottom: 4, letterSpacing: '-0.01em' }}>Lúpulos Río Negro</div>
          <div style={{ fontSize: 13, color: '#636366', marginBottom: 32, fontWeight: 400 }}>Panel de administración</div>
          <LoginButton />
          <div style={{ marginTop: 16, fontSize: 11, color: '#636366' }}>Solo el email autorizado tiene acceso</div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
      <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', textAlign: 'center', maxWidth: 400, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div><img src="/android-chrome-512x512.png" alt="Lúpulos" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'inline-block' }} /></div>
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
          <SignOutButton />
        </div>
      </div>
    </main>
  )
}
