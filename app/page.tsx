import { auth, signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center bg-[#0f1a0f]">
        <div className="bg-[#1a2e1a] border border-[#2a4a2a] rounded-2xl p-10 text-center max-w-[360px] w-full">
          <div className="text-4xl mb-3">🌿</div>
          <div className="text-xl font-semibold text-[#c8e8c8] mb-1">Lúpulos Río Negro</div>
          <div className="text-[13px] text-[#4a7a4a] mb-8">Panel de administración</div>
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="w-full py-3 px-5 bg-[#2a5a2a] text-[#c8e8c8] border border-[#3a6a3a] rounded-xl text-[15px] font-medium cursor-pointer flex items-center justify-center gap-2.5 hover:bg-[#3a6a3a] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Ingresar con Google
            </button>
          </form>
          <div className="mt-4 text-[11px] text-[#3a5a3a]">Solo el email autorizado tiene acceso</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-[#0f1a0f]">
      <div className="bg-[#1a2e1a] border border-[#2a4a2a] rounded-2xl p-10 text-center max-w-[420px] w-full">
        <div className="text-4xl mb-3">🌿</div>
        <div className="text-lg font-semibold text-[#c8e8c8] mb-1">Bienvenido</div>
        <div className="text-[13px] text-[#4a7a4a] mb-6">{session.user?.email}</div>
        <div className="flex flex-col gap-3">
          <a
            href="https://qr.lupulosrionegro.com.ar/admin"
            className="w-full py-3 px-5 bg-[#2a5a2a] text-[#c8e8c8] border border-[#3a6a3a] rounded-xl text-[15px] font-medium flex items-center justify-center gap-2.5 hover:bg-[#3a6a3a] transition-colors no-underline"
          >
            📦 Ir a trazabilidad (QR)
          </a>
          <a
            href="/admin"
            className="w-full py-3 px-5 bg-[#1f3a1f] text-[#c8e8c8] border border-[#2a5a2a] rounded-xl text-[15px] font-medium flex items-center justify-center gap-2.5 hover:bg-[#2a4a2a] transition-colors no-underline"
          >
            🗺 Ir a hileras
          </a>
        </div>
        <div className="mt-6">
          <form
            action={async () => {
              'use server'
              const { signOut } = await import('@/lib/auth')
              await signOut({ redirectTo: '/' })
            }}
          >
            <button type="submit" className="text-[11px] text-[#3a5a3a] hover:text-[#6a9a6a] cursor-pointer bg-transparent border-none underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
