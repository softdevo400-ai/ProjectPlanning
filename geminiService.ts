
import { GoogleGenAI, Type } from "@google/genai";
import { Project } from "./types";

// Always use process.env.API_KEY directly for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProjectInsights = async (projects: Project[]) => {
  try {
    const summaryData = projects.map(p => ({
      name: p.name,
      status: p.status,
      progress: p.progress,
      budget: p.totalBudget,
      spent: p.spentBudget
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these space agency projects and provide a high-level executive summary, identifying critical risks and budget concerns: ${JSON.stringify(summaryData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            riskAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            financialHealth: { type: Type.STRING }
          },
          required: ["executiveSummary", "riskAlerts", "financialHealth"]
        }
      }
    });

    // response.text is a property; using || '{}' handles cases where text might be undefined
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return {
      executiveSummary: "Unable to generate automated insights at this time.",
      riskAlerts: ["Manual review required for project schedules."],
      financialHealth: "Review detailed expenditure tabs."
    };
  }
};
