export interface Chunk {
  chunk?: string;
  finished: boolean;
  entire_msg?: string;
  chatId?: string;
}

export interface Message {
  id: string;
  response: string;
  prompt: string;
}
