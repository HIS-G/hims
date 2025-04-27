const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const QRCode = require("qrcode");

const generateQRCode = async (url) => {
  const qrCode = await QRCode.toDataURL(url);
  return qrCode;
};

const generatePdfWithQrCode = async (customer, qrCode) => {
  // Create a new PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  /* const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 20; */
  // Embed QR image
  // const qrImageBytes = qrCode.split(',')[1]; // remove data:image/...;base64,
  const qrImage = await pdfDoc.embedPng(qrCode);
  const qrDims = qrImage.scale(2.5);

  const headerText = `Join, Share and Win £500 cash Scan the QR code below`;

  const hism_logo_path = path.resolve(__dirname, "hism.png");
  const hism_logo_bytes = fs.readFileSync(hism_logo_path);

  const his_logo_path = path.resolve(__dirname, "his.png");
  const his_logo_bytes = fs.readFileSync(his_logo_path);

  const FooterText = `Whats HISM for?
  HISM is for promoting products and services at the same time creating opportunities for all players or members to earn money and other opportunities or rewards.
  Building New Celebrities and Influencers
  An Assemblage of Celebrities and Influencers
  Connects all Social Media Platforms in one Hub
  A Marketplace for Promoting Products & Services`;

  const embedded_hism_logo = await pdfDoc.embedPng(hism_logo_bytes);

  page.drawImage(embedded_hism_logo, {
    x: page.getWidth() - embedded_hism_logo.width - 50,
    y: 50,
    width: embedded_hism_logo.width,
    height: embedded_hism_logo.height,
  });

  page.drawText(headerText, {
    x: page.width,
    y: headerText > 50 ? headerText : 50, // keep within page bounds
    size: 12,
    color: rgb(0, 0, 0),
    lineHeight: 16,
    maxWidth: 500,
  });

  // Draw the QR code on the PDF
  page.drawImage(qrImage, {
    x: 50,
    y: 200,
    width: qrDims.width,
    height: qrDims.height,
  });

  page.drawText(FooterText, {
    x: page.width,
    y: 400, // keep within page bounds
    size: 12,
    color: rgb(0, 0, 0),
    lineHeight: 16,
    maxWidth: 500,
  });

  const embedded_his_logo = await pdfDoc.embedPng(his_logo_bytes);

  page.drawImage(embedded_his_logo, {
    x: page.getWidth() - embedded_his_logo.width - 50,
    y: 50,
    width: embedded_his_logo.width,
    height: embedded_his_logo.height,
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes); // Return as a Buffer
};

module.exports = {
  generateQRCode,
  generatePdfWithQrCode,
};
