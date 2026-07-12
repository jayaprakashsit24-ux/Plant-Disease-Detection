import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: "20mb" }));

// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON schema for the plant diagnosis response
const plantDiagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    plantInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Common name of the plant (e.g. Tomato, Rose, Wheat)" },
        scientificName: { type: Type.STRING, description: "Scientific botanical name (e.g. Solanum lycopersicum)" },
        cropCategory: { type: Type.STRING, description: "Category e.g. Vegetables, Fruits, Flowers, Grains" },
        growingSeason: { type: Type.STRING, description: "Sowing/growing season" },
        idealTemperature: { type: Type.STRING, description: "Ideal temperature range for growth" },
        waterRequirements: { type: Type.STRING, description: "Watering guidelines" },
        soilType: { type: Type.STRING, description: "Preferred soil type" },
        description: { type: Type.STRING, description: "Brief description of the plant species" }
      },
      required: ["name", "scientificName", "cropCategory", "growingSeason", "idealTemperature", "waterRequirements", "soilType", "description"]
    },
    diseaseInfo: {
      type: Type.OBJECT,
      properties: {
        detected: { type: Type.BOOLEAN, description: "True if a disease is found, False if the plant is healthy" },
        name: { type: Type.STRING, description: "Common name of the detected disease (e.g. Early Blight, Powdery Mildew, Black Spot) or 'Healthy Leaf' if no disease is found" },
        description: { type: Type.STRING, description: "Detailed description of the disease" },
        causes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of pathogen type and underlying causes" },
        symptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key diagnostic symptoms on the leaves/stems" },
        severityLevel: { type: Type.STRING, description: "Low, Medium, or High severity" },
        affectedParts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Affected plant organs" },
        environmentalConditions: { type: Type.STRING, description: "Favorable humidity/temperature promoting disease spread" },
        preventionTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Cultural practices to prevent future infections" },
        estimatedRecoveryTime: { type: Type.STRING, description: "Expected timeline for recovery under treatment (e.g. 7-14 days)" }
      },
      required: ["detected", "name", "description", "causes", "symptoms", "severityLevel", "affectedParts", "environmentalConditions", "preventionTips", "estimatedRecoveryTime"]
    },
    recommendedMedicines: {
      type: Type.ARRAY,
      description: "Appropriate commercial or biological treatments",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Product name or general medicine name" },
          type: { type: Type.STRING, description: "Fungicide, Insecticide, Bactericide, Organic Solution, etc." },
          activeIngredient: { type: Type.STRING, description: "Chemical active ingredient or active microbe" },
          purpose: { type: Type.STRING, description: "What this specific medicine targets" },
          recommendedDosage: { type: Type.STRING, description: "Dosage instructions (e.g., 2ml per Liter)" },
          applicationMethod: { type: Type.STRING, description: "Foliar Spray, Soil Drench, Seed Treatment, etc." },
          frequency: { type: Type.STRING, description: "How often to apply (e.g. Once every 7 days)" },
          safetyPrecautions: { type: Type.STRING, description: "Protective gear, environmental precautions, harvest wait time" },
          estimatedRecoveryTime: { type: Type.STRING, description: "Expected recovery timeframe" },
          availabilityStatus: { type: Type.STRING, description: "E.g. In Stock / Widely Available" },
          imageSearchTerm: { type: Type.STRING, description: "Highly descriptive English noun phrase suitable for visual representation (e.g., 'liquid garden fungicide spray bottle', 'biological organic neem oil spray bottle')" }
        },
        required: ["name", "type", "activeIngredient", "purpose", "recommendedDosage", "applicationMethod", "frequency", "safetyPrecautions", "estimatedRecoveryTime", "availabilityStatus", "imageSearchTerm"]
      }
    },
    organicTreatments: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Alternative home remedies, biological agents, or organic options"
    },
    chemicalTreatments: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Standard agrochemical compounds or commercial applications"
    },
    similarDiseases: {
      type: Type.ARRAY,
      description: "Similar conditions affecting this crop to contrast",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of similar disease" },
          description: { type: Type.STRING, description: "Key visual traits" },
          severity: { type: Type.STRING, description: "Typical severity level" },
          distinguishingFeature: { type: Type.STRING, description: "How to tell it apart from the detected disease" }
        },
        required: ["name", "description", "severity", "distinguishingFeature"]
      }
    },
    healthyVsDiseasedComparison: {
      type: Type.OBJECT,
      properties: {
        healthyDescription: { type: Type.STRING, description: "Visual appearance of a healthy leaf for this plant" },
        diseasedDescription: { type: Type.STRING, description: "How the disease alters leaf texture, shape, or coloration" }
      },
      required: ["healthyDescription", "diseasedDescription"]
    },
    confidenceScore: { type: Type.NUMBER, description: "AI confidence rating from 0.0 to 1.0 based on leaf condition" }
  },
  required: [
    "plantInfo",
    "diseaseInfo",
    "recommendedMedicines",
    "organicTreatments",
    "chemicalTreatments",
    "similarDiseases",
    "healthyVsDiseasedComparison",
    "confidenceScore"
  ]
};

// API Endpoint to process and analyze plant leaf image
app.post("/api/diagnose", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    // Parse data URL format: "data:image/jpeg;base64,..."
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid image format. Must be a valid Base64 Data URL." });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptText = `
      You are an expert plant pathologist and agronomist. 
      Analyze the attached image of a plant leaf and perform a rigorous diagnostic analysis.
      
      Determine:
      1. What plant species is shown in the image (common name, scientific name, growing season, crop category, etc.).
      2. Whether there is an active disease, pest damage, or nutrient deficiency shown on the leaf.
      3. If the leaf is completely healthy, set "diseaseInfo.detected" to false and name it "Healthy Leaf" with appropriate healthy information, and still provide preventative tips.
      4. If a disease is detected, specify details: name, description, symptoms, environmental causes, severity level, etc.
      5. Recommend both organic and chemical treatment guidelines.
      6. Provide a list of recommended medicines (either specific commercial agrochemicals or standard biological organic products like Neem oil/copper fungicides) with full structural parameters (active ingredient, dosage, frequency, precautions, and imageSearchTerm).
      7. Outline a visual comparison contrast between a Healthy Leaf vs Diseased Leaf of this plant.
      8. Provide similar crop diseases with distinguishing features for comparison.
      
      Ensure all information is accurate, practical, and formatted precisely as requested.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        imagePart,
        { text: promptText }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: plantDiagnosisSchema,
        temperature: 0.2,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini API");
    }

    const parsedData = JSON.parse(resultText.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Diagnosis error:", error);
    return res.status(500).json({ 
      error: "Failed to analyze the leaf image", 
      details: error.message || error 
    });
  }
});

// Configure Vite middleware or Static files depending on Environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving enabled.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is actively listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
