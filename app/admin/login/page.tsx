import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginButton from '@/components/LoginButton'

interface LoginPageProps {
  searchParams?: Promise<{
    error?: string
  }>
}

export const viewport = { width: 'device-width', initialScale: 1 }

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()
  if (session) redirect('/admin')

  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error
  const errorMessage =
    error === 'AccessDenied'
      ? 'Tu cuenta no esta autorizada como admin.'
      : error
        ? 'No se pudo iniciar sesion. Revisa configuracion de Google y variables.'
        : null

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
      <div style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', textAlign: 'center', maxWidth: 360, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div><img src="/android-chrome-512x512.png" alt="Lúpulos" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'inline-block' }} /></div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f7', marginBottom: 4, letterSpacing: '-0.01em' }}>Panel Admin</div>
        <div style={{ fontSize: 13, color: '#636366', marginBottom: 32, fontWeight: 400 }}>Lupulos Rio Negro</div>
        <LoginButton />
        <div style={{ marginTop: 16, fontSize: 11, color: '#636366' }}>Solo el email autorizado tiene acceso</div>
        {errorMessage && (
          <div style={{ marginTop: 12, fontSize: 12, color: '#ff453a' }}>{errorMessage}</div>
        )}
      </div>
    </main>
  )
}
