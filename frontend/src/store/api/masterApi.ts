import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export interface User {
  id: string;
  email: string;
  generationsCount: number;
  subscriptionTier: 'FREE' | 'PRO';
  isActive: boolean;
  role: 'USER' | 'ADMIN' | 'MASTER_ADMIN';
}

export interface SystemErrorLog {
  id: number;
  endpoint: string;
  errorMessage: string;
  createdAt: string;
}

export interface SystemPrompt {
  id: number;
  promptName: string;
  promptText: string;
  updatedAt: string;
}

export interface AuthorStat {
  userId: string;
  email: string;
  username: string;
  totalBlogs: number;
  totalViews: number;
}

export const masterApi = createApi({
  reducerPath: 'masterApi',
  baseQuery: baseQuery,
  tagTypes: ['User', 'SystemErrorLog', 'SystemPrompt', 'AuthorStat'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/master/users',
      providesTags: ['User'],
    }),
    resetUserQuota: builder.mutation<User, string>({
      query: (id) => ({
        url: `/master/users/${id}/reset-quota`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    toggleUserActive: builder.mutation<void, string>({
      query: (id) => ({
        url: `/master/users/${id}/toggle-active`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    toggleUserAdmin: builder.mutation<void, string>({
      query: (id) => ({
        url: `/master/users/${id}/toggle-admin`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    getSystemErrors: builder.query<SystemErrorLog[], void>({
      query: () => '/master/errors',
      providesTags: ['SystemErrorLog'],
    }),
    getPrompts: builder.query<SystemPrompt[], void>({
      query: () => '/master/prompts',
      providesTags: ['SystemPrompt'],
    }),
    updatePrompt: builder.mutation<SystemPrompt, { name: string; promptText: string }>({
      query: ({ name, promptText }) => ({
        url: `/master/prompts/${name}`,
        method: 'PUT',
        body: { promptText },
      }),
      invalidatesTags: ['SystemPrompt'],
    }),
    getAuthorsStats: builder.query<AuthorStat[], void>({
      query: () => '/master/authors/stats',
      providesTags: ['AuthorStat'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useResetUserQuotaMutation,
  useToggleUserActiveMutation,
  useToggleUserAdminMutation,
  useGetSystemErrorsQuery,
  useGetPromptsQuery,
  useUpdatePromptMutation,
  useGetAuthorsStatsQuery,
} = masterApi;
