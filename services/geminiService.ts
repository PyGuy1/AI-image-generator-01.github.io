
import { GoogleGenAI, Modality } from "@google/genai";

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface EditImageResult {
  imageDataUrl: string | null;
  text: string | null;
}

/**
 * Sends an image and a text prompt to the Gemini API for editing.
 * @param base64Data The base64-encoded image data.
 * @param mimeType The MIME type of the image.
 * @param prompt The text prompt describing the desired edit.
 * @returns A promise that resolves to an object containing the edited image URL and any accompanying text.
 */
export async function editImage(base64Data: string, mimeType: string, prompt: string): Promise<EditImageResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview', // This is NanoBanana
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // Must include both IMAGE and TEXT for this model's response
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let imageDataUrl: string | null = null;
    let text: string | null = null;
    
    const responseParts = response.candidates?.[0]?.content?.parts;

    if (!responseParts) {
        throw new Error("Invalid response structure from API.");
    }

    for (const part of responseParts) {
      if (part.inlineData) {
        imageDataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      } else if (part.text) {
        text = part.text;
      }
    }

    if (!imageDataUrl) {
      throw new Error(`API did not return an image. It may have refused the request. Response: ${text || 'No text response.'}`);
    }

    return { imageDataUrl, text };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}
