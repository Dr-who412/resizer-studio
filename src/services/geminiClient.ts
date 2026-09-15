export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  imageSize?: '512px' | '1K' | '2K' | '4K';
}

export interface EditImageParams {
  prompt: string;
  base64Image: string;
  mimeType?: string;
}

export async function generateImageWithAi(params: GenerateImageParams): Promise<string> {
  const response = await fetch('/api/gemini/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  const result = await response.json();
  return result.imageUrl;
}

export async function editImageWithAi(params: EditImageParams): Promise<string> {
  const response = await fetch('/api/gemini/edit-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  const result = await response.json();
  return result.imageUrl;
}
