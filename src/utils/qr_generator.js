const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const puppeteer = require("puppeteer");
const pdf = require("html-pdf-node");
const ejs = require("ejs");

const hismLogo = `data:image/png;base64,${fs.readFileSync(
  path.join(__dirname, "hism.png"),
  {
    encoding: "base64",
  }
)}`;
const hisLogo = `data:image/png;base64,${fs.readFileSync(
  path.join(__dirname, "his.png"),
  {
    encoding: "base64",
  }
)}`;

const generateQRCode = async (url) => {
  const qrCode = await QRCode.toDataURL(url);
  return qrCode;
};

const generatePdfWithQrCode = async (customer, qrCode) => {
  try {
    const htmlContent = await generateHtmlFromEjs({
      qrCode, // data:image/png;base64,...
      hisLogo,
      hismLogo,
    });

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // or your actual path
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF with QR Code:", error);
  }

  // Create a new PDF
  /* try {
    const htmlContent = createHtmlTemplate(qrCode, hisLogo, hismLogo);
    const pdfBuffer = await pdf.generatePdf(
      { content: htmlContent },
      {
        format: "A4",
        printBackground: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      }
    );

    if (!fs.existsSync("qr_codes")) {
      fs.mkdirSync("qr_codes");
    }

    fs.writeFileSync(`qr_codes/${customer.id}.pdf`, pdfBuffer);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  } */
};

/* const createHtmlTemplate = (qrCode, hisLogo, hismLogo) => {
  let qr_code = "No QR Code available";

  if (qrCode) {
    qr_code = `data:image/png;base64,${qrCode}`;
  }
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>QR Code Document</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #333;
        }
        .qr-container {
          margin: 20px 0;
          text-align: center;
        }
        .nav {
          background-color: #f8f8f8;
          padding: 10px;
          border-bottom: 1px solid #ddd;
          text-align: center;
          overflow: hidden;
        }
        .nav img {
          height: 50px;
          margin: 0 10px;
          vertical-align: middle;
        }
      </style>
    </head>
    <body>
      <div class="nav">
        <img src="${hisLogo}" alt="HIS Logo" />
        <img src="${hismLogo}" alt="HISM Logo" />
      </div>

      <h1>Welcome to HISM</h1>
      <p>Join, Share and Win £500 cash!</p>

      <div class="qr-container">
        <img src="${qr_code}" alt="QR Code" width="200" />
      </div>

      <p>Scan the QR code to join HISM and start earning rewards!</p>

      <div>
        <p>What's HISM for?</p>
        <ul>
          <li>Promoting products and services while creating income opportunities.</li>
          <li>Building new celebrities and influencers.</li>
          <li>An assemblage of celebrities and influencers.</li>
          <li>Connecting all social media platforms in one hub.</li>
          <li>A marketplace for promoting products & services.</li>
        </ul>
      </div>
    </body>
  </html>
  `;
}; */

const generateHtmlFromEjs = async (data) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "views",
    "qr_code_template.ejs"
  );

  const html = await ejs.renderFile(templatePath, data);
  return html;
};

module.exports = {
  generateQRCode,
  generatePdfWithQrCode,
  generateHtmlFromEjs,
};
