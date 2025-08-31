import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import saveMsg from '../utils/save';

// delete in the future
const GEMINI_API_KEY = 'AIzaSyC-rE0Ggpz0AlNeYVC3aoJXBmz2j2YS9eI';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const router = Router();

router.post('/:id', async (req, res, next) => {
    try {
        const fuserId = req.fuserId;
        const message = req.body.message;
        const chatId = req.params.id;

        let generated = '';

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const response = await ai.models.generateContentStream({
            model: 'gemini-2.0-flash-001',
            contents: `${message}`,
        });

        for await (const chunk of response) {
            generated += chunk.text;
            res.write(
                `data: ${JSON.stringify({
                    chunk: chunk.text,
                    finished: false,
                })}\n\n`
            );
        }

        const savedChatId = await saveMsg(       
            fuserId || '',
            message,
            generated,
			chatId || '',
        );
        if (!savedChatId) {
            throw new Error('Failed to save chat');
        }

        res.write(
            `data: ${JSON.stringify({
                entire_msg: generated,
                finished: true,
                chatId: savedChatId,
            })}\n\n`
        );
    } catch (e: any) {
        console.error('Stream error:', e);
        res.write(
            `data: ${JSON.stringify({
                error: e.message || 'An unexpected error occurred',
                finished: true,
                timestamp: Date.now(),
            })}\n\n`
        );
    } finally {
        res.end();
    }
});

export default router;
