
import { GoogleGenAI } from "@google/genai";

// Fix: Always use the process.env.API_KEY string directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTaskDescription = async (taskTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على عنوان المهمة "${taskTitle}"، قم بإنشاء وصف مفصل باللغة العربية يتضمن الأهداف والخطوات المقترحة. اجعل النص مهنياً ومختصراً.`,
    });
    return response.text || "لم يتم التمكن من توليد وصف حالياً.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "خطأ في الاتصال بالذكاء الاصطناعي.";
  }
};
