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
    verifyResetOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: `/auth/verify-reset-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
        method: 'POST',
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: `/auth/reset-password`,
        method: 'POST',
        body: { email, otp, newPassword },
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation,
  useVerifySignupMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation
} = authApi;
