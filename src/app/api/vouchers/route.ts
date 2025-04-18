import { NextRequest, NextResponse } from "next/server";
import { PrismaGetInstance } from "@/lib/prisma-pg";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

// Lida com requisições GET para buscar vouchers
export async function GET(request: NextRequest) {
  try {
    const authCookie = cookies().get("auth-session");
    const sessionToken = authCookie?.value || "";

    const prisma = PrismaGetInstance();

    // Verifica se o usuário está autenticado
    const session = await prisma.sessions.findFirst({
      where: { token: sessionToken },
      include: { User: true },
    });

    if (!session || !session.valid || session.expiresAt < new Date()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    // Busca os vouchers do usuário autenticado
    const vouchers = await prisma.voucher.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vouchers, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar vouchers:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}

// Lida com requisições POST para criar vouchers
export async function POST(request: NextRequest) {
  try {
    const authCookie = cookies().get("auth-session");
    const sessionToken = authCookie?.value || "";

    const prisma = PrismaGetInstance();

    // Verifica se o usuário está autenticado
    const session = await prisma.sessions.findFirst({
      where: { token: sessionToken },
      include: { User: true },
    });

    if (!session || !session.valid || session.expiresAt < new Date()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    // Obtém os dados do formulário
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const code = formData.get("code")?.toString().trim();
    const qrCode = formData.get("qrCode")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const expiryDate = formData.get("expiryDate")?.toString().trim();
    const amountValue = formData.get("amount");
    const amount = amountValue !== null ? parseFloat(amountValue.toString()) : null;
    const currency = formData.get("currency")?.toString().trim() || null;
    const status = formData.get("status")?.toString().trim() || "active";
    const logoFile = formData.get("logoUrl") as File | null; // Obtém o arquivo logoUrl

    if (!name || !code || !qrCode) {
      return NextResponse.json(
        { message: "Os campos 'name', 'code' e 'qrCode' são obrigatórios." },
        { status: 400 }
      );
    }

    let parsedExpiryDate = null;
    if (expiryDate) {
      const date = new Date(expiryDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { message: "O campo 'expiryDate' deve ser uma data válida." },
          { status: 400 }
        );
      }
      parsedExpiryDate = date;
    }

    // Salvar o arquivo logoUrl no servidor
    let logoUrlPath = null;
    if (logoFile) {
      const uploadDir = path.join(process.cwd(), "public/uploads/logos");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const arrayBuffer = await logoFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const filePath = path.join(uploadDir, logoFile.name);
      fs.writeFileSync(filePath, uint8Array);
      logoUrlPath = `/uploads/logos/${logoFile.name}`;
    }

    // Cria o voucher no banco de dados
    const voucher = await prisma.voucher.create({
      data: {
        name,
        code,
        qrCode,
        description,
        expiryDate: parsedExpiryDate,
        amount,
        currency,
        redemptions: 0, // Inicialmente, nenhum resgate foi feito
        status,
        ownerId: userId,
        logoUrl: logoUrlPath, // Salva o caminho do arquivo no banco de dados
      },
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar voucher:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor. Por favor, tente novamente mais tarde." },
      { status: 500 }
    );
  }
}