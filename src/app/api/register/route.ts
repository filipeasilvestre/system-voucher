import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaGetInstance } from "@/lib/prisma-pg";
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { GenerateSession } from "@/lib/generate-session";
import { addHours } from "date-fns";
import { cookies } from "next/headers";

interface RegisterProps {
  email: string;
  name: string; // Campo adicionado
  company: string;
  password: string;
  password2: string;
  contact: string; // Campo adicionado
  address: string; // Campo adicionado
  role?: "CLIENT" | "ADMIN" | "CONSUMER";
  companyLogo?: string; // Campo adicionado
  fatNumber: string; // Campo adicionado
  postalCode: string; // Campo adicionado
  state: string; // Campo adicionado
}

export interface RegisterResponse {
  error?: string;
  user?: User;
}

/**
 * Realiza o cadastro
 */
export async function POST(request: Request) {
  const body = (await request.json()) as RegisterProps;

  const {
    email,
    name,
    company,
    password,
    password2,
    contact,
    address,
    postalCode,
    state,
    fatNumber,
    companyLogo,
    role,
  } = body;

  // Validação de campos obrigatórios
  if (
    !email ||
    !name ||
    !company ||
    !password ||
    !password2 ||
    !contact ||
    !address ||
    !postalCode ||
    !state ||
    !fatNumber
  ) {
    return NextResponse.json(
      { error: "missing required fields" },
      { status: 400 }
    );
  }

  // Validação de email
  const emailReg = new RegExp(
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
  );

  if (!emailReg.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  // Validação de senha
  if (password.length < 8 || password !== password2) {
    return NextResponse.json({ error: "invalid password" }, { status: 400 });
  }

  // Criptografia da senha
  const hash = bcrypt.hashSync(password, 12);

  try {
    const prisma = PrismaGetInstance();

    // Criação do usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        name,
        email,
        company,
        password: hash,
        contact,
        address,
        postalCode,
        state,
        fatNumber,
        companyLogo: companyLogo || "", // Valor padrão vazio
        role: role || "CLIENT",
      },
    });

    // Geração do token de sessão
    const sessionToken = GenerateSession({
      email,
      passwordHash: hash,
    });

    // Criação da sessão no banco de dados
    await prisma.sessions.create({
      data: {
        userId: user.id,
        token: sessionToken,
        valid: true,
        expiresAt: addHours(new Date(), 24),
      },
    });

    // Configuração do cookie de autenticação
    cookies().set({
      name: "auth-session",
      value: sessionToken,
      httpOnly: true,
      expires: addHours(new Date(), 24),
      path: "/",
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    // Tratamento de erros do Prisma
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "user already exists" },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}