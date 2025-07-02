const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const puppeteer = require("puppeteer");

const hismLogo = fs.readFileSync(path.join(__dirname, "hism.png"), {
  encoding: "base64",
});
const hisLogo = fs.readFileSync(path.join(__dirname, "his.png"), {
  encoding: "base64",
});

const generateQRCode = async (url) => {
  const qrCode = await QRCode.toDataURL(url);
  return qrCode;
};

const generatePdfWithQrCode = async (customer, qrCode) => {
  // Create a new PDF
  const htmlContent = createHtmlTemplate(qrCode, true);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    // fs.writeFileSync("puppeteer_test.pdf", pdfBuffer);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

const generateQrCodePdf = async (qrCode) => {
  const htmlContent = createHtmlTemplate(qrCode, false);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    // fs.writeFileSync("puppeteer_test.pdf", pdfBuffer);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

const createHtmlTemplate = (qrCode, showFull = true) => {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>QR Code Document</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #333; }
      .qr-container { margin: 20px 0; }
      .nav { background-color: #f8f8f8; padding: 10px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
      footer { margin-top: 40px; font-size: 12px; color: #777; }
    </style>
  </head>
  <body>
    <div class="nav">
      <img src="data:image/png;base64,${hisLogo}" alt="HIS" style="height: 50px;" />
      <img src="data:image/png;base64,${hismLogo}" alt="HISM Logo" style="height: 50px;" />
    </div>
    <h1>Welcome to HISM</h1>
    <p>Join, Share and Win £500 cash!</p>
    <div class="qr-container">
      <img src="data:image/png;base64,${qrCode}" alt="QR Code" />
    </div>
    <p>Scan the QR code to join HISM and start earning rewards!</p>
    ${
      showFull
        ? `<div>
            <p>What’s HISM for?</p>
            <ul>
              <li>Promoting products and services while creating income opportunities.</li>
              <li>Building new celebrities and influencers.</li>
              <li>An assemblage of celebrities and influencers.</li>
              <li>Connecting all social media platforms in one hub.</li>
              <li>A marketplace for promoting products & services.</li>
            </ul>
          </div>`
        : ""
    }
  </body>
  </html>`;
};

module.exports = {
  generateQRCode,
  generatePdfWithQrCode,
  generateQrCodePdf,
};
