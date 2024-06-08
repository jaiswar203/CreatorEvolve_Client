import { HTTP_REQUEST } from "@/constants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";

const URI = `${process.env.NEXT_PUBLIC_API_URL}/videos`;

interface IUploadYTVideo {
  url: string;
  thumbnail: string;
  name: string;
}

interface IVideoByIdResponse extends IResponse {
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

interface IExtractVideo {
  id: string; // video ID
  prompt?: string;
  aspect?: number;
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

interface IExtractVideoResponse extends IResponse {
  data: IExtractVideoDataInfo[];
}

interface IChapterRequest {
  id: string;
  prompt?: string;
}

export const videoApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: URI,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.access_token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getVideos: builder.query<IResponse, null>({
      query: () => "/",
    }),
    getVideoById: builder.query<IVideoByIdResponse, string>({
      query: (id: string) => `/${id}`,
    }),
    uploadYTVideo: builder.mutation<IResponse, IUploadYTVideo>({
      query: (body: IUploadYTVideo) => ({
        url: "/tl/upload/youtube",
        method: HTTP_REQUEST.POST,
        body,
      }),
    }),
    uploadVideoFiles: builder.mutation<IResponse, FormData>({
      query: (body: FormData) => ({
        url: "/tl/upload/file",
        method: HTTP_REQUEST.POST,
        body,
      }),
    }),
    extractShortContent: builder.mutation<IExtractVideoResponse, IExtractVideo>(
      {
        query: ({ id, aspect, prompt }: IExtractVideo) => ({
          url: `/extract/${id}?prompt=${prompt}&aspect=${aspect}`,
          method: HTTP_REQUEST.GET,
        }),
      }
    ),
    generateChapters: builder.mutation<IChaptersResponse, IChapterRequest>({
      query: ({ id, prompt }: IChapterRequest) => ({
        url: `/tl/generate/chapters/${id}?prompt=${prompt}`,
        method: HTTP_REQUEST.GET,
      }),
    }),
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
});

export const {
  useUploadYTVideoMutation,
  useUploadVideoFilesMutation,
  useGetVideosQuery,
  useGetVideoByIdQuery,
  useExtractShortContentMutation,
  useGenerateChaptersMutation,
} = videoApi;
