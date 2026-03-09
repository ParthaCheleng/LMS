import { Request, Response, NextFunction } from 'express';
import { HfInference } from '@huggingface/inference';
import { env } from '../../config/env';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function chatWithAI(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { message, history } = req.body as {
            message: string;
            history?: ChatMessage[];
        };

        if (!message || typeof message !== 'string' || message.trim() === '') {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        if (!env.HF_TOKEN) {
            res.status(503).json({ error: 'AI service is not configured' });
            return;
        }

        const hfMessages = [
            {
                role: 'system' as const,
                content:
                    'You are a helpful learning assistant for an online course platform. ' +
                    'Help students with their questions about programming, technology, and their courses. ' +
                    'Keep responses concise, friendly, and educational. Use markdown formatting when helpful.',
            },
            ...(history || []).map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
            { role: 'user' as const, content: message.trim() },
        ];

        try {
            const hf = new HfInference(env.HF_TOKEN);
            const response = await hf.chatCompletion({
                model: env.HF_MODEL_ID,
                messages: hfMessages,
                max_tokens: 1024,
                temperature: 0.7,
            });

            const aiMessage =
                response.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

            res.json({ reply: aiMessage });
        } catch (apiError: any) {
            console.error('HuggingFace SDK error:', apiError);
            res.status(502).json({
                error: 'AI service temporarily unavailable',
                details: process.env.NODE_ENV === 'development' ? apiError.message : undefined,
            });
        }
    } catch (error) {
        console.error('Chat error:', error);
        next(error);
    }
}
