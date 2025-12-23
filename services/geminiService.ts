import { GoogleGenAI, Type } from "@google/genai";
import { Department, LabAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeSymptoms = async (symptoms: string): Promise<{ department: Department; reasoning: string } | null> => {
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }

  try {
    const departmentsList = Object.values(Department).join(", ");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Hasta şu semptomları belirtiyor: "${symptoms}". 
      Aşağıdaki departman listesinden bu hasta için EN UYGUN olanı seç. 
      Eğer emin değilsen 'Dahiliye' (Internal Medicine) seç.
      
      Departman Listesi: ${departmentsList}
      
      Yanıtı JSON formatında ver.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            department: { type: Type.STRING, enum: Object.values(Department) },
            reasoning: { type: Type.STRING, description: "Short explanation in Turkish why this department was chosen." }
          },
          required: ["department", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

export const analyzeLabResults = async (resultsText: string, imageBase64?: string): Promise<LabAnalysisResult | null> => {
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }

  try {
    const parts: any[] = [
      {
        text: `Aşağıdaki tahlil sonuçlarını (metin ve/veya görsel) tıbbi standartlara göre analiz et: "${resultsText}".
        
        Lütfen bu değerleri incele:
        1. Genel bir özet yap (Hasta sağlıklı mı, dikkat çeken bir şey var mı?).
        2. Tespit edilen her bir değeri (Parametre) tek tek listele. Değerin Normal, Yüksek, Düşük veya Kritik olup olmadığını belirle.
        3. Beslenme veya yaşam tarzı tavsiyesi ver.

        Yanıtı sadece Türkçe olarak ve JSON formatında ver.`
      }
    ];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1] // Sadece base64 verisi kısmını al
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Genel sağlık durumu özeti." },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  parameterName: { type: Type.STRING, description: "Örn: Hemoglobin, Demir, WBC" },
                  value: { type: Type.STRING, description: "Örn: 14.5 g/dL" },
                  status: { type: Type.STRING, enum: ["Normal", "Yüksek", "Düşük", "Kritik"] },
                  interpretation: { type: Type.STRING, description: "Bu değerin anlamı." }
                },
                required: ["parameterName", "value", "status", "interpretation"]
              }
            },
            dietaryAdvice: { type: Type.STRING, description: "Beslenme ve yaşam tarzı önerileri." }
          },
          required: ["summary", "findings", "dietaryAdvice"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Lab Result Analysis Error:", error);
    return null;
  }
};