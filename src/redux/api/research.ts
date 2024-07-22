import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { HTTP_REQUEST } from "@/constants/request";
import { IResearchListResponse } from "../interfaces/research";
import { IResponse } from "./auth";

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/research`;

export interface IResearchChat {
  prompt: string;
  id: string;
}

export const researchApi = createApi({
  reducerPath: "research",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.access_token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["LIST", "RESEARCH_BY_ID"],
  endpoints: (builder) => ({
    startResearch: builder.mutation<
      IResponse,
      {
        name: string;
        system_prompt?: string;
      }
    >({
      query: ({
        name,
        system_prompt,
      }: {
        name: string;
        system_prompt: string;
      }) => ({
        url: "/start",
        method: HTTP_REQUEST.POST,
        body: {
          name,
          system_prompt,
        },
      }),
    }),
    getResearchList: builder.query<IResearchListResponse, void>({
      query: () => "/list",
      providesTags: ["LIST"],
    }),
    getResearchById: builder.query<IResponse, string>({
      query: (id: string) => `/${id}`,
      providesTags: ["RESEARCH_BY_ID"],
    }),
    deleteResearchById: builder.mutation({
      query: (id: string) => ({
        url: `/${id}`,
        method: HTTP_REQUEST.DELETE,
      }),
    }),
    updateDocumentById: builder.mutation({
      query: ({
        id,
        body,
      }: {
        body: { document?: string; name?: string };
        id: string;
      }) => ({
        url: `/update-document/${id}`,
        method: HTTP_REQUEST.PATCH,
        body,
      }),
    }),
    searchMedia: builder.mutation({
      query: ({
        assistant_answer,
        prompt,
        chat_id,
        message_index,
        type = "image",
      }: {
        prompt: string;
        assistant_answer: string;
        message_index: number;
        chat_id: string;
        type: "image" | "video";
      }) => ({
        url: `/chat/media/search?type=${type}`,
        method: HTTP_REQUEST.POST,
        body: {
          prompt,
          assistant_answer,
          message_index,
          chat_id,
        },
      }),
    }),
    downloadResearch: builder.mutation({
      query: (id: string) => ({
        url: `/download/${id}`,
        method: HTTP_REQUEST.GET,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useStartResearchMutation,
  useGetResearchListQuery,
  useGetResearchByIdQuery,
  useDeleteResearchByIdMutation,
  useSearchMediaMutation,
  useUpdateDocumentByIdMutation,
  useDownloadResearchMutation,
} = researchApi;
