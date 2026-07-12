import { jsPDF } from "jspdf";
import { DiagnosisReport } from "../types";

export function generateDiagnosisPDF(report: DiagnosisReport, uploadedImageBase64: string, dateStr: string): void {
  // Create instance of jsPDF (A4 page format)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // A4: ~210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // A4: ~297mm
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin); // ~180mm

  let currentY = 15;

  // Primary colors
  const forestGreen = [21, 128, 61]; // #15803d
  const charGray = [31, 41, 55]; // #1f2937
  const borderGray = [229, 231, 235]; // #e5e7eb
  const accentRust = [180, 83, 9]; // #b45309 (amber-700)

  // Helper: Draw a horizontal separator line
  const drawSeparator = (y: number) => {
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Helper: Safely wrap and render text block with a specific height calculation
  const renderTextParagraph = (text: string, y: number, fontSize = 10, color = charGray, isBold = false): number => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.42; // multiplier to convert pt to mm
    
    // Check if we need to add a page
    if (y + (lines.length * lineHeight) > pageHeight - margin - 10) {
      doc.addPage();
      drawPageBorder();
      y = margin + 10;
    }

    lines.forEach((line: string, index: number) => {
      doc.text(line, margin, y + (index * lineHeight));
    });

    return y + (lines.length * lineHeight);
  };

  // Helper: Draw decorative background frame / page border
  const drawPageBorder = () => {
    doc.setDrawColor(forestGreen[0], forestGreen[1], forestGreen[2]);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    
    // Tiny header
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.setFont("helvetica", "normal");
    doc.text("PLANT PATHOLOGY LAB REPORT - AI DIAGNOSIS ENGINE", margin, 10);
    
    // Footer page count placeholder
    doc.text("Page " + doc.getNumberOfPages(), pageWidth - margin - 15, pageHeight - 10);
  };

  // Initial setup for Page 1
  drawPageBorder();

  // 1. Report Title & Header Banner
  doc.setFillColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  doc.rect(margin, currentY, contentWidth, 18, "F");

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("AGRICULTURAL HEALTH & DIAGNOSTIC REPORT", margin + 6, currentY + 11.5);
  currentY += 23;

  // 2. Summary Details Grid (Metadata)
  doc.setFontSize(10);
  doc.setTextColor(charGray[0], charGray[1], charGray[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Diagnosis Date:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, margin + 30, currentY);

  doc.setFont("helvetica", "bold");
  doc.text("Target Crop:", margin + 95, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${report.plantInfo.name} (${report.plantInfo.scientificName})`, margin + 120, currentY);

  currentY += 6;

  doc.setFont("helvetica", "bold");
  doc.text("AI Confidence:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${Math.round(report.confidenceScore * 100)}% Match`, margin + 30, currentY);

  doc.setFont("helvetica", "bold");
  doc.text("Report Status:", margin + 95, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(report.diseaseInfo.detected ? accentRust[0] : forestGreen[0], report.diseaseInfo.detected ? accentRust[1] : forestGreen[1], report.diseaseInfo.detected ? accentRust[2] : forestGreen[2]);
  doc.text(report.diseaseInfo.detected ? `Infected - ${report.diseaseInfo.name}` : "Healthy Leaf - No Pathogens Detected", margin + 120, currentY);

  currentY += 8;
  drawSeparator(currentY);
  currentY += 8;

  // 3. Insert Uploaded Image & Key Diagnosis
  // Draw section header
  doc.setFontSize(12);
  doc.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  doc.setFont("helvetica", "bold");
  doc.text("1. VISUAL SYMPTOM ANALYSIS", margin, currentY);
  currentY += 5;

  let imageWidth = 50;
  let imageHeight = 38;
  let textStartX = margin + imageWidth + 8;
  let textAvailableWidth = contentWidth - imageWidth - 8;

  // Try to render leaf image
  try {
    if (uploadedImageBase64) {
      // Scale down image appropriately
      doc.addImage(uploadedImageBase64, "JPEG", margin, currentY, imageWidth, imageHeight);
    }
  } catch (e) {
    // Placeholder if image type is incompatible or failed
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, currentY, imageWidth, imageHeight);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("[Image preview not supported]", margin + 5, currentY + 20);
  }

  // Symptom Analysis Right Side Text
  doc.setFontSize(10);
  doc.setTextColor(charGray[0], charGray[1], charGray[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`Identified Disease:`, textStartX, currentY + 4);
  doc.setFont("helvetica", "normal");
  doc.text(report.diseaseInfo.name, textStartX + 35, currentY + 4);

  doc.setFont("helvetica", "bold");
  doc.text(`Severity Level:`, textStartX, currentY + 10);
  doc.setFont("helvetica", "normal");
  doc.text(report.diseaseInfo.severityLevel, textStartX + 35, currentY + 10);

  doc.setFont("helvetica", "bold");
  doc.text(`Estimated Recovery:`, textStartX, currentY + 16);
  doc.setFont("helvetica", "normal");
  doc.text(report.diseaseInfo.estimatedRecoveryTime, textStartX + 35, currentY + 16);

  // Distinguishing healthy vs diseased description
  doc.setFont("helvetica", "bold");
  doc.text(`Leaf Assessment:`, textStartX, currentY + 22);
  doc.setFont("helvetica", "normal");
  const compLines = doc.splitTextToSize(report.healthyVsDiseasedComparison.diseasedDescription, textAvailableWidth);
  doc.text(compLines.slice(0, 3), textStartX, currentY + 27); // render max 3 lines to fit beside image

  currentY += imageHeight + 8;
  drawSeparator(currentY);
  currentY += 8;

  // 4. Disease Description, Causes & Symptoms (Full Width)
  doc.setFontSize(12);
  doc.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  doc.setFont("helvetica", "bold");
  doc.text("2. PATHOLOGICAL STUDY", margin, currentY);
  currentY += 5;

  currentY = renderTextParagraph(`Disease Description: ${report.diseaseInfo.description}`, currentY, 10, charGray);
  currentY += 4;

  // Causes Bullet Points
  doc.setFontSize(10);
  doc.setTextColor(charGray[0], charGray[1], charGray[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Underlying Pathogen & Causes:", margin, currentY);
  currentY += 5;

  report.diseaseInfo.causes.forEach((cause) => {
    currentY = renderTextParagraph(`• ${cause}`, currentY, 9.5, charGray);
  });
  currentY += 4;

  // Symptoms Bullet Points
  doc.setFont("helvetica", "bold");
  doc.text("Diagnostic Symptoms:", margin, currentY);
  currentY += 5;

  report.diseaseInfo.symptoms.forEach((symptom) => {
    currentY = renderTextParagraph(`• ${symptom}`, currentY, 9.5, charGray);
  });
  currentY += 4;

  // Environmental conditions
  doc.setFont("helvetica", "bold");
  doc.text("Promoting Environmental Conditions:", margin, currentY);
  currentY += 5;
  currentY = renderTextParagraph(report.diseaseInfo.environmentalConditions, currentY, 10, charGray);
  
  currentY += 8;
  drawSeparator(currentY);
  currentY += 8;

  // 5. Crop Agronomy (Start of Page 2 usually or checking boundary)
  if (currentY > pageHeight - 80) {
    doc.addPage();
    drawPageBorder();
    currentY = margin + 10;
  }

  doc.setFontSize(12);
  doc.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  doc.setFont("helvetica", "bold");
  doc.text("3. CROP AGRONOMY GUIDELINES", margin, currentY);
  currentY += 5;

  doc.setFontSize(10);
  doc.setTextColor(charGray[0], charGray[1], charGray[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Plant Details:", margin, currentY);
  currentY += 5;

  currentY = renderTextParagraph(report.plantInfo.description, currentY, 9.5, charGray);
  currentY += 4;

  // Grid for agronomy specs
  const drawSpecGrid = (label1: string, val1: string, label2: string, val2: string, y: number) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label1, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(val1, margin + 35, y);

    doc.setFont("helvetica", "bold");
    doc.text(label2, margin + 95, y);
    doc.setFont("helvetica", "normal");
    doc.text(val2, margin + 130, y);
    return y + 5;
  };

  currentY = drawSpecGrid("Crop Category:", report.plantInfo.cropCategory, "Ideal Growing Season:", report.plantInfo.growingSeason, currentY);
  currentY = drawSpecGrid("Soil Type Required:", report.plantInfo.soilType, "Watering Schedule:", report.plantInfo.waterRequirements, currentY);
  currentY = drawSpecGrid("Growth Temperature:", report.plantInfo.idealTemperature, "Botanical Reference:", report.plantInfo.scientificName, currentY);

  currentY += 8;
  drawSeparator(currentY);
  currentY += 8;

  // 6. Recommended Agrochemical & Biological Medicines (New Page)
  doc.addPage();
  drawPageBorder();
  currentY = margin + 10;

  doc.setFontSize(12);
  doc.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  doc.setFont("helvetica", "bold");
  doc.text("4. RECOMMENDED MEDICINAL TREATMENT REGIMEN", margin, currentY);
  currentY += 5;

  if (report.recommendedMedicines.length === 0) {
    currentY = renderTextParagraph("No specific agrochemical medicine is required for this healthy plant. Standard protective practices apply.", currentY, 10, charGray);
  } else {
    report.recommendedMedicines.forEach((med, idx) => {
      // Border around each medicine block
      doc.setDrawColor(210, 214, 219);
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, contentWidth, 42, "FD");

      // Title
      doc.setFontSize(11);
      doc.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${med.name} (${med.type})`, margin + 4, currentY + 6);

      // Specs
      doc.setFontSize(9);
      doc.setTextColor(charGray[0], charGray[1], charGray[2]);
      
      doc.setFont("helvetica", "bold");
      doc.text("Active Ingredient:", margin + 4, currentY + 12);
      doc.setFont("helvetica", "normal");
      doc.text(med.activeIngredient, margin + 35, currentY + 12);

      doc.setFont("helvetica", "bold");
      doc.text("dosage & method:", margin + 95, currentY + 12);
      doc.setFont("helvetica", "normal");
      doc.text(`${med.recommendedDosage} / ${med.applicationMethod}`, margin + 128, currentY + 12);

      currentY += 5; // Move next line down in block
      doc.setFont("helvetica", "bold");
      doc.text("Target Purpose:", margin + 4, currentY + 12);
      doc.setFont("helvetica", "normal");
      doc.text(med.purpose, margin + 35, currentY + 12);

      doc.setFont("helvetica", "bold");
      doc.text("Frequency / recovery:", margin + 95, currentY + 12);
      doc.setFont("helvetica", "normal");
      doc.text(`${med.frequency} (Est. ${med.estimatedRecoveryTime})`, margin + 128, currentY + 12);

      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Safety Precautions:", margin + 4, currentY + 12);
      doc.setFont("helvetica", "normal");
      const precLines = doc.splitTextToSize(med.safetyPrecautions, contentWidth - 42);
      doc.text(precLines, margin + 35, currentY + 12);

      currentY += 31; // advance to next element block
    });
  }

  currentY += 5;
  drawSeparator(currentY);
  currentY += 8;

  // 7. Organic and Chemical Treatment Bulletins
  doc.setFontSize(12);
  doc.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  doc.setFont("helvetica", "bold");
  doc.text("5. COMPREHENSIVE CONTROL PROTOCOLS", margin, currentY);
  currentY += 5;

  doc.setFontSize(10);
  doc.setTextColor(charGray[0], charGray[1], charGray[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Organic & Cultural Treatment Options:", margin, currentY);
  currentY += 5;

  report.organicTreatments.forEach((opt) => {
    currentY = renderTextParagraph(`• ${opt}`, currentY, 9.5, charGray);
  });
  currentY += 4;

  doc.setFont("helvetica", "bold");
  doc.text("Standard Agrochemical/Chemical Controls:", margin, currentY);
  currentY += 5;

  report.chemicalTreatments.forEach((chem) => {
    currentY = renderTextParagraph(`• ${chem}`, currentY, 9.5, charGray);
  });
  currentY += 4;

  doc.setFont("helvetica", "bold");
  doc.text("Proactive Prevention Strategies:", margin, currentY);
  currentY += 5;

  report.diseaseInfo.preventionTips.forEach((tip) => {
    currentY = renderTextParagraph(`• ${tip}`, currentY, 9.5, charGray);
  });

  // Save the PDF
  const sanitizedCropName = report.plantInfo.name.replace(/[^a-zA-Z0-9]/g, "_");
  const sanitizedDiseaseName = report.diseaseInfo.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Agricultural_Diagnosis_${sanitizedCropName}_${sanitizedDiseaseName}.pdf`);
}
