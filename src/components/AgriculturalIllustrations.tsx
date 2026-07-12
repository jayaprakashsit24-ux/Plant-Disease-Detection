import React from "react";

// Renders an elegant, detailed SVG leaf representing a healthy or diseased leaf
interface PlantLeafProps {
  className?: string;
  isDiseased?: boolean;
  diseaseSeverity?: string; // "Low" | "Medium" | "High"
  plantType?: string;
}

export const PlantLeafIllustration: React.FC<PlantLeafProps> = ({
  className = "w-16 h-16",
  isDiseased = false,
  diseaseSeverity = "Medium",
  plantType = "",
}) => {
  // Select color scheme based on health
  const healthyGradientStart = "#22c55e"; // emerald-500
  const healthyGradientEnd = "#15803d"; // emerald-700
  
  // Spots color for diseased leaves
  let spotsColor = "#b45309"; // amber-700 (brown rust spots)
  let spotSizeMultiplier = 1;
  let leafColorStart = "#a3e635"; // lime-400 (slightly chlorotic)
  let leafColorEnd = "#4d7c0f"; // lime-700
  
  if (diseaseSeverity === "High") {
    leafColorStart = "#ca8a04"; // yellow-600 (highly diseased / necrotic)
    leafColorEnd = "#713f12"; // yellow-900 (dead tissue)
    spotsColor = "#451a03"; // dark dark brown
    spotSizeMultiplier = 1.6;
  } else if (diseaseSeverity === "Low") {
    leafColorStart = "#84cc16"; // lime-500
    leafColorEnd = "#16a34a"; // green-600
    spotsColor = "#854d0e"; // yellow-800
    spotSizeMultiplier = 0.6;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={`${className} filter drop-shadow-md`}
      fill="none"
    >
      <defs>
        {/* Leaf Base Gradient */}
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDiseased ? leafColorStart : healthyGradientStart} />
          <stop offset="100%" stopColor={isDiseased ? leafColorEnd : healthyGradientEnd} />
        </linearGradient>
        
        {/* Vein Shadow */}
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main Stem */}
      <path
        d="M 50 95 C 48 80, 48 50, 50 15"
        stroke="#1e3a1e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Leaf Body */}
      <path
        d="M 50 15 
           C 20 35, 15 65, 50 95 
           C 85 65, 80 35, 50 15 Z"
        fill="url(#leafGrad)"
        stroke="#14532d"
        strokeWidth="1.5"
      />

      {/* Primary Lateral Veins */}
      <g stroke="#154015" strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
        <path d="M 50 35 Q 35 32, 28 38" />
        <path d="M 50 35 Q 65 32, 72 38" />
        
        <path d="M 50 50 Q 32 45, 22 55" />
        <path d="M 50 50 Q 68 45, 78 55" />
        
        <path d="M 50 65 Q 35 62, 24 75" />
        <path d="M 50 65 Q 65 62, 76 75" />
        
        <path d="M 50 80 Q 40 78, 35 88" />
        <path d="M 50 80 Q 60 78, 65 88" />
      </g>

      {/* Disease Spots (if leaf is diseased) */}
      {isDiseased && (
        <g fill={spotsColor} opacity="0.85">
          {/* Left side spots */}
          <circle cx="32" cy="42" r={3 * spotSizeMultiplier} />
          <circle cx="28" cy="45" r={1.5 * spotSizeMultiplier} />
          <path d={`M 20 58 Q 23 59, 21 62 Q 18 61, 20 58`} />
          <circle cx="38" cy="62" r={4 * spotSizeMultiplier} />
          <circle cx="36" cy="65" r={2 * spotSizeMultiplier} />
          <circle cx="25" cy="74" r={3.5 * spotSizeMultiplier} stroke="#ef4444" strokeWidth="0.5" />
          
          {/* Right side spots */}
          <circle cx="68" cy="38" r={2.5 * spotSizeMultiplier} />
          <path d={`M 72 48 Q 75 49, 73 52 Q 70 51, 72 48`} />
          <circle cx="62" cy="58" r={5 * spotSizeMultiplier} />
          <circle cx="58" cy="56" r={2 * spotSizeMultiplier} />
          <circle cx="65" cy="70" r={3 * spotSizeMultiplier} />
          <circle cx="72" cy="66" r={1.5 * spotSizeMultiplier} />
          
          {/* Center necrosis spots */}
          <circle cx="48" cy="48" r={2 * spotSizeMultiplier} />
          <circle cx="52" cy="72" r={2.5 * spotSizeMultiplier} />
        </g>
      )}
    </svg>
  );
};

// Renders an elegant, premium container bottle representation for the agrochemical or organic solution
interface MedicineProps {
  className?: string;
  type: string; // "Fungicide" | "Insecticide" | "Bactericide" | "Organic Solution" etc.
}

export const MedicineBottleIllustration: React.FC<MedicineProps> = ({
  className = "w-14 h-14",
  type,
}) => {
  // Determine color matching the medicine type
  let liquidColor = "#10b981"; // organic - green
  let capColor = "#047857";
  let labelColor = "#d1fae5";
  let labelText = "BIO";

  const lowerType = type.toLowerCase();
  if (lowerType.includes("fungicide")) {
    liquidColor = "#a855f7"; // fungicide - purple
    capColor = "#701a75";
    labelColor = "#f3e8ff";
    labelText = "FUN";
  } else if (lowerType.includes("insecticide")) {
    liquidColor = "#f97316"; // insecticide - orange
    capColor = "#c2410c";
    labelColor = "#ffedd5";
    labelText = "INS";
  } else if (lowerType.includes("bactericide")) {
    liquidColor = "#ef4444"; // bactericide - red
    capColor = "#b91c1c";
    labelColor = "#fee2e2";
    labelText = "BAC";
  } else if (lowerType.includes("nutrition") || lowerType.includes("fertilizer")) {
    liquidColor = "#3b82f6"; // fertilizer - blue
    capColor = "#1d4ed8";
    labelColor = "#dbeafe";
    labelText = "NUT";
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={`${className} filter drop-shadow-md`}
      fill="none"
    >
      {/* Spray bottle head & neck */}
      {/* Cap/Nozzle */}
      <rect x="42" y="12" width="16" height="8" rx="2" fill={capColor} />
      <rect x="46" y="8" width="8" height="4" fill="#4b5563" />
      <path d="M 54 10 L 62 10 L 60 14 L 54 12 Z" fill="#374151" /> {/* Spray Nozzle */}
      
      {/* Spray Trigger */}
      <path d="M 44 20 L 38 32 L 41 33 L 46 22" fill="#6b7280" />
      
      {/* Bottle Neck */}
      <rect x="44" y="20" width="12" height="14" fill="#e5e7eb" />
      <path d="M 44 34 L 32 44 L 32 88 L 68 88 L 68 44 L 56 34 Z" fill="#ffffff" stroke="#9ca3af" strokeWidth="1.5" />
      
      {/* Bottom Liquid Fill Level */}
      <path d="M 32.5 62 Q 50 60, 67.5 62 L 67.5 87.5 L 32.5 87.5 Z" fill={liquidColor} opacity="0.8" />
      
      {/* Bottle Label */}
      <rect x="36" y="44" width="28" height="26" rx="2" fill={labelColor} stroke="#d1d5db" strokeWidth="1" />
      
      {/* Label Text/Accent */}
      <text
        x="50"
        y="60"
        fill={capColor}
        fontSize="10"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        {labelText}
      </text>
      
      <line x1="40" y1="48" x2="60" y2="48" stroke={capColor} strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="65" x2="58" y2="65" stroke={capColor} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
};

// Renders an elegant circular confidence level gauge
interface ScoreGaugeProps {
  score: number; // 0.0 to 1.0
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, className = "w-20 h-20" }) => {
  const percentage = Math.round(score * 100);
  const radius = 32;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  // Match confidence to standard colors
  let color = "#ef4444"; // red
  if (score >= 0.85) {
    color = "#22c55e"; // green
  } else if (score >= 0.7) {
    color = "#eab308"; // yellow
  } else if (score >= 0.5) {
    color = "#f97316"; // orange
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold text-gray-800 font-mono">{percentage}%</span>
        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">Confidence</span>
      </div>
    </div>
  );
};

// Renders standard severity badge with custom styles
interface SeverityBadgeProps {
  severity: string; // "Low" | "Medium" | "High"
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const normalized = severity.trim().toLowerCase();
  let bg = "bg-green-50 text-green-700 border-green-200";
  let dot = "bg-green-500";
  
  if (normalized.includes("high")) {
    bg = "bg-red-50 text-red-700 border-red-200";
    dot = "bg-red-500";
  } else if (normalized.includes("medium")) {
    bg = "bg-amber-50 text-amber-700 border-amber-200";
    dot = "bg-amber-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {severity} Severity
    </span>
  );
};
