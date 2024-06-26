import { HTTP_REQUEST } from "@/constants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";
import {
  IAddSharedVoiceInLibrary,
  IChapterRequest,
  IChaptersResponse,
  IDubRequest,
  IDubsList,
  IExtractVideo,
  IExtractVideoResponse,
  IGenerateRandomVoiceParamResponse,
  IGenerateRandomVoiceRequest,
  IGenerateRandomVoiceResponse,
  ISaveRandomGeneratedVoiceRequest,
  ISharedVoiceListResponse,
  IUploadYTVideo,
  IVideoByIdResponse,
  IVoiceListResponse,
  TextToSpeechRequest,
} from "../interfaces/media";

const URI = `${process.env.NEXT_PUBLIC_API_URL}/media`;

export interface InstantVoiceCloneRequest {
  name: string;
  files: string[];
  description: string;
  labels: { key: string; value: string }[];
}

export const mediaApi = createApi({
  reducerPath: "media",
  baseQuery: fetchBaseQuery({
    baseUrl: URI,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.access_token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Video", "Dub", "Chapter", "Audio", "Voices"],
  endpoints: (builder) => ({
    getVideos: builder.query<IResponse, { tl?: boolean }>({
      query: ({ tl = false }: { tl?: boolean } = {}) => `/videos?tl=${tl}`,
      providesTags: (result) =>
        result ? [{ type: "Video", id: "LIST" }] : ["Video"],
    }),
    getAudios: builder.query<IResponse, string>({
      query: () => `/audios`,
      providesTags: (result) =>
        result ? [{ type: "Audio", id: "LIST" }] : ["Audio"],
    }),
    getVideoById: builder.query<IVideoByIdResponse, string>({
      query: (id: string) => `/videos/${id}`,
      providesTags: (result, error, id) => [{ type: "Video", id }],
    }),
    uploadVideoFile: builder.mutation<
      IResponse,
      { body: FormData; invalidate?: boolean }
    >({
      query: ({ body }) => ({
        url: `/videos/upload`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: (result, error, { invalidate = true }) =>
        invalidate ? [{ type: "Video", id: "LIST" }] : [],
    }),
    uploadAudioFile: builder.mutation<
      IResponse,
      { body: FormData; invalidate?: boolean }
    >({
      query: ({ body }) => ({
        url: `/audios/upload`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: (result, error, { invalidate = true }) =>
        invalidate ? [{ type: "Video", id: "LIST" }] : [],
    }),
    uploadVideoUrl: builder.mutation<IResponse, IUploadYTVideo>({
      query: (body: IUploadYTVideo) => ({
        url: `/videos/upload/url?quality=${body.quality ?? "high"}`,
        method: HTTP_REQUEST.POST,
        body: {
          url: body.url,
          name: body.name,
          thumbnail: body.thumbnail,
        },
      }),
      invalidatesTags: [{ type: "Video", id: "LIST" }],
    }),
    uploadYTVideoToTL: builder.mutation<IResponse, IUploadYTVideo>({
      query: (body: IUploadYTVideo) => ({
        url: "/videos/tl/upload/youtube",
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: [{ type: "Video", id: "LIST" }],
    }),
    uploadVideoFilesToTL: builder.mutation<IResponse, FormData>({
      query: (body: FormData) => ({
        url: "/videos/tl/upload/file",
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: [{ type: "Video", id: "LIST" }],
    }),
    extractShortContent: builder.mutation<IExtractVideoResponse, IExtractVideo>(
      {
        query: ({ id, aspect, prompt }: IExtractVideo) => ({
          url: `/videos/extract/${id}?prompt=${prompt}&aspect=${aspect}`,
          method: HTTP_REQUEST.GET,
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "Video", id }],
      }
    ),
    generateChapters: builder.mutation<IChaptersResponse, IChapterRequest>({
      query: ({ id, prompt }: IChapterRequest) => ({
        url: `/videos/tl/generate/chapters/${id}?prompt=${prompt}`,
        method: HTTP_REQUEST.GET,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Chapter", id }],
    }),
    dubVideoFile: builder.mutation<IResponse, IDubRequest>({
      query: (body: IDubRequest) => ({
        url: `/audios/dubbing/${body.mediaId}?type=${body.type}`,
        method: HTTP_REQUEST.POST,
        body: {
          start_time: body?.start_time ?? null,
          end_time: body?.end_time ?? null,
          highest_resolution: body?.highest_resolution ?? true,
          target_lang: body.target_lang,
          source_lang: body?.source_lang,
          num_speakers: body.num_speakers ?? 0,
        },
      }),
      invalidatesTags: [{ type: "Dub", id: "LIST" }],
    }),
    removeDubbedFile: builder.mutation({
      query: (videoId: string) => ({
        url: `/audios/dubbing/${videoId}`,
        method: HTTP_REQUEST.DELETE,
      }),
      invalidatesTags: [{ type: "Dub", id: "LIST" }],
    }),
    getMediaDubs: builder.query<IDubsList, string>({
      query: () => `/audios/dubbing/all`,
      providesTags: [{ type: "Dub", id: "LIST" }],
    }),
    getVoicesList: builder.query<IVoiceListResponse, string>({
      query: () => `/audios/voices`,
      providesTags: (result) =>
        result ? [{ type: "Voices", id: "LIST" }] : ["Voices"],
      extraOptions: {
        maxCacheDuration: 3600,
      },
    }),
    getSharedVoicesList: builder.query<ISharedVoiceListResponse, string>({
      query: () => `/audios/voices/shared`,
      providesTags: (result) =>
        result ? [{ type: "Voices", id: "LIST_SHARED" }] : ["Voices"],
    }),
    addSharedVoiceInLibrary: builder.mutation<
      IResponse,
      IAddSharedVoiceInLibrary
    >({
      query: (body: IAddSharedVoiceInLibrary) => ({
        url: `/audios/voices/add/${body.public_owner_id}/${
          body.voice_id
        }?name=${encodeURIComponent(body.name)}`,
        method: HTTP_REQUEST.POST,
      }),
      invalidatesTags: (result, error) =>
        result ? [{ type: "Voices", id: "LIST" }] : [],
    }),
    textToSpeech: builder.mutation<IResponse, TextToSpeechRequest>({
      query: (body: TextToSpeechRequest) => ({
        url: `/audios/text-to-speech`,
        method: HTTP_REQUEST.POST,
        body,
      }),
    }),
    instantVoiceClone: builder.mutation<IResponse, InstantVoiceCloneRequest>({
      query: (body: InstantVoiceCloneRequest) => ({
        url: `/audios/voices/add`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: (result, error) =>
        result ? [{ type: "Voices", id: "LIST" }] : [{ type: "Voices" }],
    }),
    getRandonVoiceGenerationParams: builder.query<
      IGenerateRandomVoiceParamResponse,
      string
    >({
      query: () => `/audios/voices/random/params`,
    }),
    generateRandomVoice: builder.mutation<
      IGenerateRandomVoiceResponse,
      IGenerateRandomVoiceRequest
    >({
      query: (body: IGenerateRandomVoiceRequest) => ({
        url: `/audios/voices/random`,
        method: HTTP_REQUEST.POST,
        body,
      }),
    }),
    saveRandomGeneratedVoice: builder.mutation<
      IResponse,
      ISaveRandomGeneratedVoiceRequest
    >({
      query: (body: ISaveRandomGeneratedVoiceRequest) => ({
        url: `/audios/voices/random/save`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: (result, error) =>
        result ? [{ type: "Voices", id: "LIST" }] : [{ type: "Voices" }],
    }),
    sendProfessionalVoiceCloneInquiry: builder.mutation({
      query: ({
        email,
        name,
        phone,
      }: {
        email: string;
        phone: string;
        name: string;
      }) => ({
        url: "/audios/voices/professional",
        method: HTTP_REQUEST.POST,
        body: {
          email,
          phone,
          name,
        },
      }),
    }),
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0,
});

export const {
  useUploadYTVideoToTLMutation,
  useUploadVideoFilesToTLMutation,
  useGetVideosQuery,
  useGetVideoByIdQuery,
  useGetAudiosQuery,
  useExtractShortContentMutation,
  useGenerateChaptersMutation,
  useUploadVideoFileMutation,
  useUploadVideoUrlMutation,
  useDubVideoFileMutation,
  useGetMediaDubsQuery,
  useRemoveDubbedFileMutation,
  useUploadAudioFileMutation,
  useGetVoicesListQuery,
  useGetSharedVoicesListQuery,
  useAddSharedVoiceInLibraryMutation,
  useLazyGetSharedVoicesListQuery,
  useTextToSpeechMutation,
  useInstantVoiceCloneMutation,
  useGetRandonVoiceGenerationParamsQuery,
  useGenerateRandomVoiceMutation,
  useSaveRandomGeneratedVoiceMutation,
  useSendProfessionalVoiceCloneInquiryMutation
} = mediaApi;
