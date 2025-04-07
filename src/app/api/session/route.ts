import { NextRequest, NextResponse } from "next/server";
import { PrismaGetInstance } from "../../../lib/prisma-pg";  // Altere a importação aqui

// Forçar a renderização dinâmica para a rota
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const prisma = PrismaGetInstance();  // Usar a instância do Prisma que você criou

  try {
    // Acessando o cookie 'auth-session'
    const authCookie = req.cookies.get("auth-session");
    const sessionToken = authCookie?.value || "";

    if (!sessionToken) {
      return NextResponse.json({ error: "Token de sessão não encontrado." }, { status: 401 });
    }

    // Verificando a sessão no banco de dados
    const session = await prisma.sessions.findFirst({
      where: { token: sessionToken },
      include: { User: true },
    });

    // Validando se a sessão existe e se é válida
    if (!session || !session.valid || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

    // Retorna o ID do usuário se a sessão for válida
    return NextResponse.json({ userId: session.userId });
  } catch (error) {
    console.error("Erro ao buscar sessão:", error);
    return NextResponse.json({ error: "Erro ao buscar sessão." }, { status: 500 });
  }
}
