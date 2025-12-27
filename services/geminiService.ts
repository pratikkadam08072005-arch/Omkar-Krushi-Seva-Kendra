
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getLangInstruction = (lang: Language) => {
  if (lang === Language.HI) return "Please provide the entire response in Hindi language (हिंदी).";
  if (lang === Language.MR) return "Please provide the entire response in Marathi language (मराठी).";
  return "Please provide the response in English.";
};

export const diagnoseCrop = async (imageBase64: string, lang: Language = Language.EN) => {
  const ai = getAI();
  const langInstruction = getLangInstruction(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
        { text: `Act as a senior agronomist. Analyze this crop image. 1. Identify the plant. 2. Growth stage. 3. Health check. 4. Remedies if sick. 5. Expert tips. ${langInstruction} Format your response with clear headings: ## Crop Identity, ## Health Assessment, ## Recommended Actions, and ## Expert Tips (or their equivalents in ${lang}).` }
      ]
    }
  });
  return response.text;
};

export const getMarketPrices = async (crop: string, location: string, lang: Language = Language.EN) => {
  const ai = getAI();
  const langInstruction = getLangInstruction(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find current market prices (MSP and Mandi prices) for ${crop} in ${location} for the 2024-25 season. ${langInstruction} Provide sources.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title,
    uri: chunk.web?.uri
  })).filter((s: any) => s.uri) || [];

  return {
    text: response.text,
    sources
  };
};

export const getWeatherByLocation = async (lat: number, lng: number) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `What is the current weather at coordinates ${lat}, ${lng}? Return the data as a JSON object with keys: location, temp, condition, humidity, wind, rain.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          location: { type: Type.STRING },
          temp: { type: Type.STRING },
          condition: { type: Type.STRING },
          humidity: { type: Type.STRING },
          wind: { type: Type.STRING },
          rain: { type: Type.STRING }
        }
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

export const getFarmingAdvice = async (query: string, lang: Language = Language.EN) => {
  const ai = getAI();
  const langInstruction = getLangInstruction(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${query}. ${langInstruction}`,
    config: {
      systemInstruction: "You are a senior agricultural expert at Omkar Krushi Udhyog. Provide practical, sustainable, and scientifically accurate farming advice to Indian farmers."
    }
  });
  return response.text;
};
