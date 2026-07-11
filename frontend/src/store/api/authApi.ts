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
    verifySignup: builder.mutation({
      query: ({ email, otp }) => ({
        url: `/auth/verify-signup?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: `/auth/forgot-password?email=${encodeURIComponent(email)}`,
        method: 'POST',
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: `/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`,
        method: 'POST',
      }),
    }),
    login2fa: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login2fa',
        method: 'POST',
        body: credentials,
      }),
    }),
    generate2fa: builder.mutation<{qrCodeUri: string}, string>({
      query: (email) => ({
        url: `/auth/2fa/generate?email=${encodeURIComponent(email)}`,
        method: 'POST',
      }),
    }),
    enable2fa: builder.mutation<void, { email: string, code: string }>({
      query: (body) => ({
        url: '/auth/2fa/enable',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation,
  useVerifySignupMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogin2faMutation,
  useGenerate2faMutation,
  useEnable2faMutation
} = authApi;
