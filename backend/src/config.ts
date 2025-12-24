import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// env vars
export const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING as string;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
export const GEMINI_MODEL = process.env.GEMINI_MODEL as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const FASTAPI_URL = process.env.FASTAPI_URL as string;
export const PORT = process.env.PORT as string;


// shared vars
export const GoogleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });