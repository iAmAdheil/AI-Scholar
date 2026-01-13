export interface Chunk {
  chunk?: string;
  finished: boolean;
  entire_msg?: string;
  chatId?: string;
}

export interface Message {
  id: string;
  prompt: string;
  response: string;
  loading: boolean;
  streaming: boolean;
}

export type Chat = {
  _id: string;
  isUser: boolean;
  message: string;
  createdAt: string;
}[];

export type Chats = {
  _id: string;
  title: string;
  createdAt: string;
}[];