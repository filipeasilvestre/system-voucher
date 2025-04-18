import { NextRequest, NextResponse } from "next/server";
import { PrismaGetInstance } from "@/lib/prisma-pg";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = PrismaGetInstance();

  try {
    const { id } = params;

    // Verifica se o ID foi fornecido
    if (!id) {
      return NextResponse.json({ message: "ID do voucher não fornecido." }, { status: 400 });
    }

    // Tenta deletar o voucher pelo ID
    const deletedVoucher = await prisma.voucher.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Voucher deletado com sucesso.", deletedVoucher }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar voucher:", error);
    return NextResponse.json({ message: "Erro ao deletar voucher." }, { status: 500 });
  }
}