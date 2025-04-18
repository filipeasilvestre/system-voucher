import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth-session");

  // Páginas públicas que não requerem autenticação
  const publicPages = ["/", "/plans", "/login", "/signup"];

  // Verifica se a página atual é pública
  const isPublicPage = publicPages.some((path) => request.nextUrl.pathname.startsWith(path));

  // Se não estiver autenticado e a página não for pública, redireciona para login
  if (!authCookie && !isPublicPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Permite o acesso
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|_next/static|favicon.ico).*)"], // Aplica o middleware a todas as rotas, exceto as especificadas
};