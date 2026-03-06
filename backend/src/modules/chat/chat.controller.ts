import { Request, Response, NextFunction } from 'express';
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

        const messages: ChatMessage[] = [
            {
                role: 'system',
                content:
                    'You are a helpful learning assistant for an online course platform. ' +
                    'Help students with their questions about programming, technology, and their courses. ' +
                    'Keep responses concise, friendly, and educational. Use markdown formatting when helpful.',
            },
            ...(history || []),
            { role: 'user', content: message.trim() },
        ];

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${env.HF_MODEL_ID}/v1/chat/completions`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: env.HF_MODEL_ID,
                    messages,
                    max_tokens: 1024,
                    temperature: 0.7,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('HuggingFace API error:', response.status, errorText);
            res.status(502).json({
                error: 'AI service temporarily unavailable',
                details: process.env.NODE_ENV === 'development' ? errorText : undefined,
            });
            return;
        }

        const data = (await response.json()) as {
            choices?: { message?: { content?: string } }[];
        };
        const aiMessage =
            data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

        res.json({ reply: aiMessage });
    } catch (error) {
        console.error('Chat error:', error);
        next(error);
    }
}
