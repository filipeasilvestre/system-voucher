import { NextRequest, NextResponse } from "next/server";
import { PrismaGetInstance } from "@/lib/prisma-pg";
import bcrypt from "bcrypt";

export const dynamic = "force-dynamic"; // Define a rota como dinâmica

export async function GET(req: NextRequest) {
  const prisma = PrismaGetInstance();

  try {
    const authCookie = req.cookies.get("auth-session");
    const sessionToken = authCookie?.value || "";

    if (!sessionToken) {
      return NextResponse.json({ error: "Token de sessão não encontrado." }, { status: 401 });
    }

    const session = await prisma.sessions.findFirst({
      where: { token: sessionToken },
      include: { User: true },
    });

    if (!session || !session.valid || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        contact: true,
        address: true,
        postalCode: true,
        state: true,
        fatNumber: true,
        companyLogo: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    return NextResponse.json({ error: "Erro ao buscar os dados do usuário." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const prisma = PrismaGetInstance();

  try {
    const body = await req.json();
    const { name, company, contact, address, postalCode, state, fatNumber, companyLogo } = body;

    const authCookie = req.cookies.get("auth-session");
    const sessionToken = authCookie?.value || "";

    if (!sessionToken) {
      return NextResponse.json({ error: "Token de sessão não encontrado." }, { status: 401 });
    }

    const session = await prisma.sessions.findFirst({
      where: { token: sessionToken },
      include: { User: true },
    });

    if (!session || !session.valid || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const userId = session.userId;

    const dataToUpdate: any = {};

    if (name) dataToUpdate.name = name;
    if (company) dataToUpdate.company = company;
    if (contact) dataToUpdate.contact = contact;
    if (address) dataToUpdate.address = address;
    if (postalCode) dataToUpdate.postalCode = postalCode;
    if (state) dataToUpdate.state = state;
    if (fatNumber) dataToUpdate.fatNumber = fatNumber;
    if (companyLogo) dataToUpdate.companyLogo = companyLogo;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar os dados do usuário:", error);
    return NextResponse.json({ error: "Erro ao atualizar os dados do usuário." }, { status: 500 });
  }
}