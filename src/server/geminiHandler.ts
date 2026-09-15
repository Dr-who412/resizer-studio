import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server. Please ensure an API key is attached in Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function handleGenerateImage(body: {
  prompt: string;
  aspectRatio?: string;
  imageSize?: string;
}): Promise<{ imageUrl: string; prompt: string }> {
  const { prompt, aspectRatio = '1:1', imageSize = '1K' } = body;
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Missing prompt parameter');
  }

  const ai = getAiClient();
  // Allowed aspect ratios: "1:1", "3:4", "4:3", "9:16", "16:9"
  const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const safeAspectRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

  // Request image generation using the requested model gemini-3.1-flash-image-preview
  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: safeAspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });
  } catch (err: any) {
    // Fallback attempt with gemini-3.1-flash-image if preview alias differs in region
    console.warn('Attempt with gemini-3.1-flash-image-preview encountered error, trying gemini-3.1-flash-image:', err.message);
    response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: safeAspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });
  }

  let imageUrl = '';
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) {
    throw new Error('Model did not return an image part in the response.');
  }

  return { imageUrl, prompt };
}

export async function handleEditImage(body: {
  prompt: string;
  base64Image: string;
  mimeType?: string;
}): Promise<{ imageUrl: string; prompt: string }> {
  const { prompt, base64Image, mimeType = 'image/png' } = body;
  if (!prompt || !base64Image) {
    throw new Error('Both prompt and base64Image are required for editing.');
  }

  const ai = getAiClient();
  const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });
  } catch (err: any) {
    console.warn('Fallback to gemini-3.1-flash-image for editing:', err.message);
    response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });
  }

  let imageUrl = '';
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) {
    throw new Error('Model did not return an edited image part in the response.');
  }

  return { imageUrl, prompt };
}
