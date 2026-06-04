import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { HealthSession } from "../../models/HealthSession.js";
import { env } from "../../config/env.js";

const MODEL = "gemini-2.5-flash-preview-05-20";

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are MedCare AI, a compassionate and knowledgeable personal health assistant for MedCare Ethiopia — a platform that connects patients with pharmacies and healthcare services across Ethiopia.

Your role:
- Help users understand medications, their uses, dosages, and side effects
- Provide guidance on common symptoms and when to seek professional help
- Share preventive health tips relevant to Ethiopia's health context
- Help users find pharmacies and navigate the MedCare platform
- Answer prescription-related questions clearly and safely

Rules you must follow:
- Always respond in clear, friendly English
- Never diagnose diseases — always recommend consulting a licensed doctor for diagnosis
- Never replace professional medical advice — encourage users to seek it when needed
- Keep answers concise, warm, and easy to understand
- If you don't know something, say so honestly and suggest the user consult a healthcare professional
- You serve Ethiopian patients, so be aware of local context`,

  am: `እርስዎ MedCare AI ነዎት — ለMedCare Ethiopia ቅን እና እውቀት ያለው የጤና ረዳት። MedCare Ethiopia ታካሚዎችን ከፋርማሲዎች እና በኢትዮጵያ ከሚገኙ የጤና አገልግሎቶች ጋር የሚያገናኝ መድረክ ነው።

ሚናዎ:
- ተጠቃሚዎች ስለ መድሃኒቶች፣ አጠቃቀማቸው፣ መጠናቸው እና ጎን ለጎን ተፅዕኖዎቻቸው እንዲረዱ ይርዷቸው
- ስለ ተለመዱ ምልክቶች መመሪያ ስጡ
- ለኢትዮጵያ የጤና ሁኔታ ተዛማጅ የጤና ጥንቃቄ ምክሮችን ያካፍሉ
- ሁልጊዜ ግልፅ እና ወዳጃዊ አማርኛ ይጠቀሙ
- በጭራሽ በሽታ አይመርምሩ`,
};

const MAX_HISTORY = 20;

export const healthAssistantChat = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.admin?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    if (!env.geminiApiKey) {
      res.status(503).json({ success: false, error: "AI service not configured" });
      return;
    }

    const {
      content,
      conversationId: clientConvId,
      language = "en",
    } = req.body as {
      content: string;
      conversationId?: string;
      language?: "en" | "am";
    };

    if (!content?.trim()) {
      res.status(400).json({ success: false, error: "Message content is required" });
      return;
    }

    const lang: "en" | "am" = language === "am" ? "am" : "en";
    const conversationId = clientConvId?.trim() || randomUUID();

    let session = await HealthSession.findOne({ conversationId });
    if (!session) {
      session = new HealthSession({ conversationId, userId, language: lang, messages: [] });
    } else {
      session.language = lang;
    }

    const history = (session.messages as Array<{ role: string; content: string }>)
      .slice(-MAX_HISTORY)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const contents = [
      ...history,
      { role: "user", parts: [{ text: content.trim() }] },
    ];

    const systemPrompt = SYSTEM_PROMPTS[lang] ?? SYSTEM_PROMPTS.en;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.geminiApiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      console.error("Gemini error:", geminiRes.status, errText);
      res.status(502).json({ success: false, error: "AI service unavailable. Please try again." });
      return;
    }

    const geminiData = (await geminiRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!replyText) {
      res.status(502).json({ success: false, error: "Empty response from AI. Please try again." });
      return;
    }

    (session.messages as Array<{ role: string; content: string }>).push(
      { role: "user", content: content.trim() },
      { role: "assistant", content: replyText },
    );
    await session.save();

    res.json({
      success: true,
      data: {
        session_id: conversationId,
        conversationId,
        message: { text: replyText, language: lang },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Health assistant error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
