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

export interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string;
}

export interface AuthorStat {
  userId: string;
  email: string;
  username: string;
  totalBlogs: number;
  totalViews: number;
}

export interface SystemStats {
  totalUsers: number;
  totalBlogs: number;
  totalGenerations: number;
}

export interface AiHealth {
  status: string;
  service: string;
  message?: string;
}

export interface AdminBlogSummary {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'GENERATING' | 'FAILED';
  createdAt: string;
  authorEmail: string;
  isStaffPick: boolean;
  viewCount: number;
}

export interface PaginatedBlogs {
  content: AdminBlogSummary[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export const masterApi = createApi({
  reducerPath: 'masterApi',
  baseQuery: baseQuery,
  tagTypes: ['User', 'SystemErrorLog', 'SystemPrompt', 'AuthorStat', 'Blog', 'SystemSetting'],
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
    getSystemSettings: builder.query<SystemSetting[], void>({
      query: () => '/master/settings',
      providesTags: ['SystemSetting'],
    }),
    updateSetting: builder.mutation<SystemSetting, { key: string; settingValue: string }>({
      query: ({ key, settingValue }) => ({
        url: `/master/settings/${key}`,
        method: 'PUT',
        body: { settingValue },
      }),
      invalidatesTags: ['SystemSetting'],
    }),
    getAuthorsStats: builder.query<AuthorStat[], void>({
      query: () => '/master/authors/stats',
      providesTags: ['AuthorStat'],
    }),
    getAllBlogs: builder.query<PaginatedBlogs, { page: number; size: number }>({
      query: ({ page, size }) => `/admin/blogs/all-paginated?page=${page}&size=${size}`,
      providesTags: ['Blog'],
    }),
    toggleStaffPick: builder.mutation<void, { id: string; isStaffPick: boolean }>({
      query: ({ id, isStaffPick }) => ({
        url: `/admin/blogs/${id}/staff-pick`,
        method: 'PUT',
        body: { isStaffPick },
      }),
      invalidatesTags: ['Blog'],
    }),
    deleteBlog: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog', 'AuthorStat'],
    }),
    getSystemStats: builder.query<SystemStats, void>({
      query: () => '/master/stats',
    }),
    getAiHealth: builder.query<AiHealth, void>({
      query: () => '/master/ai-health',
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
  useGetAllBlogsQuery,
  useToggleStaffPickMutation,
  useDeleteBlogMutation,
  useGetSystemSettingsQuery,
  useUpdateSettingMutation,
  useGetSystemStatsQuery,
  useGetAiHealthQuery,
} = masterApi;
