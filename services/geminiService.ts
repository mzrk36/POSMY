import { GoogleGenAI } from "@google/genai";
import { Product, Sale } from '../types';

// FIX: Per Gemini API guidelines, API_KEY is assumed to be available in process.env.
// The client should be initialized directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInsights = async (query: string, products: Product[], sales: Sale[]): Promise<string> => {
    // Add a check to ensure the API key is available.
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured.");
        return "The AI Assistant is not configured correctly. A Gemini API key is required in the environment variables.";
    }

    const model = 'gemini-2.5-flash';

    const prompt = `
      You are an expert business analyst for a small retail shop. 
      Analyze the following data to answer the user's question. 
      Provide concise, data-driven insights. Do not make up information.
      If the data is insufficient to answer, state that.
      Today's date is ${new Date().toLocaleDateString()}.

      DATA:
      Products (Current Inventory):
      ${JSON.stringify(products, null, 2)}

      Sales History:
      ${JSON.stringify(sales, null, 2)}

      USER QUESTION:
      "${query}"

      YOUR ANALYSIS:
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        // FIX: The .text property correctly extracts the string response from the model.
        return response.text;
    } catch (error) {
        console.error("Error generating insights from Gemini:", error);
        
        let errorMessage = "Sorry, I encountered an error while analyzing the data.";
        if (error instanceof Error) {
            // Provide more specific feedback for common API key issues
            if (error.message.includes('API key not valid')) {
                errorMessage = "The Gemini API key is not valid. Please check your configuration.";
            } else {
                 errorMessage += ` Please check the console for details.`;
            }
        }
        return errorMessage;
    }
};
