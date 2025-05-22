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
  horseSilhouetteUrl?: string; // Added for horse silhouette image
}

/**
 * Generates a minimalist PDF for vouchers with gold frames and horse silhouette
 */
export const generateVoucherPDF = async (voucher: Voucher): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5",
  });

  // Definir cores
  const amberColor = "#F9A825"; // Cor âmbar
  const grayColor = "#4E4E4E"; // Cinza escuro para texto
  const whiteColor = "#FFFFFF"; // Branco para texto e fundo

  const amberRGB = hexToRgb(amberColor);
  const grayRGB = hexToRgb(grayColor);

  // Dimensões da página
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Fundo branco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Header com logo e título
  doc.setFillColor(amberRGB.r, amberRGB.g, amberRGB.b);
  doc.rect(0, 0, width, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("ECO SALGADOS", 10, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("AGROTURISMO & ACTIVIDADES EQUESTRES", 10, 17);

  // Número do voucher
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Voucher nº ${voucher.code || "20250214"}`, width - 50, 12);

  // Título principal
  doc.setFont("times", "italic");
  doc.setFontSize(28);
  doc.setTextColor(grayRGB.r, grayRGB.g, grayRGB.b);
  doc.text("PASSEIO NA PRAIA", width / 2, 40, { align: "center" });

  // Descrição
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(grayRGB.r, grayRGB.g, grayRGB.b);
  doc.text("Uma experiência inesquecível junto ao mar", width / 2, 50, { align: "center" });

  // Estrelas de avaliação
  const starSize = 8;
  const starSpacing = 12;
  const starY = 60;
  for (let i = 0; i < 5; i++) {
    const starX = width / 2 - (starSpacing * 2) + i * starSpacing;
    drawStar(doc, starX, starY, starSize, amberColor);
  }

  // QR Code
  if (voucher.qrCode) {
    const qrSize = 30;
    const qrX = 10;
    const qrY = height - qrSize - 10;
    doc.addImage(voucher.qrCode, "PNG", qrX, qrY, qrSize, qrSize);
    doc.setFontSize(10);
    doc.setTextColor(grayRGB.r, grayRGB.g, grayRGB.b);
    doc.text("Scan para validar", qrX + qrSize / 2, qrY + qrSize + 5, { align: "center" });
  }

  // Imagem à direita
  const imageWidth = width / 2.5;
  const imageHeight = height / 2.5;
  const imageX = width - imageWidth - 10;
  const imageY = 30;

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

      const base64Image = await base64Promise;
      doc.addImage(base64Image, "JPEG", imageX, imageY, imageWidth, imageHeight);
    } catch (error) {
      console.error("Erro ao carregar a imagem:", error);
    }
  }

  // Rodapé com validade
  doc.setFillColor(amberRGB.r, amberRGB.g, amberRGB.b);
  doc.rect(0, height - 10, width, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Válido por 1 ano a partir da data de emissão", width / 2, height - 5, { align: "center" });

  return doc.output("blob");
};

/**
 * Helper function to draw a star
 */
function drawStar(doc: jsPDF, x: number, y: number, size: number, color: string) {
  const rgb = hexToRgb(color);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);

  const points = [
    [0, -size],
    [size * 0.4, -size * 0.4],
    [size, 0],
    [size * 0.4, size * 0.4],
    [0, size],
    [-size * 0.4, size * 0.4],
    [-size, 0],
    [-size * 0.4, -size * 0.4],
  ];

  doc.lines(
    points.map(([px, py], i) => {
      const [nx, ny] = points[(i + 1) % points.length];
      return [nx - px, ny - py];
    }),
    x, y, [1, 1], "F"
  );
}

/**
 * Helper function to draw a diamond
 */
function drawDiamond(doc: jsPDF, x: number, y: number, size: number, color: string) {
  const rgb = hexToRgb(color);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  
  // Create diamond path
  const points = [
    [0, -size],  // Top point
    [size, 0],   // Right point
    [0, size],   // Bottom point
    [-size, 0]   // Left point
  ];
  
  doc.lines(
    [
      [points[1][0] - points[0][0], points[1][1] - points[0][1]],
      [points[2][0] - points[1][0], points[2][1] - points[1][1]],
      [points[3][0] - points[2][0], points[3][1] - points[2][1]],
      [points[0][0] - points[3][0], points[0][1] - points[3][1]]
    ],
    x + points[0][0], y + points[0][1], [1, 1], 'F'
  );
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