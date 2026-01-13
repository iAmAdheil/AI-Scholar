export interface ChunkInterface {
  chunk?: string;
  finished: boolean;
  title?: string;
  entire_msg?: string;
  chatId?: string;
}

export interface DisplayMsgInterface {
  id: string;
  prompt: string;
  response: string;
  loading: boolean;
  streaming: boolean;
}

export type MsgInterface = {
  _id: string;
  isUser: boolean;
  message: string;
  createdAt: string;
};

export type DisplayChatsInterface = {
  _id: string;
  title: string;
  createdAt: string;
}[];