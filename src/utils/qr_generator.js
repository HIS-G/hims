const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const QRCode = require('qrcode');

const generateQRCode = async (url) => {
    const qrCode = await QRCode.toDataURL(url);
    return qrCode;
};

const generatePdfWithQrCode = async (customer, qrCode) => { 
  // Create a new PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const fontSize = 20;
  // Embed QR image
  // const qrImageBytes = qrCode.split(',')[1]; // remove data:image/...;base64,
  const qrImage = await pdfDoc.embedPng(qrCode);
  const qrDims = qrImage.scale(2.5);

  const headerText = `Join, Share and Win £500 cash Scan the QR code below`;
  const hism_logo = fs.readFileSync(path.resolve(__dirname, 'hism.png'));
  const his_logo = fs.readFileSync(path.resolve(__dirname, 'his.png'));

  const FooterText = `What’s HISM for?
  - HISM is for promoting products & services at the same time creating opportunities for all players/members to earn money and other opportunities/rewards.
  - Building New Celebrities and Influencers.
  - An Assemblage of Celebrities & Influencers.
  - Connects all Social Media Platforms in one Hub.
  - A Marketplace for Promoting Products & Services.`

  const embedded_hism_logo = await pdfDoc.embedPng(hism_logo);
  const scaled_embedded_hism_logo = embedded_hism_logo.scaleToFit(embedded_hism_logo.width, embedded_hism_logo.height);
  
  page.drawImage(scaled_embedded_hism_logo, {
    x: page.getWidth() - embedded_hism_logo.width,
    y: page.getHeight() - embedded_hism_logo.height - 50,
    width: embedded_hism_logo.width,
    height: embedded_hism_logo.height,
  });

  const headerTextWidth = font.widthOfTextAtSize(headerText, fontSize);
  const header_x = (page.getWidth() - headerTextWidth) / 2

  page.drawText(headerText, {
    x: header_x,
    y: textY > 50 ? textY : 50, // keep within page bounds
    size: 12,
    font,
    color: rgb(0, 0, 0),
    lineHeight: 16,
    maxWidth: 500
  });

  // Draw the QR code on the PDF
  page.drawImage(qrImage, {
    x: 50,
    y: 200,
    width: qrDims.width,
    height: qrDims.height,
  });

  const footerTextWidth = font.widthOfTextAtSize(FooterText, fontSize);
  const footer_x = (page.getWidth() - footerTextWidth) / 2

  page.drawText(FooterText, {
    x: footer_x,
    y: 400, // keep within page bounds
    size: 12,
    font,
    color: rgb(0, 0, 0),
    lineHeight: 16,
    maxWidth: 500
  });

  const embedded_his_logo = await pdfDoc.embedPng(his_logo);
  const scaled_embedded_his_logo = embedded_hism_logo.scaleToFit(embedded_his_logo.width, embedded_his_logo.height);
  
  page.drawImage(scaled_embedded_his_logo, {
    x: page.getWidth() - embedded_his_logo.width,
    y: page.getHeight() - embedded_his_logo.height - 50,
    width: embedded_his_logo.width,
    height: embedded_his_logo.height,
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes); // Return as a Buffer
}

module.exports = {
    generateQRCode,
    generatePdfWithQrCode
}
