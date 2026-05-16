import { randomUUID } from 'crypto';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

type MedcareAiWebhookResponse = {
  status?: string;
  session_id?: string | number;
  timestamp?: string;
  user?: unknown;
  message?: { text?: string; language?: string };
  prescription?: {
    detected?: boolean;
    doctor?: string | null;
    clinic?: string | null;
    medications?: unknown[];
    ocr_model?: string | null;
    page_count?: number;
  };
  error?: string;
};

export const sendMedcareAiChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const webhookUrl = process.env.MEDCARE_AI_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      res.status(503).json({ success: false, error: 'MedCare AI service is not configured.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const contentRaw = typeof req.body?.content === 'string' ? req.body.content : '';
    const content = contentRaw.trim();
    if (!content) {
      res.status(400).json({ success: false, error: 'Message content is required.' });
      return;
    }

    let conversationId: string;
    const clientConv = req.body?.conversationId;
    if (typeof clientConv === 'string' && clientConv.trim()) {
      conversationId = clientConv.trim();
    } else {
      conversationId = randomUUID();
    }

    const outbound = {
      userId: req.user.userId,
      conversationId,
      messageType: 'textMessage' as const,
      content,
      sentAt: new Date().toISOString()
    };

    let whResponse: globalThis.Response;
    try {
      whResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outbound),
        signal: AbortSignal.timeout(90_000)
      });
    } catch (err) {
      const name = (err as Error).name;
      if (name === 'TimeoutError' || name === 'AbortError') {
        res.status(504).json({ success: false, error: 'MedCare AI request timed out. Please try again.' });
        return;
      }
      throw err;
    }

    const text = await whResponse.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      res.status(502).json({ success: false, error: 'MedCare AI returned invalid data.' });
      return;
    }

    const body = json as MedcareAiWebhookResponse | null;
    const errMsg =
      typeof body?.error === 'string' ? body.error : 'MedCare AI request failed.';

    if (!whResponse.ok) {
      res.status(502).json({
        success: false,
        error: body && typeof body === 'object' && body.error ? errMsg : 'MedCare AI request failed.'
      });
      return;
    }

    if (body?.status && body.status !== 'success') {
      res.status(502).json({ success: false, error: errMsg });
      return;
    }

    res.json({
      success: true,
      data: body ?? {}
    });
  } catch (error) {
    console.error('MedCare AI chat error:', error);
    res.status(500).json({ success: false, error: 'MedCare AI request failed.' });
  }
};
