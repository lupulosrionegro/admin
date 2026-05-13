"use client";
import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status ?? 'loading'
  const router = useRouter()
  const pathname = usePathname()

  const isFullScreen = pathname?.startsWith('/admin/hileras')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/admin/login')
    }
  }, [session, status, router])

  const handleSignOut = () => {
    signOut()
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#5fba7a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636366', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif", fontSize: 13 }}>
        Redirigiendo al login...
      </div>
    )
  }

  if (isFullScreen) {
    return <>{children}</>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
      <nav style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/android-chrome-512x512.png" alt="Lúpulos" style={{ width: 22, height: 22, borderRadius: '50%', display: 'inline-block', objectFit: 'cover' }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: '#f5f5f7', letterSpacing: '-0.01em' }}>Hileras</span>
          <span style={{ fontSize: 10, color: '#98989d', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 20, border: '0.5px solid rgba(255,255,255,0.08)' }}>Admin</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20, fontSize: 13 }}>
          <a href="/admin" style={{ color: '#98989d', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}>Dashboard</a>
          <a href="/admin/hileras" style={{ color: '#98989d', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}>Hileras</a>
          <a href="/admin/permisos" style={{ color: '#98989d', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}>Permisos</a>
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#98989d', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}>Salir</button>
        </div>
      </nav>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>{children}</div>
    </div>
  )
}
