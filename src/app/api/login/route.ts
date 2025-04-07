import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaGetInstance } from "@/lib/prisma-pg";
import { cookies } from "next/headers";
import { GenerateSession } from "@/lib/generate-session";
import { addHours } from "date-fns";

interface LoginProps {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: string;
}

export const revalidate = 0;

/**
 * Verifica o estado da autenticação, pegando o token de login nos cookies
 * Verifica se a sessão existe, se não expirou e se ainda está válida
 * Retorna 401 se não permitir a autenticação e 200 se permitir
 */
export async function GET(request: NextRequest) {
  try {
    const authCookie = cookies().get("auth-session");
    const sessionToken = authCookie?.value || "";

    const prisma = PrismaGetInstance();
    const session = await prisma.sessions.findFirst({
      where: { token: sessionToken },
    });

    if (!session || !session.valid || session.expiresAt < new Date()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Authorized" }, { status: 200 });
  } catch (error) {
    console.error("Error in authentication check:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Realiza o login
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginProps;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<LoginResponse>(
        { session: "" },
        { status: 400, statusText: "Email and password are required." }
      );
    }

    const prisma = PrismaGetInstance();

    // Encontrar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json<LoginResponse>(
        { session: "" },
        { status: 400, statusText: "Invalid email or password." }
      );
    }

    // Comparar senha com hash armazenado
    const passwordResult = await bcrypt.compare(password, user.password);

    if (!passwordResult) {
      return NextResponse.json<LoginResponse>(
        { session: "" },
        { status: 400, statusText: "Invalid email or password." }
      );
    }

    // Gerar token de sessão
    const sessionToken = GenerateSession({
      email,
      passwordHash: user.password,
    });

    // Criar sessão no banco de dados
    await prisma.sessions.create({
      data: {
        userId: user.id,
        token: sessionToken,
        valid: true,
        expiresAt: addHours(new Date(), 24),
      },
    });

    // Configurar cookie de autenticação
    cookies().set({
      name: "auth-session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure em produção
      sameSite: "strict",
      expires: addHours(new Date(), 24),
      path: "/",
    });

    return NextResponse.json<LoginResponse>(
      { session: sessionToken },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in login process:", error);
    return NextResponse.json<LoginResponse>(
      { session: "" },
      { status: 500, statusText: "Internal Server Error." }
    );
  }
}
