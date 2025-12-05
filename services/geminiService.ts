import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TaskSuggestion } from "../types";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const suggestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "A concise name for the task (in Chinese).",
    },
    description: {
      type: Type.STRING,
      description: "A short, helpful description or instruction for the task (in Chinese).",
    },
    checkInTime: {
      type: Type.STRING,
      description: "A suggested time for the task in HH:mm format (24h).",
    },
    device: {
      type: Type.STRING,
      description: "The suggested device type (e.g., 手机, 电脑, 平板).",
    },
    appOrUrl: {
      type: Type.STRING,
      description: "A specific app name or URL related to the task.",
    },
  },
  required: ["name", "description", "checkInTime", "device", "appOrUrl"],
};

export const generateTaskSuggestion = async (input: string): Promise<TaskSuggestion> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      User Input: "${input}"
      
      You are a smart personal productivity assistant. Based on the user's rough input, suggest the details for a daily task.
      Fill in the missing details logically. 
      For example, if the user says "Learn English", you might suggest "Duolingo" as the app and "Mobile" as the device.
      If the user says "Read News", suggest a news site or app.
      Ensure the language of the output is Chinese (Simplified).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
        temperature: 0.3, // Lower temperature for more deterministic/practical suggestions
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as TaskSuggestion;
  } catch (error) {
    console.error("Error generating task suggestion:", error);
    throw error;
  }
};