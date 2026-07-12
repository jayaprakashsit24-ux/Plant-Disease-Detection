import React, { useState } from "react";
import { Sparkles, HelpCircle, Eye } from "lucide-react";
import { DiagnosisReport } from "../types";
import { PlantLeafIllustration } from "./AgriculturalIllustrations";

interface CompareLeafProps {
  report: DiagnosisReport;
}

export const CompareLeaf: React.FC<CompareLeafProps> = ({ report }) => {
  const { plantInfo, diseaseInfo, healthyVsDiseasedComparison } = report;
  const [activeTab, setActiveTab] = useState<"side-by-side" | "interactive">("side-by-side");
  const [sliderVal, setSliderVal] = useState<number>(50); // 0 = fully healthy, 100 = fully infected

  return (
    <div id="compare-leaf-panel" className="bg-white border border-editorial-dark/10 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif italic text-editorial-dark text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-editorial-green" />
            Anatomical Comparison: Healthy vs Diseased Leaf
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
            Compare leaf anatomy of {plantInfo.name} ({plantInfo.scientificName})
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-0.5 border border-editorial-dark/10 bg-editorial-bg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("side-by-side")}
            className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
              activeTab === "side-by-side"
                ? "bg-white text-editorial-dark border border-editorial-dark/5"
                : "text-gray-400 hover:text-editorial-dark"
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveTab("interactive")}
            className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
              activeTab === "interactive"
                ? "bg-white text-editorial-dark border border-editorial-dark/5"
                : "text-gray-400 hover:text-editorial-dark"
            }`}
          >
            Progression Slider
          </button>
        </div>
      </div>

      {activeTab === "side-by-side" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Healthy Card */}
          <div className="border border-editorial-green/20 bg-editorial-green/5 p-5 flex flex-col items-center text-center">
            <div className="bg-editorial-green text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1 mb-4">
              Pristine Healthy State
            </div>
            
            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-white border border-editorial-dark/5">
              <PlantLeafIllustration isDiseased={false} className="w-18 h-18" />
            </div>

            <h4 className="font-serif italic text-editorial-dark text-sm">{plantInfo.name} Leaf Standard</h4>
            <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed font-sans">
              {healthyVsDiseasedComparison.healthyDescription || 
               "Leaves should exhibit rich green uniform pigmentation with crisp outer margins, smooth flexible cuticles, and complete vascular integrity."}
            </p>
          </div>

          {/* Diseased Card */}
          <div className="border border-editorial-rust/20 bg-editorial-rust/5 p-5 flex flex-col items-center text-center">
            <div className="bg-editorial-rust text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1 mb-4">
              Diseased Infection State
            </div>

            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-white border border-editorial-dark/5">
              <PlantLeafIllustration
                isDiseased={diseaseInfo.detected}
                diseaseSeverity={diseaseInfo.severityLevel}
                className="w-18 h-18"
              />
            </div>

            <h4 className="font-serif italic text-editorial-dark text-sm">
              {diseaseInfo.detected ? diseaseInfo.name : "Deficiency/Stress State"}
            </h4>
            <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed font-sans">
              {healthyVsDiseasedComparison.diseasedDescription || 
               "Pathogens mutate leaf pigmentation, inducing chlorosis, localized necrotic lesions, brown spots, or mold growth."}
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-editorial-dark/10 p-6 bg-[#F9F8F4]/30">
          <div className="flex flex-col items-center">
            {/* Interactive Leaf View */}
            <div className="relative w-40 h-40 bg-white flex items-center justify-center border border-editorial-dark/10 mb-6">
              <PlantLeafIllustration
                isDiseased={sliderVal > 15}
                diseaseSeverity={sliderVal > 70 ? "High" : sliderVal > 35 ? "Medium" : "Low"}
                className="w-28 h-28 transition-all duration-300"
              />
              
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 text-[9px] uppercase tracking-widest font-bold bg-editorial-dark text-white">
                {sliderVal === 0 ? "Pristine Leaf" : sliderVal < 35 ? "Early Spots" : sliderVal < 70 ? "Mild Spread" : "Severe Decay"}
              </div>
            </div>

            {/* Slider Control */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
                <span className="text-editorial-green">0% Infection (Healthy)</span>
                <span className="text-editorial-rust">100% Infection (Dead)</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 appearance-none cursor-pointer accent-editorial-green"
              />

              <div className="bg-white border border-editorial-dark/10 p-4 mt-5 text-center">
                <p className="text-xs text-gray-600 font-medium font-sans">
                  {sliderVal < 25 ? (
                    <span className="text-editorial-green font-bold">✓ Leaf is clean. Maintain active preventative organic spraying to protect cuticle surface.</span>
                  ) : sliderVal < 60 ? (
                    <span className="text-editorial-rust font-semibold">⚠ Disease is setting in. Chlorosis and necrotic spots start disrupting photosynthesis. Apply organic remedies immediately.</span>
                  ) : (
                    <span className="text-editorial-rust font-bold uppercase tracking-tight">🕱 Severe infestation! High loss of leaf volume. Prompt chemical fungicide/insecticide drench is recommended to prevent full crop death.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
