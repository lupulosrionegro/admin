'use client'

import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
    >
      Cerrar sesión
    </button>
  )
}