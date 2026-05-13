"use client";
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status ?? 'loading'
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

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

  useEffect(() => { setMenuOpen(false) }, [pathname])

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

  const navLink = (href: string, label: string) => (
    <a href={href} style={{ color: '#98989d', textDecoration: 'none', fontWeight: 500, padding: '4px 6px', borderRadius: 6, fontSize: 12 }}>{label}</a>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f7', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
      <style>{`
        @media (max-width: 640px) {
          .admin-nav-links { display: none; }
          .admin-nav-toggle { display: flex !important; }
          .admin-nav-menu.open { display: flex !important; }
        }
      `}</style>
      <nav style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)', padding: '0 12px', height: 48, display: 'flex', alignItems: 'center', gap: 6 }}>
        <img src="/android-chrome-512x512.png" alt="Lúpulos" style={{ width: 20, height: 20, borderRadius: '50%', display: 'inline-block', objectFit: 'cover', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 12, color: '#f5f5f7', letterSpacing: '-0.01em', flexShrink: 0 }}>Hileras</span>
        <span style={{ fontSize: 9, color: '#98989d', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 20, border: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>Admin</span>
        <div className="admin-nav-links" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLink('/admin', 'Dashboard')}
          {navLink('/admin/hileras', 'Hileras')}
          {navLink('/admin/permisos', 'Permisos')}
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#98989d', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '4px 6px' }}>Salir</button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="admin-nav-toggle" style={{ display: 'none', marginLeft: 'auto', background: 'none', border: 'none', color: '#98989d', cursor: 'pointer', fontSize: 18, padding: '6px' }}>{menuOpen ? '✕' : '☰'}</button>
      </nav>
      <div className={`admin-nav-menu ${menuOpen ? 'open' : ''}`} style={{ display: 'none', flexDirection: 'column', background: 'rgba(28,28,30,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)', padding: '8px 12px', gap: 4 }}>
        <a href="/admin" style={{ color: '#98989d', textDecoration: 'none', padding: '8px 8px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Dashboard</a>
        <a href="/admin/hileras" style={{ color: '#98989d', textDecoration: 'none', padding: '8px 8px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Hileras</a>
        <a href="/admin/permisos" style={{ color: '#98989d', textDecoration: 'none', padding: '8px 8px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Permisos</a>
        <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#98989d', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '8px 8px', textAlign: 'left' }}>Salir</button>
      </div>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>{children}</div>
    </div>
  )
}
