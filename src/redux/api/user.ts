import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const userUrl = `${process.env.NEXT_PUBLIC_API_URL}/user`;

export const userApi = createApi({
  reducerPath: "user",
  baseQuery: fetchBaseQuery({
    baseUrl: userUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.access_token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({}),
});

export const {} = userApi;
