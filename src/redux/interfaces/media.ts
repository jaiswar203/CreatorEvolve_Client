import { IResponse } from "../api/auth";

export interface IUploadYTVideo {
  url: string;
  thumbnail: string;
  name: string;
  quality?: string;
}

export interface IVideoByIdResponse extends IResponse {
  data: {
    created_at: string;
    name: string;
    tl_task_id: string;
    tl_video_id: string;
    type: string;
    updated_at: string;
    url: string;
    user_id: string;
    thumbnail: string;
    __v: number;
    _id: string;
  };
}

export interface IDubs {
  name: string;
  updated_at: string;
  created_at: string;
  url: string;
  _id: string;
  media_key: string;
  status: string;
  target_languages: string[];
}

export interface IDubsList extends IResponse {
  data: IDubs[];
}

export interface IExtractVideo {
  id: string; // video ID
  prompt?: string;
  aspect?: number;
}

export interface IExtractVideoResponse extends IResponse {
  data: IExtractVideoDataInfo[];
}

export interface IChapterRequest {
  id: string;
  prompt?: string;
}

export interface IExtractVideoDataInfo {
  start: number;
  end: number;
  summary: string;
  title: string;
  url: string;
}

export interface IChaptersResponse extends IResponse {
  start: number;
  end: number;
  summary: string;
  title: string;
  id: string;
}

export type MediaType = "video" | "audio";

export interface IDubRequest {
  mediaId: string;
  type: MediaType;
  target_lang: string;
  source_lang?: string;
  highest_resolution: boolean;
  num_speakers: number;
  start_time?: string;
  end_time?: string;
}
