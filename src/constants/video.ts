export enum VIDEO_TYPES {
  YOUTUBE = "YOUTUBE",
  FILE_UPLOAD = "FILE_UPLOAD",
}

export interface IMedia {
  type?: VIDEO_TYPES,
  data: string | File,
  thumbnail?: string | null,
  title: string | null
  media_type: string | null
}