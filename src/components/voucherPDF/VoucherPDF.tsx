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
  logoUrl?: string; // Logo da empresa (pequena, ao lado do nome)
  showLogo?: boolean;
  showQRCode?: boolean;
  showExpiryDate?: boolean;
  voucherImageUrl?: string; // Imagem grande do voucher (lado direito)
}

/**
 * Generates a voucher PDF similar to the provided design
 */
export const generateVoucherPDF = async (voucher: Voucher): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5",
  });

  // Cores principais
  const goldColor = "#D4A574"; // Cor dourada/âmbar
  const darkGrayColor = "#4A4A4A"; // Cinza escuro para texto
  const lightGrayColor = "#8A8A8A"; // Cinza claro
  const whiteColor = "#FFFFFF";

  const goldRGB = hexToRgb(goldColor);
  const darkGrayRGB = hexToRgb(darkGrayColor);
  const lightGrayRGB = hexToRgb(lightGrayColor);

  // Dimensões da página
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Fundo branco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Decoração nas bordas (elementos geométricos dourados)
  drawBorderDecorations(doc, width, height, goldColor);

  // Logo da empresa (pequena, lado esquerdo)
  const logoSize = 15;
  const logoX = 15;
  const logoY = 15;

  if (voucher.logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(voucher.logoUrl);
      doc.addImage(logoBase64, "JPEG", logoX, logoY, logoSize, logoSize);
    } catch (error) {
      console.error("Erro ao carregar logo da empresa:", error);
    }
  }

  // Nome da empresa "ECO SALGADOS"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(darkGrayRGB.r, darkGrayRGB.g, darkGrayRGB.b);
  doc.text("ECO SALGADOS", logoX + logoSize + 5, logoY + 8);

  // Subtítulo da empresa
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(lightGrayRGB.r, lightGrayRGB.g, lightGrayRGB.b);
  doc.text("AGROTURISMO & ACTIVIDADES EQUESTRES", logoX + logoSize + 5, logoY + 14);

  // Estrelas de avaliação (abaixo do nome da empresa)
  const starSize = 3;
  const starSpacing = 8;
  const starStartX = logoX + logoSize + 5;
  const starY = logoY + 20;
  
  for (let i = 0; i < 5; i++) {
    const starX = starStartX + i * starSpacing;
    drawStar(doc, starX, starY, starSize, goldColor);
  }

  // Linha horizontal decorativa
  doc.setDrawColor(goldRGB.r, goldRGB.g, goldRGB.b);
  doc.setLineWidth(1);
  doc.line(15, 45, width - 15, 45);

  // "Gift Voucher" em script elegante
  doc.setFont("times", "italic");
  doc.setFontSize(36);
  doc.setTextColor(darkGrayRGB.r, darkGrayRGB.g, darkGrayRGB.b);
  doc.text("Gift Voucher", 20, 65);

  // Título do passeio
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(darkGrayRGB.r, darkGrayRGB.g, darkGrayRGB.b);
  doc.text("PASSEIO", 20, 85);
  doc.text("NA PRAIA", 20, 100);

  // Número do voucher
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(darkGrayRGB.r, darkGrayRGB.g, darkGrayRGB.b);
  doc.text(`Voucher nº ${voucher.code || "20250214"}`, 20, 115);

  // Selo circular "VÁLIDO 1 ANO"
  const sealX = width / 2 - 20;
  const sealY = 70;
  const sealRadius = 18;
  
  // Círculo externo dourado
  doc.setFillColor(goldRGB.r, goldRGB.g, goldRGB.b);
  doc.circle(sealX, sealY, sealRadius, "F");
  
  // Círculo interno branco
  doc.setFillColor(255, 255, 255);
  doc.circle(sealX, sealY, sealRadius - 3, "F");
  
  // Texto do selo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkGrayRGB.r, darkGrayRGB.g, darkGrayRGB.b);
  doc.text("VÁLIDO", sealX, sealY - 3, { align: "center" });
  doc.text("1 ANO", sealX, sealY + 3, { align: "center" });
  
  // Pontos decorativos no selo
  const dotSize = 0.5;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const dotX = sealX + Math.cos(angle) * (sealRadius - 6);
    const dotY = sealY + Math.sin(angle) * (sealRadius - 6);
    doc.setFillColor(darkGrayRGB.r, darkGrayRGB.g, darkGrayRGB.b);
    doc.circle(dotX, dotY, dotSize, "F");
  }

  // Imagem grande do voucher (lado direito)
  const voucherImageWidth = width * 0.45;
  const voucherImageHeight = height * 0.7;
  const voucherImageX = width - voucherImageWidth - 10;
  const voucherImageY = 20;

  if (voucher.voucherImageUrl) {
    try {
      const voucherImageBase64 = await loadImageAsBase64(voucher.voucherImageUrl);
      doc.addImage(voucherImageBase64, "JPEG", voucherImageX, voucherImageY, voucherImageWidth, voucherImageHeight);
    } catch (error) {
      console.error("Erro ao carregar imagem do voucher:", error);
      // Placeholder se não conseguir carregar a imagem
      doc.setFillColor(240, 240, 240);
      doc.rect(voucherImageX, voucherImageY, voucherImageWidth, voucherImageHeight, "F");
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(12);
      doc.text("Imagem do Voucher", voucherImageX + voucherImageWidth/2, voucherImageY + voucherImageHeight/2, { align: "center" });
    }
  }

  // QR Code (canto inferior esquerdo)
  if (voucher.qrCode || voucher.showQRCode) {
    let qrDataURL = voucher.qrCode;
    
    if (!qrDataURL) {
      // Gerar QR Code se não existir
      try {
        qrDataURL = await QRCode.toDataURL(voucher.code || voucher.id, {
          width: 150,
          margin: 1,
          color: {
            dark: darkGrayColor,
            light: whiteColor
          }
        });
      } catch (error) {
        console.error("Erro ao gerar QR Code:", error);
      }
    }
    
    if (qrDataURL) {
      const qrSize = 20;
      const qrX = 15;
      const qrY = height - qrSize - 15;
      doc.addImage(qrDataURL, "PNG", qrX, qrY, qrSize, qrSize);
    }
  }

  // Data de validade (rodapé)
  if (voucher.expiryDate || voucher.showExpiryDate) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(lightGrayRGB.r, lightGrayRGB.g, lightGrayRGB.b);
    const expiryText = voucher.expiryDate 
      ? `Válido até: ${new Date(voucher.expiryDate).toLocaleDateString('pt-PT')}`
      : "Válido por 1 ano a partir da data de emissão";
    doc.text(expiryText, width / 2, height - 10, { align: "center" });
  }

  return doc.output("blob");
};

/**
 * Draws decorative border elements
 */
function drawBorderDecorations(doc: jsPDF, width: number, height: number, color: string) {
  const rgb = hexToRgb(color);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.setDrawColor(rgb.r, rgb.g, rgb.b);
  doc.setLineWidth(2);

  // Cantos decorativos
  const cornerSize = 20;
  
  // Canto superior esquerdo
  doc.line(0, cornerSize, cornerSize, cornerSize);
  doc.line(cornerSize, 0, cornerSize, cornerSize);
  
  // Canto superior direito
  doc.line(width - cornerSize, 0, width - cornerSize, cornerSize);
  doc.line(width - cornerSize, cornerSize, width, cornerSize);
  
  // Canto inferior esquerdo
  doc.line(0, height - cornerSize, cornerSize, height - cornerSize);
  doc.line(cornerSize, height - cornerSize, cornerSize, height);
  
  // Canto inferior direito
  doc.line(width - cornerSize, height - cornerSize, width - cornerSize, height);
  doc.line(width - cornerSize, height - cornerSize, width, height - cornerSize);

  // Elementos decorativos (losangos pequenos)
  const diamondSize = 2;
  
  // Topo
  drawDiamond(doc, width/2, 8, diamondSize, color);
  drawDiamond(doc, width/2 - 15, 8, diamondSize * 0.7, color);
  drawDiamond(doc, width/2 + 15, 8, diamondSize * 0.7, color);
  
  // Lado esquerdo
  drawDiamond(doc, 8, height/2, diamondSize, color);
  drawDiamond(doc, 8, height/2 - 15, diamondSize * 0.7, color);
  drawDiamond(doc, 8, height/2 + 15, diamondSize * 0.7, color);
}

/**
 * Helper function to load image as base64
 */
async function loadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper function to draw a star
 */
function drawStar(doc: jsPDF, x: number, y: number, size: number, color: string) {
  const rgb = hexToRgb(color);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);

  const points = [];
  const outerRadius = size;
  const innerRadius = size * 0.4;
  
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    points.push([
      x + Math.cos(angle) * radius,
      y + Math.sin(angle) * radius
    ]);
  }

  doc.setDrawColor(rgb.r, rgb.g, rgb.b);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  
  // Draw star using lines
  const lines = [];
  for (let i = 0; i < points.length; i++) {
    const nextIndex = (i + 1) % points.length;
    lines.push([
      points[nextIndex][0] - points[i][0],
      points[nextIndex][1] - points[i][1]
    ]);
  }
  
  doc.lines(lines, points[0][0], points[0][1], [1, 1], "F");
}

/**
 * Helper function to draw a diamond
 */
function drawDiamond(doc: jsPDF, x: number, y: number, size: number, color: string) {
  const rgb = hexToRgb(color);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  
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