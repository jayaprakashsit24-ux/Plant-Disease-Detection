export interface PlantInfo {
  name: string;
  scientificName: string;
  cropCategory: string;
  growingSeason: string;
  idealTemperature: string;
  waterRequirements: string;
  soilType: string;
  description: string;
}

export interface DiseaseInfo {
  detected: boolean;
  name: string;
  description: string;
  causes: string[];
  symptoms: string[];
  severityLevel: string; // 'Low' | 'Medium' | 'High'
  affectedParts: string[];
  environmentalConditions: string;
  preventionTips: string[];
  estimatedRecoveryTime: string;
}

export interface RecommendedMedicine {
  name: string;
  type: string; // "Fungicide", "Insecticide", "Bactericide", "Organic Solution", etc.
  activeIngredient: string;
  purpose: string;
  recommendedDosage: string;
  applicationMethod: string;
  frequency: string;
  safetyPrecautions: string;
  estimatedRecoveryTime: string;
  availabilityStatus: string;
  imageSearchTerm: string;
}

export interface SimilarDisease {
  name: string;
  description: string;
  severity: string;
  distinguishingFeature: string;
}

export interface HealthyVsDiseasedComparison {
  healthyDescription: string;
  diseasedDescription: string;
}

export interface DiagnosisReport {
  plantInfo: PlantInfo;
  diseaseInfo: DiseaseInfo;
  recommendedMedicines: RecommendedMedicine[];
  organicTreatments: string[];
  chemicalTreatments: string[];
  similarDiseases: SimilarDisease[];
  healthyVsDiseasedComparison: HealthyVsDiseasedComparison;
  confidenceScore: number;
}

export interface HistoryItem {
  id: string;
  date: string;
  uploadedImage: string; // base64 Data URL
  plantName: string;
  diseaseName: string;
  detected: boolean;
  severity: string;
  report: DiagnosisReport;
}
