import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    let apiKey = "";
    
    // 1. Try window.process.env (injected by server.ts or vite.config.ts)
    if (typeof window !== 'undefined') {
      // @ts-ignore
      apiKey = window.process?.env?.GEMINI_API_KEY;
    }
    
    // 2. Try import.meta.env (Vite's way)
    if (!apiKey) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
    
    // 3. Try process.env (for SSR or if Vite replaces it)
    if (!apiKey) {
      try {
        // @ts-ignore
        apiKey = process.env.GEMINI_API_KEY;
      } catch (e) {
        // process.env might not be defined in browser
      }
    }

    if (!apiKey) {
      throw new Error("Lỗi: Không tìm thấy GEMINI_API_KEY. Vui lòng cấu hình API Key trong môi trường (Environment Variables).");
    }
    aiInstance = new GoogleGenAI({ 
      apiKey
    });
  }
  return aiInstance;
}

export async function extractChartData(base64Data: string, mimeType: string) {
  const prompt = `
  Analyze this Tu Vi (Vietnamese astrology) chart image carefully.
  Extract ALL the stars located in each of the 12 standard palaces.
  
  CRITICAL INSTRUCTIONS:
  1. DO NOT MISS ANY STARS. Extract every single star visible in each palace box, including all major stars (Chính Tinh), minor stars (Phụ Tinh), Sát Tinh, Bại Tinh, Tuần, Triệt, and Vòng Trường Sinh.
  2. INCLUDE THE STAR'S STATE/MODIFIER. If a star has a modifier next to it like (V), (M), (Đ), (B), (H), (h), etc., you MUST include it in the extracted string. For example, extract "Cự Môn (V)" exactly as it appears, DO NOT just extract "Cự Môn".
  3. Return a JSON object mapping each palace to its complete list of stars.
  4. The 12 standard palaces are: Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ.
  5. If a palace has a slightly different name in the image (e.g., Giao Hữu instead of Nô Bộc, or Thê instead of Phu Thê), map it to the standard name in the list above.
  `;

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            "Mệnh": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Phụ Mẫu": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Phúc Đức": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Điền Trạch": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Quan Lộc": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Nô Bộc": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Thiên Di": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Tật Ách": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Tài Bạch": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Tử Tức": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Phu Thê": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Huynh Đệ": { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("API key not valid") || error?.status === 400) {
      throw new Error("Lỗi: API Key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trong môi trường của bạn.");
    }
    if (error?.message?.includes("Forbidden") || error?.status === 403) {
      throw new Error("Lỗi: API Key không có quyền truy cập Gemini API. Vui lòng kiểm tra xem bạn đã bật 'Generative AI API' trong Google Cloud Console chưa.");
    }
    throw error;
  }
}

export async function analyzeTuVi(palace: string, stars: string[], chartData: Record<string, string[]> | null = null, centralInfo?: any) {
  let prompt = `
Act as a master of Tử Vi (Vietnamese astrology), strictly following the traditional methodology of 'Vân Đằng Thái Thứ Lang' (Tử Vi Áo Bí / Tử Vi Thực Hành).

I am providing you with a specific Palace (Cung) and a list of Stars (Sao) located in that Palace.

Palace: ${palace}
Stars: ${stars.join(', ')}
`;

  if (centralInfo) {
    prompt += `
Basic Information:
- Năm sinh: ${centralInfo.birthYearCanChi}
- Bản Mệnh: ${centralInfo.menh}
- Cục: ${centralInfo.cuc}
- Tương quan Cục - Mệnh: ${centralInfo.cucMenhRelation}
- Âm Dương: ${centralInfo.amDuong} (${centralInfo.amDuongNghichLy})
- Mệnh Chủ: ${centralInfo.menhChu}
- Thân Chủ: ${centralInfo.thanChu}
- Năm xem hiện tại (Năm tiểu vận/lưu niên đang được chọn trên lá số): ${centralInfo.viewYear || new Date().getFullYear()}
- Năm thực tế hiện tại: ${new Date().getFullYear()}

IMPORTANT CONTEXT: If the user asks about "năm nay" (this year), "hiện tại" (current), or "sắp tới" (upcoming), you MUST base your analysis on the "Năm xem hiện tại" (${centralInfo.viewYear || new Date().getFullYear()}) provided above. The user is viewing their chart for the year ${centralInfo.viewYear || new Date().getFullYear()}.
`;
  }

  if (chartData) {
    prompt += `
Here is the complete data of the Tu Vi chart for context:
${Object.entries(chartData).map(([p, s]) => `- **${p}**: ${s.length > 0 ? s.join(', ') : 'Vô Chính Diệu'}`).join('\n')}
`;
  }

  prompt += `
Please provide a detailed interpretation focusing on the **Luồng Nhân Quả** rather than just listing the isolated meanings of stars in this single palace.
If you mention the relationship between Cục and Mệnh, strictly use the provided "Tương quan Cục - Mệnh". Do NOT recalculate or guess this relationship.
CRITICAL INSTRUCTION FOR TIMING (ĐẠI VẬN, TIỂU VẬN): The Palace string and Chart Data now include "Đại Hạn" (10-year period), "Tiểu Hạn" (1-year period), and "Tràng Sinh". They also include "Lưu" stars (Annual stars like Lưu Thái Tuế, Lưu Lộc Tồn) which are specific to the "Năm xem hiện tại". When analyzing timing, periods, or specific years related to this palace, you MUST base your analysis on these specific Đại Hạn, Tiểu Hạn, and Lưu niên stars provided. Do NOT hallucinate or guess the timing.

Your analysis MUST include:
1.  **Gốc Rễ Nhân Quả:** What are the deep-seated causes, past karmas, or inherent traits represented by these stars in this specific palace?
2.  **Sự Tương Tác & Chiếu Xạ:** How does this palace interact with others? (If full chart data is provided, analyze the actual Tam Hợp, Xung Chiếu, Nhị Hợp. If not, explain theoretically what this combination usually attracts or conflicts with).
3.  **Hệ Quả Thực Tế:** How do these karmic roots manifest in the person's actual life, behavior, and events related to this palace?
4.  **Vòng Lặp & Cách Hóa Giải:** Identify any negative cause-and-effect loops (vòng lặp nhân quả) this combination might create and provide practical, actionable advice to break them or mitigate bad effects.
5.  **Bài Học Cốt Lõi:** What is the ultimate spiritual or life lesson the person needs to learn from this aspect of their chart?

Format the output in clean Markdown. Use Vietnamese language. Maintain a scholarly, respectful, profound, and traditional tone.
IMPORTANT: Do NOT use LaTeX math formatting (like $\\rightarrow$) for arrows. Use simple text arrows like -> or → instead.
Do NOT include English translations or terms in parentheses after Vietnamese terms (e.g., do not write 'Cách cục chính (Main structure)', just write 'Cách cục chính').
`;

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("API key not valid") || error?.status === 400) {
      throw new Error("Lỗi: API Key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trong môi trường của bạn.");
    }
    if (error?.message?.includes("Forbidden") || error?.status === 403) {
      throw new Error("Lỗi: API Key không có quyền truy cập Gemini API. Vui lòng kiểm tra xem bạn đã bật 'Generative AI API' trong Google Cloud Console chưa.");
    }
    throw error;
  }
}

export async function analyzeHolisticChart(chartData: Record<string, string[]>, centralInfo?: any) {
  let prompt = `
Act as a master of Tử Vi (Vietnamese astrology), strictly following the traditional methodology of 'Vân Đằng Thái Thứ Lang' (Tử Vi Áo Bí / Tử Vi Thực Hành).

I am providing you with the complete data of a Tu Vi chart, mapping each of the 12 Palaces (Cung) to its Stars (Sao).
`;

  if (centralInfo) {
    prompt += `
Basic Information:
- Năm sinh: ${centralInfo.birthYearCanChi}
- Bản Mệnh: ${centralInfo.menh}
- Cục: ${centralInfo.cuc}
- Tương quan Cục - Mệnh: ${centralInfo.cucMenhRelation}
- Âm Dương: ${centralInfo.amDuong} (${centralInfo.amDuongNghichLy})
- Mệnh Chủ: ${centralInfo.menhChu}
- Thân Chủ: ${centralInfo.thanChu}
- Năm xem hiện tại (Năm tiểu vận/lưu niên đang được chọn trên lá số): ${centralInfo.viewYear || new Date().getFullYear()}
- Năm thực tế hiện tại: ${new Date().getFullYear()}

IMPORTANT CONTEXT: If the user asks about "năm nay" (this year), "hiện tại" (current), or "sắp tới" (upcoming), you MUST base your analysis on the "Năm xem hiện tại" (${centralInfo.viewYear || new Date().getFullYear()}) provided above. The user is viewing their chart for the year ${centralInfo.viewYear || new Date().getFullYear()}.
`;
  }

  prompt += `
Chart Data:
${Object.entries(chartData).map(([palace, stars]) => `- **${palace}**: ${stars.length > 0 ? stars.join(', ') : 'Vô Chính Diệu (Không có sao)'}`).join('\n')}

Please provide a comprehensive, holistic interpretation of this chart. Do not just analyze individual palaces in isolation. Focus on the interactions, combinations, and overall structure.
CRITICAL INSTRUCTION: Pay special attention to the Earthly Branch (Địa Chi) where the Mệnh palace is located (Mệnh lập tại đâu). The position of Mệnh (e.g., Mệnh lập tại Dần, Mão, Thìn...) is crucial for determining the overall structure (Cách Cục) and the brightness/state of the stars. Make sure your analysis strictly aligns with the fact that Mệnh is located at this specific Earthly Branch.
Also, strictly use the provided "Tương quan Cục - Mệnh" (e.g., Mệnh sinh Cục, Cục sinh Mệnh, etc.) in your analysis. Do NOT recalculate or guess this relationship, as it has already been accurately calculated.
CRITICAL INSTRUCTION FOR TIMING (ĐẠI VẬN, TIỂU VẬN): The chart data now includes "Đại Hạn" (10-year period), "Tiểu Hạn" (1-year period), and "Tràng Sinh" for each palace. It also includes "Lưu" stars (Annual stars like Lưu Thái Tuế, Lưu Lộc Tồn) which are specific to the "Năm xem hiện tại". When analyzing timing, periods, or specific years, you MUST base your analysis on these specific Đại Hạn, Tiểu Hạn, and Lưu niên stars provided in the chart data. Do NOT hallucinate or guess the timing.

Your analysis MUST include:
1.  **Cách Cục Chính:** Identify the main "Cách cục" of the chart based on the stars in Mệnh, Tài Bạch, Quan Lộc, and Thiên Di, AND the specific Earthly Branch where Mệnh is located.
2.  **Tam Hợp Mệnh - Tài - Quan:** Analyze the core triangle of the person's life (Destiny, Wealth, Career) and how they support or conflict with each other.
3.  **Tuyến Xung Chiếu & Các Cung Quan Trọng Khác:** Analyze important opposing palaces (e.g., Mệnh vs Thiên Di) and the Phúc Đức palace (which governs luck and mental state).
4.  **Điểm Mạnh & Khuyết Điểm:** What is the strongest aspect of this chart? What is the most vulnerable aspect? (Use exactly "Điểm Mạnh" and "Khuyết Điểm" as subheadings, do NOT include English words like "(Vulnerabilities)" or "(Strengths)").
5.  **Lời Khuyên Tổng Thể:** Practical advice for the person based on the holistic view of their chart.

Format the output in clean Markdown. Use Vietnamese language. Maintain a scholarly, respectful, and traditional tone.
IMPORTANT: Do NOT use LaTeX math formatting (like $\\rightarrow$) for arrows. Use simple text arrows like -> or → instead.
Do NOT include English translations or terms in parentheses after Vietnamese terms (e.g., do not write 'Cách cục chính (Main structure)', just write 'Cách cục chính').
`;

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("API key not valid") || error?.status === 400) {
      throw new Error("Lỗi: API Key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trong môi trường của bạn.");
    }
    if (error?.message?.includes("Forbidden") || error?.status === 403) {
      throw new Error("Lỗi: API Key không có quyền truy cập Gemini API. Vui lòng kiểm tra xem bạn đã bật 'Generative AI API' trong Google Cloud Console chưa.");
    }
    throw error;
  }
}

export async function chatWithAstrologer(
  chartData: Record<string, string[]> | null,
  chatHistory: { role: 'user' | 'model', text: string }[],
  message: string,
  centralInfo?: any
) {
  const ai = getAI();
  
  let systemInstruction = `Act as a master of Tử Vi (Vietnamese astrology), strictly following the traditional methodology of 'Vân Đằng Thái Thứ Lang' (Tử Vi Áo Bí / Tử Vi Thực Hành).
You are consulting a client directly. Be empathetic, practical, and insightful. 
Do not just recite theory; apply it to their real-life questions, psychological state, and practical situations to give them clear direction and actionable advice.
IMPORTANT: Do NOT use LaTeX math formatting (like $\\rightarrow$) for arrows. Use simple text arrows like -> or → instead.
Do NOT include English translations or terms in parentheses after Vietnamese terms (e.g., do not write 'Cách cục chính (Main structure)', just write 'Cách cục chính').`;

  if (chartData) {
    systemInstruction += `\n\nHere is the client's Tu Vi chart data:\n`;
    if (centralInfo) {
      systemInstruction += `Basic Information:
- Năm sinh: ${centralInfo.birthYearCanChi}
- Bản Mệnh: ${centralInfo.menh}
- Cục: ${centralInfo.cuc}
- Tương quan Cục - Mệnh: ${centralInfo.cucMenhRelation}
- Âm Dương: ${centralInfo.amDuong} (${centralInfo.amDuongNghichLy})
- Mệnh Chủ: ${centralInfo.menhChu}
- Thân Chủ: ${centralInfo.thanChu}
- Năm xem hiện tại (Năm tiểu vận/lưu niên đang được chọn trên lá số): ${centralInfo.viewYear || new Date().getFullYear()}
- Năm thực tế hiện tại: ${new Date().getFullYear()}

IMPORTANT CONTEXT: If the user asks about "năm nay" (this year), "hiện tại" (current), or "sắp tới" (upcoming), you MUST base your analysis on the "Năm xem hiện tại" (${centralInfo.viewYear || new Date().getFullYear()}) provided above. The user is viewing their chart for the year ${centralInfo.viewYear || new Date().getFullYear()}.
\n\n`;
    }
    systemInstruction += `${Object.entries(chartData).map(([palace, stars]) => `- **${palace}**: ${stars.length > 0 ? stars.join(', ') : 'Vô Chính Diệu'}`).join('\n')}\n\nUse this chart to answer their questions accurately. Reference specific stars and palaces in their chart when giving advice. If you mention the relationship between Cục and Mệnh, strictly use the provided "Tương quan Cục - Mệnh". Do NOT recalculate or guess this relationship.
CRITICAL INSTRUCTION FOR TIMING (ĐẠI VẬN, TIỂU VẬN): The Chart Data now includes "Đại Hạn" (10-year period), "Tiểu Hạn" (1-year period), and "Tràng Sinh" for each palace. It also includes "Lưu" stars (Annual stars like Lưu Thái Tuế, Lưu Lộc Tồn) which are specific to the "Năm xem hiện tại". When answering questions related to timing, periods, or specific years (especially questions about "Đại vận", "Tiểu vận", "Năm nay"), you MUST base your analysis on these specific Đại Hạn, Tiểu Hạn, and Lưu niên stars provided in the chart data. Do NOT hallucinate or guess the timing.`;
  } else {
    systemInstruction += `\n\nThe client has not provided their chart yet. Answer their general questions about Tu Vi, but encourage them to upload their chart for personalized advice.`;
  }

  const contents = chatHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("API key not valid") || error?.status === 400) {
      throw new Error("Lỗi: API Key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trong môi trường của bạn.");
    }
    if (error?.message?.includes("Forbidden") || error?.status === 403) {
      throw new Error("Lỗi: API Key không có quyền truy cập Gemini API. Vui lòng kiểm tra xem bạn đã bật 'Generative AI API' trong Google Cloud Console chưa.");
    }
    throw error;
  }
}

export async function answerSelfUnderstandingCategory(chartData: Record<string, string[]>, categoryName: string, questions: string[], centralInfo?: any) {
  let prompt = `
Act as a master of Tử Vi (Vietnamese astrology), strictly following the traditional methodology of 'Vân Đằng Thái Thứ Lang' (Tử Vi Áo Bí / Tử Vi Thực Hành).

I am providing you with the complete data of a Tu Vi chart.
`;

  if (centralInfo) {
    prompt += `
Basic Information:
- Năm sinh: ${centralInfo.birthYearCanChi}
- Bản Mệnh: ${centralInfo.menh}
- Cục: ${centralInfo.cuc}
- Tương quan Cục - Mệnh: ${centralInfo.cucMenhRelation}
- Âm Dương: ${centralInfo.amDuong} (${centralInfo.amDuongNghichLy})
- Mệnh Chủ: ${centralInfo.menhChu}
- Thân Chủ: ${centralInfo.thanChu}
- Năm xem hiện tại (Năm tiểu vận/lưu niên đang được chọn trên lá số): ${centralInfo.viewYear || new Date().getFullYear()}
- Năm thực tế hiện tại: ${new Date().getFullYear()}

IMPORTANT CONTEXT: If the user asks about "năm nay" (this year), "hiện tại" (current), or "sắp tới" (upcoming), you MUST base your analysis on the "Năm xem hiện tại" (${centralInfo.viewYear || new Date().getFullYear()}) provided above. The user is viewing their chart for the year ${centralInfo.viewYear || new Date().getFullYear()}.
`;
  }

  prompt += `
Chart Data:
${Object.entries(chartData).map(([palace, stars]) => `- **${palace}**: ${stars.length > 0 ? stars.join(', ') : 'Vô Chính Diệu'}`).join('\n')}

The client wants a comprehensive report on the topic: "${categoryName}".
Please answer the following specific questions in your report:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Please provide a detailed, insightful, and highly personalized report based ONLY on the provided chart data. 
If you mention the relationship between Cục and Mệnh, strictly use the provided "Tương quan Cục - Mệnh". Do NOT recalculate or guess this relationship.
CRITICAL INSTRUCTION FOR TIMING (ĐẠI VẬN, TIỂU VẬN): The Chart Data now includes "Đại Hạn" (10-year period), "Tiểu Hạn" (1-year period), and "Tràng Sinh" for each palace. It also includes "Lưu" stars (Annual stars like Lưu Thái Tuế, Lưu Lộc Tồn) which are specific to the "Năm xem hiện tại". When answering questions related to timing, periods, or specific years (especially questions about "Đại vận", "Tiểu vận", "Năm nay"), you MUST base your analysis on these specific Đại Hạn, Tiểu Hạn, and Lưu niên stars provided in the chart data. Do NOT hallucinate or guess the timing.
Address each question clearly. Explain which palaces and stars you are looking at to derive your answers.
Focus on the luồng nhân quả and provide practical advice.

Format the output in clean Markdown. Use headings for each question. Use Vietnamese language. Maintain a scholarly, empathetic, and traditional tone.
IMPORTANT: Do NOT use LaTeX math formatting (like $\\rightarrow$) for arrows. Use simple text arrows like -> or → instead.
Do NOT include English translations or terms in parentheses after Vietnamese terms (e.g., do not write 'Cách cục chính (Main structure)', just write 'Cách cục chính').
`;

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("API key not valid") || error?.status === 400) {
      throw new Error("Lỗi: API Key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trong môi trường của bạn.");
    }
    if (error?.message?.includes("Forbidden") || error?.status === 403) {
      throw new Error("Lỗi: API Key không có quyền truy cập Gemini API. Vui lòng kiểm tra xem bạn đã bật 'Generative AI API' trong Google Cloud Console chưa.");
    }
    throw error;
  }
}
