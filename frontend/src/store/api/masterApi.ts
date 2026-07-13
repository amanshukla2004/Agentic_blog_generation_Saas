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

export interface StatsTrends {
  users: number[];
  blogs: number[];
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
  status: 'DRAFT' | 'PUBLISHED' | 'GENERATING' | 'FAILED' | 'IN_REVIEW' | 'REJECTED';
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

export interface PaginatedUsers {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export const masterApi = createApi({
  reducerPath: 'masterApi',
  baseQuery: baseQuery,
  tagTypes: ['User', 'SystemErrorLog', 'SystemPrompt', 'AuthorStat', 'Blog', 'SystemSetting'],
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsers, { page?: number; size?: number; search?: string } | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          if (args.page !== undefined) params.append('page', args.page.toString());
          if (args.size !== undefined) params.append('size', args.size.toString());
          if (args.search) params.append('search', args.search);
        }
        return `/master/users?${params.toString()}`;
      },
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
    getAllBlogs: builder.query<PaginatedBlogs, { page: number; size: number; search?: string }>({
      query: ({ page, size, search = '' }) => 
        `/admin/blogs/all-paginated?page=${page}&size=${size}&search=${encodeURIComponent(search)}`,
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
    bulkDeleteBlogs: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: `/admin/blogs/bulk-delete`,
        method: 'POST',
        body: ids,
      }),
      invalidatesTags: ['Blog', 'AuthorStat'],
    }),
    bulkApproveBlogs: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: `/admin/blogs/bulk-approve`,
        method: 'PUT',
        body: ids,
      }),
      invalidatesTags: ['Blog', 'AuthorStat'],
    }),
    getSystemStats: builder.query<SystemStats, void>({
      query: () => '/master/stats',
    }),
    getStatsTrends: builder.query<StatsTrends, void>({
      query: () => '/master/stats/trends',
    }),
    getAiHealth: builder.query<AiHealth, void>({
      query: () => '/master/ai-health',
    }),
    getReviewRequests: builder.query<AdminBlogSummary[], void>({
      query: () => '/master/blogs/reviews',
      providesTags: ['Blog'],
    }),
    acceptReview: builder.mutation<AdminBlogSummary, string>({
      query: (id) => ({
        url: `/master/blogs/${id}/accept-review`,
        method: 'PUT',
      }),
      invalidatesTags: ['Blog', 'AuthorStat'],
    }),
    rejectReview: builder.mutation<AdminBlogSummary, string>({
      query: (id) => ({
        url: `/master/blogs/${id}/reject-review`,
        method: 'PUT',
      }),
      invalidatesTags: ['Blog'],
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
  useBulkDeleteBlogsMutation,
  useBulkApproveBlogsMutation,
  useGetSystemSettingsQuery,
  useUpdateSettingMutation,
  useGetSystemStatsQuery,
  useGetStatsTrendsQuery,
  useGetAiHealthQuery,
  useGetReviewRequestsQuery,
  useAcceptReviewMutation,
  useRejectReviewMutation,
} = masterApi;
