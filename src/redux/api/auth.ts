import { HTTP_REQUEST } from "@/constants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

export interface IResponse {
  message: string;
  data: any;
  success: boolean;
}

interface ILoginRequest {
  email: string;
  password: string;
}

interface ISignUpRequest {
  name: string;
  email: string;
  password: string;
}

interface IVerifyUser {
  userId: string;
  otp: number;
}

export const authApi = createApi({
  reducerPath: "video",
  baseQuery: fetchBaseQuery({ baseUrl: authUrl }),
  endpoints: (builder) => ({
    loginUser: builder.mutation<IResponse, ILoginRequest>({
      query: ({ email, password }: ILoginRequest) => ({
        url: "/signin",
        method: HTTP_REQUEST.POST,
        body: {
          email,
          password,
        },
      }),
    }),
    signUpUser: builder.mutation<IResponse, ISignUpRequest>({
      query: ({ name, email, password }: ISignUpRequest) => ({
        url: "/signup",
        method: HTTP_REQUEST.POST,
        body: {
          name,
          email,
          password,
        },
      }),
    }),
    verifyUser: builder.mutation<IResponse, IVerifyUser>({
      query: ({ userId, otp }: IVerifyUser) => ({
        url: `/verify-otp/${userId}?otp=${otp}`,
        method: HTTP_REQUEST.GET,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useSignUpUserMutation,
  useVerifyUserMutation,
} = authApi;
