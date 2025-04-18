"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateVoucherPDF } from "@/components/voucherPDF/VoucherPDF";
import { Ticket, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

// Defina a interface para o tipo de voucher
interface Voucher {
  id: string;
  name: string;
  code: string;
  status: string;
  expiryDate: string | null;
  redemptions: number;
  createdAt: string;
  amount?: number; // Opcional
  currency?: string; // Opcional
}

export default function VoucherDashboardPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]); // Use o tipo Voucher[]
  const [isLoading, setIsLoading] = useState(true);

  // Busca os vouchers da API
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch("/api/vouchers", { method: "GET" });
        if (response.ok) {
          const data: Voucher[] = await response.json();
          setVouchers(data);
        } else {
          console.error("Erro ao buscar vouchers:", response.status);
        }
      } catch (error) {
        console.error("Erro ao buscar vouchers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  // Função para deletar um voucher
  const handleDeleteVoucher = async (id: string) => {
    try {
      const response = await fetch(`/api/vouchers/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("Voucher deletado com sucesso");
        setVouchers((prevVouchers) =>
          prevVouchers.filter((voucher) => voucher.id !== id)
        );
      } else {
        console.error("Erro ao deletar voucher");
      }
    } catch (error) {
      console.error("Erro ao deletar voucher:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "used":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-red-100 text-red-800"; // Cor para status desconhecido
    }
  };

  if (isLoading) {
    return <div>Carregando vouchers...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-4">
              <Ticket className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-white font-bold text-3xl text-center">
              Voucher Dashboard
            </h1>
            <p className="text-white text-center mt-2">
              Manage and track all your vouchers in one place
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Vouchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vouchers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {vouchers.filter((v) => v.status === "active").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {vouchers.filter((v) => v.status === "used").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Expired
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {vouchers.filter((v) => v.status === "expired").length}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Vouchers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Voucher</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.length > 0 ? (
                  vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-medium">
                        <div>{voucher.name}</div>
                        <div className="text-sm text-gray-500">
                          Created{" "}
                          {new Date(voucher.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {voucher.currency} {voucher.amount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(
                            voucher.status || "unknown"
                          )}
                        >
                          {voucher.status
                            ? voucher.status.charAt(0).toUpperCase() +
                              voucher.status.slice(1)
                            : "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {voucher.expiryDate
                          ? new Date(voucher.expiryDate).toLocaleDateString()
                          : "No expiry"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
  onClick={async () => {
    const pdfBlob = await generateVoucherPDF(voucher);
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Cria um link temporário para forçar o download
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${voucher.name || "voucher"}.pdf`;
    link.click();

    // Libera o objeto URL após o download
    URL.revokeObjectURL(pdfUrl);
  }}
>
  <Eye className="mr-2 h-4 w-4" />
  View
</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/vouchers/edit/${voucher.id}`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteVoucher(voucher.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No vouchers found. Create your first voucher to get
                      started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
