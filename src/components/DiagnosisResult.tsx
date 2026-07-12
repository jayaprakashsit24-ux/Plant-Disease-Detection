import React from "react";
import { DiagnosisReport } from "../types";
import { 
  FileText, ArrowDownToLine, Droplet, Thermometer, ShieldAlert, 
  Layers, Hammer, Sparkles, BookOpen, Clock, AlertCircle, RefreshCw
} from "lucide-react";
import { 
  PlantLeafIllustration, MedicineBottleIllustration, ScoreGauge, SeverityBadge 
} from "./AgriculturalIllustrations";
import { CompareLeaf } from "./CompareLeaf";
import { GuidelineLinks } from "./GuidelineLinks";
import { generateDiagnosisPDF } from "../utils/pdfGenerator";

interface DiagnosisResultProps {
  report: DiagnosisReport;
  uploadedImage: string; // base64 Data URL
  dateStr: string;
}

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  report,
  uploadedImage,
  dateStr,
}) => {
  const { 
    plantInfo, diseaseInfo, recommendedMedicines, 
    organicTreatments, chemicalTreatments, similarDiseases, confidenceScore 
  } = report;

  const handleDownloadPDF = () => {
    generateDiagnosisPDF(report, uploadedImage, dateStr);
  };

  return (
    <div id="diagnosis-results" className="space-y-8 animate-fade-in">
      {/* Summary Diagnostics Bar */}
      <div className="bg-white border border-editorial-dark/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Circular Score Gauge */}
          <ScoreGauge score={confidenceScore} className="w-20 h-20 flex-shrink-0" />
          
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-editorial-green bg-editorial-green/5 border border-editorial-green/15 px-2.5 py-0.5">
                Crop AI Analysis Completed
              </span>
              {diseaseInfo.detected && (
                <SeverityBadge severity={diseaseInfo.severityLevel} />
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-serif italic text-editorial-dark mt-1">
              {plantInfo.name} <span className="text-gray-400 font-sans font-normal text-sm sm:inline sm:ml-1">({plantInfo.scientificName})</span>
            </h2>
            
            <p className="text-xs text-gray-500 font-sans mt-1 leading-relaxed">
              {diseaseInfo.detected 
                ? `Infection found: ${diseaseInfo.name}. Recovery is possible within ${diseaseInfo.estimatedRecoveryTime} with proper therapy.`
                : "Plant leaf diagnosed as fully healthy and productive. Excellent leaf cuticle thickness!"
              }
            </p>
          </div>
        </div>

        {/* Action Button: PDF Report */}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-editorial-dark hover:bg-editorial-dark hover:text-white text-editorial-dark font-bold text-[10px] uppercase tracking-widest transition-colors shrink-0 group cursor-pointer"
        >
          <ArrowDownToLine className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          Download PDF Report
        </button>
      </div>

      {/* Grid: Uploaded Image & Crop Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Leaf Upload Preview */}
        <div className="bg-white border border-editorial-dark/10 p-5 flex flex-col">
          <h3 className="font-serif italic text-editorial-dark/40 text-xs uppercase tracking-widest mb-3">
            02. Source Image Captured
          </h3>
          <div className="flex-1 relative aspect-square border border-editorial-dark/10 bg-editorial-bg flex items-center justify-center">
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Uploaded leaf tissue scan"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <PlantLeafIllustration isDiseased={diseaseInfo.detected} className="w-24 h-24" />
            )}
          </div>
          <div className="bg-editorial-bg border border-editorial-dark/5 p-3.5 mt-3.5 flex items-center gap-3">
            <Clock className="w-4 h-4 text-editorial-green" />
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              <div>Diagnosed On:</div>
              <div className="font-mono font-bold text-editorial-dark mt-0.5">{dateStr}</div>
            </div>
          </div>
        </div>

        {/* Center/Right column: Pathology & Botanical Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pathological Diagnostics Card */}
          <div className="bg-white border border-editorial-dark/10 p-6">
            <h3 className="text-editorial-green font-bold text-[10px] uppercase tracking-widest mb-3">
              I. PATHOLOGICAL ASSESSMENT
            </h3>
            
            <div className="flex items-start gap-4 pb-4 border-b border-editorial-dark/10">
              <div className="bg-editorial-rust/5 p-3 flex-shrink-0 text-editorial-rust border border-editorial-rust/15">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif italic text-editorial-dark text-lg">
                  {diseaseInfo.name}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                  {diseaseInfo.description}
                </p>
              </div>
            </div>

            {/* Causes & Symptoms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h5 className="text-[9px] font-bold uppercase tracking-widest text-editorial-dark/50 mb-2">
                  Pathogen Factor / Underlying Causes:
                </h5>
                <ul className="space-y-1.5">
                  {diseaseInfo.causes.map((cause) => (
                    <li key={cause} className="text-xs text-gray-600 flex items-start gap-2 leading-normal">
                      <span className="w-1.5 h-1.5 bg-editorial-rust mt-1.5 shrink-0"></span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-[9px] font-bold uppercase tracking-widest text-editorial-dark/50 mb-2">
                  Key Diagnostic Symptoms:
                </h5>
                <ul className="space-y-1.5">
                  {diseaseInfo.symptoms.map((symptom) => (
                    <li key={symptom} className="text-xs text-gray-600 flex items-start gap-2 leading-normal">
                      <span className="w-1.5 h-1.5 bg-editorial-green mt-1.5 shrink-0"></span>
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-[#F9F8F4] border border-editorial-dark/5 p-4 mt-5">
              <span className="text-[8px] font-bold uppercase tracking-widest text-editorial-dark/50">
                Environmental Catalyst:
              </span>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {diseaseInfo.environmentalConditions}
              </p>
            </div>
          </div>

          {/* Plant Agronomy Specs Card */}
          <div className="bg-white border border-editorial-dark/10 p-6">
            <h3 className="text-editorial-green font-bold text-[10px] uppercase tracking-widest mb-4">
              II. CROP INFORMATION & SPECIFICATIONS
            </h3>
            
            <p className="text-xs text-gray-600 leading-relaxed pb-4 border-b border-editorial-dark/5">
              {plantInfo.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-editorial-bg border border-editorial-dark/10 p-2 text-editorial-green">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Category</div>
                  <div className="text-xs text-editorial-dark font-serif italic">{plantInfo.cropCategory}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-editorial-bg border border-editorial-dark/10 p-2 text-editorial-green">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Season</div>
                  <div className="text-xs text-editorial-dark font-serif italic">{plantInfo.growingSeason}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-editorial-bg border border-editorial-dark/10 p-2 text-editorial-green">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Temperature</div>
                  <div className="text-xs text-editorial-dark font-serif italic">{plantInfo.idealTemperature}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-editorial-bg border border-editorial-dark/10 p-2 text-editorial-green">
                  <Droplet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Watering</div>
                  <div className="text-xs text-editorial-dark font-serif italic">{plantInfo.waterRequirements}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-editorial-bg border border-editorial-dark/10 p-2 text-editorial-green">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Preferred Soil</div>
                  <div className="text-xs text-editorial-dark font-serif italic">{plantInfo.soilType}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison panel */}
      <CompareLeaf report={report} />

      {/* Medicine Recommendations */}
      <div className="bg-white border border-editorial-dark/10 p-6">
        <div className="mb-6">
          <h3 className="font-serif italic text-editorial-dark text-lg flex items-center gap-2">
            <Droplet className="w-5 h-5 text-editorial-green" />
            Recommended Medicine & Treatment Regimen
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Targeted pharmaceutical or agrochemical remedies with precise dosage and safety protocols</p>
        </div>

        {recommendedMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-editorial-dark/10 bg-[#F9F8F4]">
            <Sparkles className="w-10 h-10 text-editorial-green" />
            <span className="text-[10px] uppercase tracking-widest text-editorial-dark font-semibold mt-2">No Medicine Required</span>
            <p className="text-[11px] text-gray-400 mt-1 max-w-xs text-center font-sans">Your crop is currently healthy! Maintain standard water, sunlight, and pruning schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedMedicines.map((med) => {
              const isOrganic = med.type.toLowerCase().includes("organic") || med.type.toLowerCase().includes("biological");
              return (
                <div 
                  key={med.name} 
                  className={`border p-5 transition-all duration-200 flex flex-col md:flex-row gap-4 ${
                    isOrganic 
                      ? "bg-[#F4F7F2] border-[#2D4F3B]/20" 
                      : "bg-white border-editorial-dark/10"
                  }`}
                >
                  {/* Medicine vector image/placeholder */}
                  <div className="w-16 h-16 border border-editorial-dark/10 bg-white flex items-center justify-center flex-shrink-0 self-start md:self-center">
                    <MedicineBottleIllustration type={med.type} className="w-12 h-12" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="font-serif italic text-sm text-editorial-dark leading-snug truncate">
                        {med.name}
                      </h4>
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 ${
                        isOrganic 
                          ? "bg-editorial-green text-white" 
                          : "bg-editorial-rust text-white"
                      }`}>
                        {med.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-sans">
                      <div>
                        <span className="text-editorial-dark/40 block font-bold uppercase tracking-widest text-[8px]">Active Ingredient:</span>
                        <span className="text-editorial-dark font-semibold leading-normal block">{med.activeIngredient}</span>
                      </div>
                      <div>
                        <span className="text-editorial-dark/40 block font-bold uppercase tracking-widest text-[8px]">Dosage / Application:</span>
                        <span className="text-editorial-dark font-semibold leading-normal block">{med.recommendedDosage} via {med.applicationMethod}</span>
                      </div>
                      <div>
                        <span className="text-editorial-dark/40 block font-bold uppercase tracking-widest text-[8px]">Frequency:</span>
                        <span className="text-editorial-dark font-semibold leading-normal block">{med.frequency}</span>
                      </div>
                      <div>
                        <span className="text-editorial-dark/40 block font-bold uppercase tracking-widest text-[8px]">Availability:</span>
                        <span className="text-editorial-green font-bold leading-normal block uppercase tracking-tight text-[10px]">{med.availabilityStatus}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-editorial-dark/5">
                      <span className="text-editorial-dark/40 block font-bold uppercase tracking-widest text-[8px] mb-0.5">Target Purpose:</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed font-sans">{med.purpose}</p>
                    </div>

                    <div className="bg-editorial-rust/5 p-2.5 border border-editorial-rust/10">
                      <span className="text-editorial-rust block font-bold uppercase tracking-widest text-[8px] mb-0.5">Safety precautions:</span>
                      <p className="text-[10px] text-editorial-rust leading-normal font-sans">{med.safetyPrecautions}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Treatments Column Bulletins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organic treatments */}
        <div className="bg-white border border-[#2D4F3B]/20 bg-[#F4F7F2] p-6">
          <h3 className="text-editorial-green font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Biological & Organic Treatment Protocols
          </h3>
          <ul className="space-y-2">
            {organicTreatments.map((opt) => (
              <li key={opt} className="text-xs text-editorial-dark/80 flex items-start gap-2.5 leading-relaxed border border-[#2D4F3B]/10 p-3 bg-white">
                <span className="font-bold text-editorial-green shrink-0">✓</span>
                {opt}
              </li>
            ))}
          </ul>
        </div>

        {/* Chemical/Conventional treatment */}
        <div className="bg-white border border-[#E97451]/20 bg-[#E97451]/5 p-6">
          <h3 className="text-editorial-rust font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Hammer className="w-4 h-4" />
            Conventional Chemical Control Protocols
          </h3>
          <ul className="space-y-2">
            {chemicalTreatments.map((chem) => (
              <li key={chem} className="text-xs text-editorial-dark/80 flex items-start gap-2.5 leading-relaxed border border-[#E97451]/10 p-3 bg-white">
                <span className="font-bold text-editorial-rust shrink-0">■</span>
                {chem}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prevention & Similar Diseases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prevention and Proactive management */}
        <div className="bg-white border border-editorial-dark/10 p-6 lg:col-span-1">
          <h3 className="font-serif italic text-editorial-dark/50 text-xs uppercase tracking-widest mb-4">
            Proactive Prevention Strategy
          </h3>
          <ul className="space-y-3">
            {diseaseInfo.preventionTips.map((tip) => (
              <li key={tip} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-editorial-green mt-1.5 shrink-0"></span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Similar Disease Examples */}
        <div className="bg-white border border-editorial-dark/10 p-6 lg:col-span-2">
          <h3 className="font-serif italic text-editorial-dark/50 text-xs uppercase tracking-widest mb-4">
            Differential Diagnosis (Similar Crop Pathologies)
          </h3>
          <div className="space-y-3">
            {similarDiseases.map((dis) => (
              <div 
                key={dis.name} 
                className="flex items-start gap-4 p-4 border border-editorial-dark/5 hover:border-editorial-green transition-colors bg-editorial-bg/35"
              >
                <div className="w-12 h-12 bg-white border border-editorial-dark/10 flex items-center justify-center flex-shrink-0">
                  <PlantLeafIllustration isDiseased={true} diseaseSeverity={dis.severity} className="w-9 h-9" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif italic text-editorial-dark text-xs">{dis.name}</h4>
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-white text-gray-500 border border-editorial-dark/10">
                      {dis.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed font-sans">
                    {dis.description}
                  </p>
                  <div className="text-[9px] text-editorial-green font-bold bg-white border border-editorial-green/20 px-2 py-0.5 mt-1.5 inline-block uppercase tracking-wider">
                    Distinguishing trait: {dis.distinguishingFeature}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Guidelines References */}
      <GuidelineLinks />
    </div>
  );
};
