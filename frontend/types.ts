export interface Chunk {
  chunk?: string;
  finished: boolean;
  entire_msg?: string;
  chatId?: string;
}

export interface Message {
  _id: string;
  response: string;
  prompt: string;
  loading: boolean;
  streaming: boolean;
}

export type Chats = {
  title: string;
  chatId: string;
  createdAt: string;
}[];

export type Chat = {
  _id: string;
  isUser: boolean;
  message: string;
  createdAt: string;
}[];