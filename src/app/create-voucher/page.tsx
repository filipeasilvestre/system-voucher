"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  Ticket,
  Upload,
  Palette,
  Layout,
  Check,
  Image as ImageIcon,
  Save,
  X,
  QrCode,
  EyeIcon,
  SplitIcon,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { generateVoucherPDF } from "@/components/voucherPDF/VoucherPDF";
import { Voucher } from "@/components/voucherPDF/VoucherPDF";

export default function CreateVoucherPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [showExpandedPreview, setShowExpandedPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);

  const [voucherData, setVoucherData] = useState({
    name: "",
    description: "",
    amount: 10,
    currency: "EUR",
    expiryDate: "",
    logoUrl: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    textColor: "#FFFFFF",
    template: "classic",
    showLogo: true,
    showQRCode: true,
    showExpiryDate: true,
    qrCode: "",
  });

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof typeof voucherData,
    value: string | number | boolean
  ) => {
    setVoucherData({
      ...voucherData,
      [field]: field === "amount" ? Number(value) : value,
    });
  };

  const handleImageUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherData({
          ...voucherData,
          logoUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setVoucherData({
      ...voucherData,
      template,
    });
  };

  const saveVoucher = async () => {
    try {
      const formData = new FormData();
  
      // Gerar código único para o voucher
      const voucherCode = `${Date.now()}`;
      formData.append("code", voucherCode);
  
      // Gerar QR Code com base no código do voucher
      const qrCodeData = await QRCode.toDataURL(voucherCode);
      formData.append("qrCode", qrCodeData);
  
      // Adicione os campos do voucher ao FormData
      formData.append("name", voucherData.name);
      formData.append("description", voucherData.description || "");
      formData.append("expiryDate", voucherData.expiryDate || "");
      formData.append("amount", voucherData.amount.toString());
      formData.append("currency", voucherData.currency || "");
      formData.append("status", "active");
  
      // Adicione o logo, se existir
      if (voucherData.logoUrl) {
        const response = await fetch(voucherData.logoUrl);
        const blob = await response.blob();
        const file = new File([blob], "logo.png", { type: blob.type });
        formData.append("logoUrl", file);
      }
  
      const response = await fetch("/api/vouchers", {
        method: "POST",
        body: formData, // Envia o FormData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro da API:", errorData);
        throw new Error(errorData.message || "Erro ao salvar o voucher");
      }
  
      alert("Voucher salvo com sucesso!");
      router.push("/dashboard"); // Redireciona para a lista de vouchers
    } catch (error) {
      console.error("Erro ao salvar o voucher:", error);
      alert("Não foi possível salvar o voucher. Tente novamente.");
    }
  };

  const updatePdfPreview = async () => {
    setIsPreviewLoading(true);
    const voucherForPdf: Voucher = {
      id: "temp-id",
      code: "temp-code",
      status: "active",
      redemptions: 0,
      createdAt: new Date().toISOString(),
      ...voucherData,
    };

    try {
      const pdfBlob = await generateVoucherPDF(voucherForPdf);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      const newPdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(newPdfUrl);
    } catch (error) {
      console.error("Error generating PDF preview:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updatePdfPreview();
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [voucherData]);

  // Templates disponíveis para seleção
  const templates = [
    { id: "classic", name: "Classic", thumbnail: "/thumbnails/classic.png" },
    { id: "modern", name: "Modern", thumbnail: "/thumbnails/modern.png" },
    { id: "elegant", name: "Elegant", thumbnail: "/thumbnails/elegant.png" },
  ];

  const toggleExpandedPreview = () => {
    setShowExpandedPreview(!showExpandedPreview);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow px-4 py-8 md:py-12">
        <div className="container mx-auto">
          {/* Layout principal */}
          <div
            className={`grid ${
              showExpandedPreview
                ? "grid-cols-1"
                : "grid-cols-1 lg:grid-cols-12"
            } gap-8`}
          >
            {/* Editor Controls */}
            <div
              className={`${showExpandedPreview ? "hidden" : "lg:col-span-7"}`}
            >
              <Card className="shadow-md">
                <CardHeader className="bg-white border-b pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <Ticket className="mr-2 h-5 w-5 text-blue-600" />
                    Editor de Voucher
                  </CardTitle>
                  <CardDescription>
                    Configure todos os aspectos do seu voucher
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 mb-8">
                      <TabsTrigger
                        value="details"
                        className="flex items-center justify-center"
                      >
                        <Ticket className="mr-2 h-4 w-4" />
                        Detalhes
                      </TabsTrigger>
                      <TabsTrigger
                        value="design"
                        className="flex items-center justify-center"
                      >
                        <Palette className="mr-2 h-4 w-4" />
                        Design
                      </TabsTrigger>
                      <TabsTrigger
                        value="template"
                        className="flex items-center justify-center"
                      >
                        <Layout className="mr-2 h-4 w-4" />
                        Template
                      </TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Título do Voucher
                          </Label>
                          <Input
                            id="name"
                            placeholder="Ex: Vale Presente de Aniversário"
                            value={voucherData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className="focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2 md:row-span-2">
                          <Label
                            htmlFor="description"
                            className="text-sm font-medium"
                          >
                            Descrição
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Adicione uma descrição ou termos de uso"
                            value={voucherData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            className="h-32 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="amount"
                              className="text-sm font-medium"
                            >
                              Valor
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              value={voucherData.amount}
                              onChange={(e) =>
                                handleInputChange("amount", e.target.value)
                              }
                              className="focus:ring-blue-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="currency"
                              className="text-sm font-medium"
                            >
                              Moeda
                            </Label>
                            <Select
                              value={voucherData.currency}
                              onValueChange={(value) =>
                                handleInputChange("currency", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a moeda" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="BRL">BRL (R$)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="expiryDate"
                          className="text-sm font-medium"
                        >
                          Data de Expiração
                        </Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={voucherData.expiryDate}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          className="focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logo" className="text-sm font-medium">
                          Logo da Empresa
                        </Label>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Input
                              id="logo"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(e.target.files?.[0] || null)
                              }
                            />
                            <label
                              htmlFor="logo"
                              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Upload className="mr-2 h-4 w-4 text-gray-500" />
                              Carregar Logo
                            </label>
                          </div>

                          {voucherData.logoUrl ? (
                            <div className="relative">
                              <img
                                src={voucherData.logoUrl}
                                alt="Logo Preview"
                                className="h-16 w-16 rounded-full border border-gray-300 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setVoucherData({
                                    ...voucherData,
                                    logoUrl: "",
                                  })
                                }
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Design Tab */}
                    <TabsContent value="design" className="space-y-6">
                    <div className="space-y-4 pt-4">
                        <h3 className="text-sm font-medium text-gray-700">
                          Opções de Exibição
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center justify-between space-x-2 bg-gray-50 p-3 rounded-lg">
                            <Label
                              htmlFor="showLogo"
                              className="text-sm cursor-pointer"
                            >
                              Exibir Logo
                            </Label>
                            <Switch
                              id="showLogo"
                              checked={voucherData.showLogo}
                              onCheckedChange={(checked) =>
                                handleInputChange("showLogo", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between space-x-2 bg-gray-50 p-3 rounded-lg">
                            <Label
                              htmlFor="showQRCode"
                              className="text-sm cursor-pointer"
                            >
                              Incluir QR Code
                            </Label>
                            <Switch
                              id="showQRCode"
                              checked={voucherData.showQRCode}
                              onCheckedChange={(checked) =>
                                handleInputChange("showQRCode", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between space-x-2 bg-gray-50 p-3 rounded-lg">
                            <Label
                              htmlFor="showExpiryDate"
                              className="text-sm cursor-pointer"
                            >
                              Mostrar Data de Validade
                            </Label>
                            <Switch
                              id="showExpiryDate"
                              checked={voucherData.showExpiryDate}
                              onCheckedChange={(checked) =>
                                handleInputChange("showExpiryDate", checked)
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="primaryColor"
                            className="text-sm font-medium"
                          >
                            Cor Principal
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              type="color"
                              id="primaryColor"
                              value={voucherData.primaryColor}
                              onChange={(e) =>
                                handleInputChange(
                                  "primaryColor",
                                  e.target.value
                                )
                              }
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={voucherData.primaryColor}
                              onChange={(e) =>
                                handleInputChange(
                                  "primaryColor",
                                  e.target.value
                                )
                              }
                              className="flex-grow"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="secondaryColor"
                            className="text-sm font-medium"
                          >
                            Cor Secundária
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              type="color"
                              id="secondaryColor"
                              value={voucherData.secondaryColor}
                              onChange={(e) =>
                                handleInputChange(
                                  "secondaryColor",
                                  e.target.value
                                )
                              }
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={voucherData.secondaryColor}
                              onChange={(e) =>
                                handleInputChange(
                                  "secondaryColor",
                                  e.target.value
                                )
                              }
                              className="flex-grow"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="textColor"
                            className="text-sm font-medium"
                          >
                            Cor do Texto
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              type="color"
                              id="textColor"
                              value={voucherData.textColor}
                              onChange={(e) =>
                                handleInputChange("textColor", e.target.value)
                              }
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={voucherData.textColor}
                              onChange={(e) =>
                                handleInputChange("textColor", e.target.value)
                              }
                              className="flex-grow"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">
                          Paletas de Cores Pré-definidas
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            {
                              name: "Azul",
                              primary: "#3B82F6",
                              secondary: "#1E40AF",
                              text: "#FFFFFF",
                            },
                            {
                              name: "Verde",
                              primary: "#10B981",
                              secondary: "#065F46",
                              text: "#FFFFFF",
                            },
                            {
                              name: "Vermelho",
                              primary: "#EF4444",
                              secondary: "#991B1B",
                              text: "#FFFFFF",
                            },
                            {
                              name: "Roxo",
                              primary: "#8B5CF6",
                              secondary: "#5B21B6",
                              text: "#FFFFFF",
                            },
                            {
                              name: "Laranja",
                              primary: "#F97316",
                              secondary: "#C2410C",
                              text: "#FFFFFF",
                            },
                            {
                              name: "Rosa",
                              primary: "#EC4899",
                              secondary: "#9D174D",
                              text: "#FFFFFF",
                            },
                            {
                              name: "Cinza",
                              primary: "#6B7280",
                              secondary: "#374151",
                              text: "#FFFFFF",
                            },
                            {
                              name: "Preto",
                              primary: "#1F2937",
                              secondary: "#111827",
                              text: "#FFFFFF",
                            },
                          ].map((palette, index) => (
                            <button
                              key={index}
                              className="flex flex-col items-center p-3 border rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={() => {
                                setVoucherData({
                                  ...voucherData,
                                  primaryColor: palette.primary,
                                  secondaryColor: palette.secondary,
                                  textColor: palette.text,
                                });
                              }}
                            >
                              <div className="flex w-full h-8 rounded-md overflow-hidden mb-2">
                                <div
                                  className="w-1/2"
                                  style={{ backgroundColor: palette.primary }}
                                ></div>
                                <div
                                  className="w-1/2"
                                  style={{ backgroundColor: palette.secondary }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">
                                {palette.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Template Tab */}
                    <TabsContent value="template" className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              voucherData.template === template.id
                                ? "border-blue-500 shadow-lg"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                              {/* Aqui pode ser uma imagem do template */}
                              <div className="flex items-center justify-center h-32 bg-gray-100">
                                <div className="text-center">
                                  <Layout className="mx-auto h-8 w-8 text-gray-400" />
                                  <p className="mt-2 text-sm font-medium">
                                    {template.name}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {voucherData.template === template.id && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 p-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/vouchers")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <div className="flex space-x-3">
                  <Button onClick={saveVoucher}>
  <Save className="mr-2 h-4 w-4" />
  Salvar Voucher
</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Preview Panel */}
            <div
              className={`${showExpandedPreview ? "w-full" : "lg:col-span-5"}`}
            >
              <Card className="shadow-md">
                <CardHeader className="bg-white border-b flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="flex items-center text-xl">
                      <EyeIcon className="mr-2 h-5 w-5 text-blue-600" />
                      Preview
                    </CardTitle>
                    <CardDescription>
                      Visualize o voucher em tempo real
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex justify-center items-center">
                  <div
                    className="overflow-hidden rounded-lg shadow-lg bg-white"
                    style={{
                      width: "595px", // Largura exata do A5
                      height: "355px", // Altura exata do A5
                    }}
                  >
                    {isPreviewLoading ? (
                      <div className="flex items-center justify-center bg-gray-100 w-full h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-4 text-gray-600">
                            Gerando preview...
                          </p>
                        </div>
                      </div>
                    ) : pdfUrl ? (
                      <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} // Remove barras e painéis extras
                        className="w-full h-full"
                        style={{
                          border: "none", // Remove bordas do iframe
                          overflow: "hidden", // Garante que não haja rolagem
                          width: "100%",
                          height: "100%",
                        }}
                        scrolling="no" // Remove o scroll do iframe
                        title="Voucher Preview"
                      />
                    ) : (
                      <div className="flex items-center justify-center bg-gray-100 w-full h-full">
                        <p>Não foi possível carregar a preview</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
