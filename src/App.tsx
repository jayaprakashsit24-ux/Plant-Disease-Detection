import React, { useState, useEffect } from "react";
import { 
  UploadCloud, Sprout, Sparkles, History, AlertCircle, 
  Leaf, Info, CheckCircle2, RefreshCw, X, Award, HelpCircle, Camera
} from "lucide-react";
import { DiagnosisReport, HistoryItem } from "./types";
import { DiagnosisResult } from "./components/DiagnosisResult";
import { DiagnosisHistory } from "./components/DiagnosisHistory";
import { PlantLeafIllustration } from "./components/AgriculturalIllustrations";
import { LeafCamera } from "./components/LeafCamera";

// Cycle messages for the agricultural loader
const LOADING_MESSAGES = [
  "Digitizing leaf tissue specimen...",
  "Analyzing vascular vein integrity...",
  "Scanning chloroplast density & pigmentation...",
  "Correlating spot patterns with pathological directory...",
  "Checking chlorosis levels against healthy leaf matrix...",
  "Synthesizing organic and chemical therapy protocols...",
  "Mapping similar plant family syndromes...",
  "Drafting final agronomy consultation ledger...",
];

export default function App() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "camera">("file");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // App state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeReport, setActiveReport] = useState<DiagnosisReport | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [showHistoryOnlyOnMobile, setShowHistoryOnlyOnMobile] = useState(false);

  // Load history from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("crop_guard_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from LocalStorage", e);
    }
  }, []);

  // Save history to LocalStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("crop_guard_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to LocalStorage", e);
    }
  };

  // Rotate loading messages when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert image to base64 Data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid plant leaf image (JPEG/PNG/WebP).");
      return;
    }
    setError(null);
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setImagePreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drop Event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Handle input file picker change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Trigger analysis via Express API route
  const handleAnalyze = async () => {
    if (!imagePreview) return;
    
    setIsAnalyzing(true);
    setError(null);
    setLoadingMsgIdx(0);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imagePreview }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Internal Server Diagnosis Failed");
      }

      const report: DiagnosisReport = await response.json();
      
      const dateStr = new Date().toISOString();
      setActiveReport(report);
      setActiveImage(imagePreview);
      setActiveDate(new Date(dateStr).toLocaleString());

      // Save into LocalStorage history logs
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        date: dateStr,
        uploadedImage: imagePreview,
        plantName: report.plantInfo.name,
        diseaseName: report.diseaseInfo.name,
        detected: report.diseaseInfo.detected,
        severity: report.diseaseInfo.severityLevel,
        report: report,
      };

      const updatedHistory = [newHistoryItem, ...history];
      saveHistory(updatedHistory);

      // Clear current file inputs
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during crop analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle history select
  const handleHistorySelect = (item: HistoryItem) => {
    setActiveReport(item.report);
    setActiveImage(item.uploadedImage);
    setActiveDate(new Date(item.date).toLocaleString());
    
    // Smooth scroll to top of diagnosis result
    const el = document.getElementById("diagnosis-results-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle history item delete
  const handleHistoryDelete = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
    
    // If deleted the active view, clear it
    if (activeReport && history.find(h => h.id === id)?.report === activeReport) {
      setActiveReport(null);
      setActiveImage(null);
      setActiveDate(null);
    }
  };

  // Clear loaded result back to dashboard onboarding
  const handleBackToDashboard = () => {
    setActiveReport(null);
    setActiveImage(null);
    setActiveDate(null);
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex flex-col font-sans text-editorial-dark antialiased selection:bg-editorial-rust/20">
      
      {/* Upper Navigation Header */}
      <header className="bg-white border-b border-editorial-dark/10 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-editorial-green rounded-full flex items-center justify-center text-white font-bold italic font-serif">
              C
            </div>
            <div>
              <h1 className="text-xs uppercase tracking-[0.2em] font-bold text-editorial-green flex items-center gap-1.5">
                CropGuard AI
              </h1>
              <p className="text-[10px] uppercase tracking-widest opacity-60">Plant Pathology Laboratory • v2.5</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono border border-editorial-dark/10 px-3 py-1 bg-white uppercase text-gray-500 hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-editorial-green rounded-full animate-pulse"></span>
              Laboratory Server Live
            </span>
            <a
              href="#diagnosis-onboarding"
              className="px-6 py-2 border border-editorial-dark text-[10px] uppercase tracking-widest hover:bg-editorial-dark hover:text-white transition-colors"
            >
              Consulting Help
            </a>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Onboarding Overview Grid (if no report shown) */}
        {!activeReport && !isAnalyzing && (
          <div id="diagnosis-onboarding" className="mb-8 bg-editorial-green text-white p-6 sm:p-8 border border-editorial-dark/10 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="max-w-3xl relative z-10">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-3 block">
                ★ AGRI-HEALTH TECHNOLOGY GATEWAY
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif italic mt-3 text-white font-normal leading-tight">
                Precision Crop Diagnostics & Pharmaceutical Treatments
              </h2>
              <p className="text-xs sm:text-sm opacity-85 leading-relaxed mt-2.5 max-w-xl font-sans">
                Upload photos of infected leaves. Our deep vision pathology models identify fungal, bacterial, and viral crop diseases, prescribe exact medicine dosage plans, compile comparative slider guides, and export agricultural PDF dossiers.
              </p>
            </div>

            {/* Quick Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 border-t border-white/15 pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-xs font-serif italic text-white shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-serif italic text-sm text-white">Visual Capture</h4>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-normal">Drag or select a leaf photo</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-xs font-serif italic text-white shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-serif italic text-sm text-white">Vascular AI Scan</h4>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-normal">Deep Pathology model diagnoses spots</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-xs font-serif italic text-white shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-serif italic text-sm text-white">Get Prescription</h4>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-normal">Download detailed farm PDF dossier</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side control panel (Left: History and Uploader) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Image Uploader */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`bg-white border p-6 text-center transition-all duration-200 relative ${
                dragActive 
                  ? "border-editorial-green bg-editorial-bg" 
                  : "border-editorial-dark/10 hover:border-editorial-green"
              }`}
            >
              <h3 className="font-serif italic text-editorial-dark/40 text-xs uppercase tracking-widest mb-4 text-left">
                01. Upload Specimen
              </h3>

              {/* Upload Mode Selector tabs */}
              {!imagePreview && (
                <div className="flex border-b border-editorial-dark/10 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`flex-1 pb-2 text-[10px] uppercase tracking-[0.15em] font-bold border-b transition-all duration-150 cursor-pointer ${
                      uploadMode === "file"
                        ? "border-editorial-green text-editorial-green font-extrabold"
                        : "border-transparent text-gray-400 hover:text-editorial-dark"
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("camera")}
                    className={`flex-1 pb-2 text-[10px] uppercase tracking-[0.15em] font-bold border-b transition-all duration-150 cursor-pointer ${
                      uploadMode === "camera"
                        ? "border-editorial-green text-editorial-green font-extrabold"
                        : "border-transparent text-gray-400 hover:text-editorial-dark"
                    }`}
                  >
                    Live Camera
                  </button>
                </div>
              )}

              {!imagePreview ? (
                uploadMode === "file" ? (
                  <div className="py-6 flex flex-col items-center justify-center cursor-pointer relative">
                    <div className="bg-editorial-bg text-editorial-green p-4 rounded-full mb-3 border border-editorial-dark/5">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    
                    <p className="text-xs font-bold text-editorial-dark">Drag leaf image here</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">or click to browse local files</p>
                    
                    <input
                      type="file"
                      id="leaf-upload-input"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <LeafCamera 
                    onCapture={(img) => {
                      setImagePreview(img);
                    }}
                    onClose={() => setUploadMode("file")}
                  />
                )
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden border border-editorial-dark/10 bg-editorial-bg flex items-center justify-center">
                    <img 
                      src={imagePreview} 
                      alt="Uploaded preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview(null);
                        setError(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-left p-3 border border-editorial-rust/20 bg-editorial-rust/5 text-editorial-rust">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-semibold leading-relaxed">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-3 px-4 bg-editorial-green hover:bg-editorial-dark text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-150 border border-editorial-green cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow inline mr-1.5" />
                    Begin AI Diagnostics
                  </button>
                </div>
              )}
            </div>

            {/* History Records Panel */}
            <DiagnosisHistory 
              history={history} 
              onSelect={handleHistorySelect} 
              onDelete={handleHistoryDelete} 
            />
          </div>

          {/* Right column: Results display area */}
          <div className="lg:col-span-3">
            
            {/* Anchor for scrolling */}
            <div id="diagnosis-results-anchor"></div>

            {isAnalyzing ? (
              /* High-fidelity Agricultural loading matrix */
              <div className="bg-white border border-editorial-dark/10 p-10 flex flex-col items-center justify-center min-h-[500px] text-center animate-pulse">
                <div className="relative mb-6">
                  {/* Rotating double orbit leaf loader */}
                  <div className="w-20 h-20 rounded-full border-2 border-editorial-dark/5 border-t-editorial-green animate-spin flex items-center justify-center">
                    <Leaf className="w-8 h-8 text-editorial-green animate-bounce" />
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2 bg-editorial-rust text-white p-1.5 rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                  </div>
                </div>

                <h3 className="font-serif italic text-editorial-dark text-lg">CropGuard Pathology Labs</h3>
                <p className="text-[10px] text-editorial-green font-bold tracking-widest uppercase mt-1">Analyzing Leaf Epidermis</p>
                
                <div className="max-w-md border border-editorial-dark/10 bg-editorial-bg px-5 py-3 mt-6">
                  <p className="text-xs font-mono text-editorial-dark/75 transition-all duration-300">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </p>
                </div>

                <div className="w-40 bg-gray-100 h-1 mt-6 overflow-hidden">
                  <div className="bg-editorial-green h-full animate-progress"></div>
                </div>
              </div>
            ) : activeReport && activeImage && activeDate ? (
              /* Renders the actual AI diagnosis report card */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleBackToDashboard}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-editorial-green hover:text-editorial-dark bg-white px-4 py-2 border border-editorial-dark/10 transition-colors cursor-pointer"
                  >
                    ← Back to Dashboard
                  </button>
                  
                  <span className="text-[10px] font-mono text-gray-400">
                    DIAGNOSTIC ID: REF_{Math.round(activeReport.confidenceScore * 10000)}
                  </span>
                </div>
                
                <DiagnosisResult 
                  report={activeReport} 
                  uploadedImage={activeImage} 
                  dateStr={activeDate} 
                />
              </div>
            ) : (
              /* Landing view explaining the agricultural scanner */
              <div className="bg-white border border-editorial-dark/10 p-8 sm:p-12 flex flex-col items-center justify-center min-h-[500px] text-center">
                <div className="w-24 h-24 rounded-full bg-editorial-bg border border-editorial-dark/5 flex items-center justify-center mb-6 text-editorial-green">
                  <Sprout className="w-12 h-12 stroke-[1.5]" />
                </div>

                <h3 className="font-serif italic text-editorial-dark text-xl tracking-tight">
                  Awaiting Plant Leaf Specimen
                </h3>
                
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                  Provide a clean JPEG or PNG photo of a crop leaf. Keep the camera focused on spots, wilting veins, or mildew coatings for optimal neural diagnostics.
                </p>

                {/* Grid details on what the analysis inspects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-lg text-left">
                  <div className="border border-editorial-dark/10 bg-editorial-bg/30 p-4 flex items-start gap-3">
                    <span className="bg-editorial-green text-white px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold shrink-0 mt-0.5">Vein</span>
                    <div>
                      <h4 className="font-serif italic text-editorial-dark text-xs">Vascular Disruption</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Detects stem wilting and xylem/phloem clogging syndromes.</p>
                    </div>
                  </div>

                  <div className="border border-editorial-dark/10 bg-editorial-bg/30 p-4 flex items-start gap-3">
                    <span className="bg-editorial-green text-white px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold shrink-0 mt-0.5">Cut</span>
                    <div>
                      <h4 className="font-serif italic text-editorial-dark text-xs">Epidermal Lesions</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Identifies necrotic fungal rings, mildews, and rust spots.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-editorial-dark/10 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center text-[10px] text-gray-400 space-y-2 uppercase tracking-widest font-bold opacity-60">
          <div className="flex items-center justify-center gap-2 text-editorial-green">
            <span className="w-1.5 h-1.5 bg-editorial-green rounded-full"></span>
            <span>Government Agri-Guideline Compliant • FDA-293-8</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed text-[9px] lowercase font-normal italic font-serif">
            consultations are powered by google gemini 3.5. always cross-examine pesticide applications with local agricultural boards.
          </p>
          <p className="text-[8px] font-mono opacity-50">© 2026 Phytopath Systems LLC • All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
