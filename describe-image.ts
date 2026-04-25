import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
  const fileBytes = fs.readFileSync('original_images/overview.png');
  const fileBase64 = fileBytes.toString('base64');
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      {
        role: 'user',
        parts: [
          { text: "Detailed description of the UI layout, colors, typography, specific text, cards, charts, icons, and elements in this image, specifically focusing on the 'Overview' section of this dashboard. Provide exact texts, numbers, and layout structure so I can replicate it in Tailwind CSS. Describe the F-Pattern navigation, sidebar, top header, high-level KPIs, charts, and detailed data tables." },
          { inlineData: { mimeType: 'image/png', data: fileBase64 } }
        ]
      }
    ]
  });
  console.log(response.text);
}

run().catch(console.error);
