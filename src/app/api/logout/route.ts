import { NextRequest, NextResponse } from "next/server";
import { PrismaGetInstance } from "@/lib/prisma-pg";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const authCookie = cookies().get("auth-session");
    const sessionToken = authCookie?.value || "";

    if (!sessionToken) {
      return NextResponse.json({ message: "No session found" }, { status: 400 });
    }

    const prisma = PrismaGetInstance();

    // Invalida a sessão no banco de dados
    await prisma.sessions.updateMany({
      where: { token: sessionToken, valid: true },
      data: { valid: false },
    });

    // Remove o cookie de autenticação
    cookies().set({
      name: "auth-session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure em produção
      sameSite: "strict",
      expires: new Date(0), // Expira imediatamente
      path: "/",
    });

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    console.error("Error in logout process:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}