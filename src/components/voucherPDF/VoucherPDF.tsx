import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface Voucher {
  id: string;
  name: string;
  code: string;
  status: string;
  expiryDate: string | null;
  redemptions: number;
  createdAt: string;
  amount?: number;
  currency?: string;
  qrCode?: string;
  description?: string;
  template?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  logoUrl?: string;
  showLogo?: boolean;
  showQRCode?: boolean;
  showExpiryDate?: boolean;
}

/**
 * Generates a minimalist PDF for vouchers
 */
export const generateVoucherPDF = async (voucher: Voucher): Promise<Blob> => {
  console.log("Generating PDF with voucher data:", voucher); // Log para depuração

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5",
  });

  // Define minimalist colors - monochromatic scheme
  const primaryColor = voucher.primaryColor || "#333333";
  const secondaryColor = voucher.secondaryColor || "#666666";
  const textColor = voucher.textColor || "#333333";

  // Convert hex colors to RGB for jsPDF
  const primaryRGB = hexToRgb(primaryColor);
  const secondaryRGB = hexToRgb(secondaryColor);
  const textRGB = hexToRgb(textColor);

  // Get page dimensions
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Add clean white background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Add minimal border
  doc.setDrawColor(primaryRGB.r, primaryRGB.g, primaryRGB.b, 0.3);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, width - 20, height - 20, "S");

  // Add company logo (if available)
  if (voucher.logoUrl) {
    try {
      const response = await fetch(voucher.logoUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Logo = await base64Promise;

      const img = new Image();
      img.src = base64Logo;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const originalWidth = img.width;
      const originalHeight = img.height;

      const maxWidth = 40;
      const maxHeight = 20;

      let logoWidth = maxWidth;
      let logoHeight = maxHeight;

      if (originalWidth > originalHeight) {
        logoHeight = (originalHeight / originalWidth) * maxWidth;
      } else {
        logoWidth = (originalWidth / originalHeight) * maxHeight;
      }

      const logoX = width - 60;
      const logoY = 20;

      doc.addImage(base64Logo, "PNG", logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.error("Error loading logo:", error);

      const placeholderWidth = 40;
      const placeholderHeight = 20;
      const placeholderX = width - 60;
      const placeholderY = 20;

      doc.setFillColor(240, 240, 240);
      doc.rect(placeholderX, placeholderY, placeholderWidth, placeholderHeight, "F");
    }
  }

// Ajustar a posição e largura do nome do voucher
doc.setFontSize(24);
doc.setTextColor(0, 0, 0); // Cor preta para o texto
doc.setFont("helvetica", "bold");

// Definir limites para o texto
const nameX = 20; // Posição X inicial
const nameY = 40; // Posição Y inicial
const maxWidth = width - 80; // Limite de largura (para evitar sobreposição com a logo)

// Renderizar o nome do voucher com limite de largura
doc.text(voucher.name || "Gift Voucher", nameX, nameY, { maxWidth });

  // Adjusted position for the voucher description
  if (voucher.description) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b);
    doc.text(voucher.description, 20, 50, { maxWidth: width - 80 });
  }

  const dividerY = voucher.description ? 65 : 55;
  doc.setDrawColor(primaryRGB.r, primaryRGB.g, primaryRGB.b, 0.2);
  doc.setLineWidth(0.3);
  doc.line(20, dividerY, width - 20, dividerY);

  const amountY = dividerY + 15;


  const codeY = amountY + 15;

  doc.setFontSize(8);
  doc.setTextColor(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b);
  doc.setFont("helvetica", "normal");
  doc.text("VOUCHER CODE", 20, codeY);

  doc.setFontSize(16);
  doc.setTextColor(textRGB.r, textRGB.g, textRGB.b);
  doc.setFont("courier", "normal");
  doc.text(voucher.code, 20, codeY + 8);

  let qrCodeData = voucher.qrCode;
  if (!qrCodeData) {
    try {
      qrCodeData = await QRCode.toDataURL(voucher.code, {
        errorCorrectionLevel: "M",
        margin: 1,
        color: {
          dark: textColor,
          light: "#FFFFFF",
        },
      });
    } catch (error) {
      console.error("Error generating QR Code:", error);
    }
  }

  if (qrCodeData) {
    const qrSize = 30;
    const qrX = width - 50;
    const qrY = height - 50;

    doc.addImage(qrCodeData, "PNG", qrX, qrY, qrSize, qrSize);
  }

  if (voucher.expiryDate) {
    const expiryDate = new Date(voucher.expiryDate);
    const formattedDate = expiryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b);
    doc.text(`Valid until: ${formattedDate}`, 20, height - 20);
  }

  if (voucher.status) {
    const statusY = 20;
    const statusColor = getMinimalistStatusColor(voucher.status);
    const statusRGB = hexToRgb(statusColor);

    doc.setFontSize(10);
    doc.setTextColor(statusRGB.r, statusRGB.g, statusRGB.b);
    doc.setFont("helvetica", "normal");
    doc.text(voucher.status.toUpperCase(), width - 20, statusY, {
      align: "right",
    });
  }

  return doc.output("blob");
};

/**
 * Returns a muted color based on voucher status for minimalist design
 */
function getMinimalistStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "#4B9D74";
    case "used":
      return "#9CA3AF";
    case "expired":
      return "#DC6F79";
    case "pending":
      return "#D7A45E";
    default:
      return "#6B7280";
  }
}

/**
 * Converts a hex color to RGB
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}