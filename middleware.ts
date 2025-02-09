import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Permitir acceso al endpoint del webhook
  if (request.nextUrl.pathname.startsWith('/api/typeform-webhook')) {
    return NextResponse.next()
  }
}

// Configurar las rutas que no requieren autenticación
export const config = {
  matcher: '/api/:path*',
}
