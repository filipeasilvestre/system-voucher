"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Upload,
  Palette,
  Layout,
  Check,
  Image as ImageIcon,
  Save,
  X,
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

export default function CreateVoucherPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [voucherData, setVoucherData] = useState({
    name: "",
    description: "",
    amount: "10",
    currency: "EUR",
    expiryDate: "",
    logoUrl: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    textColor: "#FFFFFF",
    template: "classic",
    showLogo: true,
    showQRCode: true,
    showBarcode: false,
    showExpiryDate: true,
  });

  const handleInputChange = (
    field: keyof typeof voucherData,
    value: string | number | boolean
  ) => {
    setVoucherData({
      ...voucherData,
      [field]: value,
    });
  };

  const handleColorChange = (
    field: keyof typeof voucherData,
    value: string
  ) => {
    setVoucherData({
      ...voucherData,
      [field]: value,
    });
  };

  type TemplateId = "classic" | "modern" | "elegant" | "festive";

  const handleTemplateSelect = (template: TemplateId) => {
    setSelectedTemplate(template);
    setVoucherData({
      ...voucherData,
      template,
    });
  };

  const handleSaveVoucher = () => {
    // Aqui você adicionaria a lógica para salvar o voucher
    console.log("Voucher salvo:", voucherData);
    router.push("/vouchers");
  };

  const templates = [
    {
      id: "classic",
      name: "Classic",
      description: "A traditional voucher design with clean layout",
      previewColor: "bg-blue-500",
      styles: {
        padding: "p-4",
        headerClass: "text-lg font-bold",
        bodyClass: "text-base",
        footerClass: "text-sm",
      },
    },
    {
      id: "modern",
      name: "Modern",
      description: "A sleek and minimalist design",
      previewColor: "bg-indigo-500",
      styles: {
        padding: "p-6",
        headerClass: "text-xl font-semibold",
        bodyClass: "text-base",
        footerClass: "text-sm",
      },
    },
    {
      id: "elegant",
      name: "Elegant",
      description: "A sophisticated design with premium feel",
      previewColor: "bg-purple-500",
      styles: {
        padding: "p-8",
        headerClass: "text-2xl font-light italic",
        bodyClass: "text-lg",
        footerClass: "text-sm",
      },
    },
    {
      id: "festive",
      name: "Festive",
      description: "Perfect for holidays and special occasions",
      previewColor: "bg-red-500",
      styles: {
        padding: "p-4 bg-gradient-to-r from-red-500 to-yellow-500",
        headerClass: "text-lg font-bold text-yellow-200",
        bodyClass: "text-base text-white",
        footerClass: "text-sm text-yellow-100",
      },
    },
  ];

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
              Create Voucher
            </h1>
            <p className="text-white text-center mt-2">
              Design and personalize your vouchers
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Editor Controls */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Voucher Editor</CardTitle>
                  <CardDescription>
                    Customize all aspects of your voucher
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 mb-8">
                      <TabsTrigger value="details">
                        <span className="flex items-center">
                          <Ticket className="mr-2 h-4 w-4" />
                          Details
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="design">
                        <span className="flex items-center">
                          <Palette className="mr-2 h-4 w-4" />
                          Design
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="template">
                        <span className="flex items-center">
                          <Layout className="mr-2 h-4 w-4" />
                          Template
                        </span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="voucher-name">Voucher Name</Label>
                          <Input
                            id="voucher-name"
                            placeholder="e.g. Summer Discount"
                            value={voucherData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="voucher-description">
                            Description
                          </Label>
                          <Textarea
                            id="voucher-description"
                            placeholder="Enter voucher description"
                            rows={3}
                            value={voucherData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="voucher-amount">Amount</Label>
                            <div className="flex items-center">
                              <Input
                                id="voucher-amount"
                                type="number"
                                min="0"
                                value={voucherData.amount}
                                onChange={(e) =>
                                  handleInputChange("amount", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="voucher-currency">Currency</Label>
                            <Select
                              value={voucherData.currency}
                              onValueChange={(value) =>
                                handleInputChange("currency", value)
                              }
                            >
                              <SelectTrigger id="voucher-currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="voucher-expiry">Expiry Date</Label>
                          <Input
                            id="voucher-expiry"
                            type="date"
                            value={voucherData.expiryDate}
                            onChange={(e) =>
                              handleInputChange("expiryDate", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="voucher-logo">Logo Upload</Label>
                          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                >
                                  <span>Upload a file</span>
                                  <Input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const files = e.target.files;
                                      if (files && files[0]) {
                                        const file = files[0];
                                        // Em um cenário real, você faria o upload e obteria a URL
                                        const fakeUrl =
                                          URL.createObjectURL(file);
                                        handleInputChange("logoUrl", fakeUrl);
                                      }
                                    }}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Design Tab */}
                    <TabsContent value="design" className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="primary-color">Primary Color</Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <input
                              type="color"
                              id="primary-color"
                              value={voucherData.primaryColor}
                              onChange={(e) =>
                                handleColorChange(
                                  "primaryColor",
                                  e.target.value
                                )
                              }
                              className="w-12 h-12 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                              {voucherData.primaryColor}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="secondary-color">
                            Secondary Color
                          </Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <input
                              type="color"
                              id="secondary-color"
                              value={voucherData.secondaryColor}
                              onChange={(e) =>
                                handleColorChange(
                                  "secondaryColor",
                                  e.target.value
                                )
                              }
                              className="w-12 h-12 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                              {voucherData.secondaryColor}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="text-color">Text Color</Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <input
                              type="color"
                              id="text-color"
                              value={voucherData.textColor}
                              onChange={(e) =>
                                handleColorChange("textColor", e.target.value)
                              }
                              className="w-12 h-12 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                              {voucherData.textColor}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 space-y-4">
                          <Label>Display Options</Label>

                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="show-logo"
                              className="cursor-pointer"
                            >
                              Show Logo
                            </Label>
                            <Switch
                              id="show-logo"
                              checked={voucherData.showLogo}
                              onCheckedChange={(checked) =>
                                handleInputChange("showLogo", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="show-qr" className="cursor-pointer">
                              Show QR Code
                            </Label>
                            <Switch
                              id="show-qr"
                              checked={voucherData.showQRCode}
                              onCheckedChange={(checked) =>
                                handleInputChange("showQRCode", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="show-barcode"
                              className="cursor-pointer"
                            >
                              Show Barcode
                            </Label>
                            <Switch
                              id="show-barcode"
                              checked={voucherData.showBarcode}
                              onCheckedChange={(checked) =>
                                handleInputChange("showBarcode", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="show-expiry"
                              className="cursor-pointer"
                            >
                              Show Expiry Date
                            </Label>
                            <Switch
                              id="show-expiry"
                              checked={voucherData.showExpiryDate}
                              onCheckedChange={(checked) =>
                                handleInputChange("showExpiryDate", checked)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Template Tab */}
                    <TabsContent value="template" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                              selectedTemplate === template.id
                                ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              handleTemplateSelect(template.id as TemplateId)
                            }
                          >
                            <div className={`h-32 ${template.previewColor}`}>
                              {selectedTemplate === template.id && (
                                <div className="flex justify-end p-2">
                                  <div className="bg-white rounded-full p-1">
                                    <Check className="h-4 w-4 text-blue-500" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium">{template.name}</h3>
                              <p className="text-sm text-gray-500">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      See how your voucher will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full aspect-[3/2] overflow-hidden rounded-lg shadow-lg">
                      {/* Voucher Preview */}
                      <div
                        className={`relative w-full h-full flex flex-col ${
                          templates.find((t) => t.id === selectedTemplate)
                            ?.styles.padding || "p-4"
                        }`}
                        style={{
                          backgroundColor: voucherData.primaryColor,
                          backgroundImage: `linear-gradient(to bottom right, ${voucherData.primaryColor}, ${voucherData.secondaryColor})`,
                          color: voucherData.textColor,
                        }}
                      >
                        {/* Template Header */}
                        <div
                          className={`p-4 flex justify-between items-center ${
                            templates.find((t) => t.id === selectedTemplate)
                              ?.styles.headerClass
                          }`}
                        >
                          {voucherData.showLogo && voucherData.logoUrl ? (
                            <img
                              src={voucherData.logoUrl}
                              alt="Logo"
                              className="h-12 rounded-md object-contain bg-white bg-opacity-20 p-1"
                            />
                          ) : (
                            <div className="h-12 w-16 flex items-center justify-center font-bold">
                              LOGO
                            </div>
                          )}
                          <div className="font-bold text-lg">
                            {voucherData.currency} {voucherData.amount}
                          </div>
                        </div>

                        {/* Template Body */}
                        <div
                          className={`flex-grow p-4 flex flex-col justify-center items-center text-center ${
                            templates.find((t) => t.id === selectedTemplate)
                              ?.styles.bodyClass
                          }`}
                        >
                          <h2 className="text-2xl font-bold">
                            {voucherData.name || "Your Voucher Name"}
                          </h2>
                          <p className="mt-2">
                            {voucherData.description ||
                              "Voucher description will appear here"}
                          </p>

                          {voucherData.showExpiryDate &&
                            voucherData.expiryDate && (
                              <div className="mt-4 text-sm opacity-90">
                                Valid until:{" "}
                                {new Date(
                                  voucherData.expiryDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                        </div>

                        {/* Template Footer */}
                        <div
                          className={`p-4 flex justify-between items-center ${
                            templates.find((t) => t.id === selectedTemplate)
                              ?.styles.footerClass
                          }`}
                        >
                          {voucherData.showQRCode && (
                            <div className="h-12 w-12 bg-white"></div>
                          )}

                          {voucherData.showBarcode && (
                            <div className="h-8 w-32 bg-white bg-opacity-90 ml-auto"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.back()}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveVoucher}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Voucher
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
