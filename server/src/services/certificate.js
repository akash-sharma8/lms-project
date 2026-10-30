import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const NAVY = "#1a3c6e";
const GREY = "#666666";

export async function writeCertificate(res, data) {
  const { studentName, courseTitle, instructorName, date, certId, verifyUrl } = data;

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
  const W = doc.page.width;
  const H = doc.page.height;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="certificate-${certId}.pdf"`);
  doc.pipe(res);

  // double border
  doc.rect(20, 20, W - 40, H - 40).lineWidth(4).stroke(NAVY);
  doc.rect(30, 30, W - 60, H - 60).lineWidth(1).stroke(NAVY);

  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(38)
    .text("Certificate of Completion", 0, 90, { width: W, align: "center" });

  doc.fillColor(GREY).font("Helvetica").fontSize(15)
    .text("This is to certify that", 0, 160, { width: W, align: "center" });

  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(34)
    .text(studentName, 60, 195, { width: W - 120, align: "center" });

  doc.fillColor(GREY).font("Helvetica").fontSize(15)
    .text("has successfully completed the course", 0, 255, { width: W, align: "center" });

  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(24)
    .text(courseTitle, 60, 285, { width: W - 120, align: "center" });

  doc.fillColor(GREY).font("Helvetica").fontSize(13)
    .text(`Instructor: ${instructorName}`, 0, 345, { width: W, align: "center" })
    .text(`Issued on ${date}`, 0, 365, { width: W, align: "center" });

  // QR: scan karne par verify page khulta hai
  const qr = await QRCode.toBuffer(verifyUrl, { width: 220, margin: 1 });
  doc.image(qr, W - 150, H - 150, { width: 90 });

  doc.fillColor(GREY).fontSize(10)
    .text(`Certificate ID: ${certId}`, 60, H - 90, { width: 400 })
    .text("Scan the QR code to verify this certificate", 60, H - 75, { width: 400 });

  doc.end();
}