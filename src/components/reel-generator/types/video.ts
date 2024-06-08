import { VIDEO_TYPES } from "@/constants/video";

export interface IVideoResponse {
  _id: string;
  tl_task_id: string;
  user_id: string;
  type: VIDEO_TYPES;
  name:string;
  thumbnail: string;
  created_at: string;
  updated_at: string;
  __v: number;
  tl_video_id: string;
}
