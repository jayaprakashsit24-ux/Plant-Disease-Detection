import React, { useState } from "react";
import { HistoryItem } from "../types";
import { Search, Trash2, Calendar, ClipboardList, ChevronRight } from "lucide-react";
import { PlantLeafIllustration, SeverityBadge } from "./AgriculturalIllustrations";

interface DiagnosisHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const DiagnosisHistory: React.FC<DiagnosisHistoryProps> = ({
  history,
  onSelect,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.plantName.toLowerCase().includes(term) ||
      item.diseaseName.toLowerCase().includes(term) ||
      item.date.toLowerCase().includes(term)
    );
  });

  return (
    <div id="diagnosis-history-panel" className="bg-white border border-editorial-dark/10 p-6 h-full flex flex-col">
      <div className="mb-5">
        <h3 className="font-serif italic text-editorial-dark text-lg flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-editorial-green" />
          Diagnosis History
        </h3>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Access saved diagnoses & treatment histories</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search crop or disease..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs border border-editorial-dark/10 rounded-none focus:outline-none focus:border-editorial-green bg-editorial-bg/50 text-editorial-dark"
        />
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-2.5 custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-editorial-dark/10 bg-editorial-bg/20">
            <ClipboardList className="w-8 h-8 text-gray-300 stroke-1" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-2">
              {searchTerm ? "No match found" : "No history recorded"}
            </span>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className="group relative flex items-center gap-3 p-3.5 border border-editorial-dark/5 hover:border-editorial-green bg-white hover:bg-editorial-bg/50 transition-all duration-200 cursor-pointer"
                onClick={() => onSelect(item)}
              >
                {/* Visual Thumbnail */}
                <div className="relative w-12 h-12 overflow-hidden border border-editorial-dark/10 bg-editorial-bg flex-shrink-0">
                  {item.uploadedImage ? (
                    <img
                      src={item.uploadedImage}
                      alt={item.plantName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlantLeafIllustration isDiseased={item.detected} className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-serif italic text-sm text-editorial-dark truncate leading-snug">
                      {item.plantName}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-mono flex items-center gap-0.5 whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </div>

                  <p className="text-xs text-editorial-dark/70 truncate mt-0.5">
                    {item.detected ? item.diseaseName : "Healthy Leaf"}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${
                        item.detected
                          ? "bg-editorial-rust/5 text-editorial-rust border-editorial-rust/20"
                          : "bg-editorial-green/5 text-editorial-green border-editorial-green/20"
                      }`}
                    >
                      {item.detected ? "Infected" : "Healthy"}
                    </span>
                    {item.detected && (
                      <span className="text-[9px] text-gray-400 font-mono uppercase tracking-tight">
                        {item.severity} Severity
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow indicator */}
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-editorial-green transition-colors absolute right-3" />

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="absolute top-2.5 right-1.5 p-1 text-gray-300 hover:text-editorial-rust transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
