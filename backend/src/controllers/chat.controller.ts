import { Request, Response, NextFunction } from "express";
import { FASTAPI_URL, GoogleAI, GEMINI_MODEL } from '../config'
import { Save } from '../helpers/save.helper'
import Chat from "../models/chat.model";

export async function GetChats(req: Request, res: Response, next: NextFunction) {
  try {
    const fId = req.fId;
    const chats = await Chat.find({ fuser: fId }, { _id: 1, title: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({
      msg: 'Chats fetched successfully',
      chats: chats,
    });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ msg: e.message || 'Fetching chats failed' });
  }
}

export async function GetChatById(req: Request, res: Response, next: NextFunction) {
  try {
    const cId = req.params.id;
    const chat = await Chat.findById(cId);
    if (!chat) {
      throw new Error('Chat with id not found');
    }
    res.status(200).json({
      msg: 'Chat fetched successfully',
      chat: chat,
    });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ msg: e.message || 'Fetching chat failed' });
  }
}

export async function GenerateRes(req: Request, res: Response, next: NextFunction) {
  try {
    const url = `${FASTAPI_URL}/chat/response`;
    const user_query = req.body.msg as string;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    let generated = ''

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_query }),
    });
    if (!response.ok) {
      throw new Error(`FastAPI server error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response stream');
    }
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.error) {
            throw new Error(data.error || 'Some error occurred while generating response');
          }
          if (data.chunk) {
            generated += data.chunk;
            res.write(`data: ${JSON.stringify({ chunk: data.chunk, finished: false })}\n\n`);
          }
          if (data.finished) {
            generated = data.full_msg;
            res.write(`data: ${JSON.stringify({ full_message: data.full_msg, finished: true })}\n\n`);
          }
        }
      }
    }
  } catch (e: any) {
    console.log('Error in /generate endpoint:', e.message)
    res.write('event: error\n');
    res.write(
      `data: ${JSON.stringify({
        error: e.message || 'Some error occurred while generating response',
        finished: true,
        timestamp: Date.now(),
      })}\n\n`
    );
  } finally {
    res.end();
  }
}

export async function GenerateResV2(req: Request, res: Response, next: NextFunction) {
  try {
    const fId = req.fId as string;
    const user_query = req.body.msg as string;
    const cId = req.params.cId as string;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    let generated = '';

    const response = await GoogleAI.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: `${user_query}`,
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
    const saveResponse = await Save(
      fId,
      user_query,
      generated,
      cId
    );
    if (saveResponse.type === 'error') {
      throw new Error(saveResponse.msg);
    }
    res.write(
      `data: ${JSON.stringify({
        full_msg: generated,
        finished: true,
        chatId: saveResponse.savedCId,
      })}\n\n`
    );
  } catch (e: any) {
    console.error('Error during response streaming:', e);
    res.write('event: error\n');
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
}