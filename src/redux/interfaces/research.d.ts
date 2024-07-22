import { IResponse } from "../api/auth";

export enum IChatRoles {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export interface IChatMessage {
  role: IChatRoles;
  content: string;
  images?: {
    context: string;
    title: string;
    thumbnail: string;
    link: string;
  }[];
  videos?: {
    context: string;
    title: string;
    thumbnail: string;
    link: string;
    id: string;
  }[];
}

export interface IChat {
  _id: string;
  token_usage: number;
  messages: IChatMessage[];
}

export interface IResearchListResponse extends IResponse {
  data: {
    _id: string;
    name: string;
    chats: IChat[];
  }[];
}
