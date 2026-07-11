import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login2fa: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login/2fa',
        method: 'POST',
        body: credentials,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: `/auth/forgot-password?email=${encodeURIComponent(email)}`,
        method: 'POST',
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: `/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`,
        method: 'POST',
      }),
    }),
    generate2fa: builder.mutation({
      query: (email) => ({
        url: `/auth/2fa/generate?email=${encodeURIComponent(email)}`,
        method: 'POST',
      }),
    }),
    enable2fa: builder.mutation({
      query: ({ email, code }) => ({
        url: `/auth/2fa/enable?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
        method: 'POST',
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation,
  useLogin2faMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGenerate2faMutation,
  useEnable2faMutation
} = authApi;
