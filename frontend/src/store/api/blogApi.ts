import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export interface PublicBlogSummary {
  id: string;
  topic: string;
  title: string;
  slug: string;
  seoDescription: string;
  createdAt: string;
  authorEmail: string;
  authorUsername?: string;
  viewCount: number;
  tags: string[];
  isStaffPick?: boolean;
}

export interface BlogDraft {
  id: string;
  topic: string;
  title: string;
  slug: string;
  rawMarkdown: string;
  seoDescription: string;
  status: string;
  createdAt: string;
  authorEmail: string;
  authorUsername?: string;
  viewCount: number;
  likesCount?: number;
  tags: string[];
  category?: string;
  seoKeywords?: string;
  coverImage?: string;
  isStaffPick?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface PlatformStats {
  activeUsers: number;
  publishedBlogs: number;
}

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery,
  tagTypes: ['Blog', 'Bookmark'],
  endpoints: (builder) => ({
    getPublicBlogs: builder.query<PageResponse<PublicBlogSummary>, { page?: number; size?: number; category?: string | null }>({
      query: (params) => ({
        url: '/public/blogs',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getTrendingBlogs: builder.query<PageResponse<PublicBlogSummary>, { page?: number; size?: number; category?: string | null }>({
      query: (params) => ({
        url: '/public/blogs/trending',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getTopBlogs: builder.query<PageResponse<PublicBlogSummary>, { page?: number; size?: number; category?: string | null }>({
      query: (params) => ({
        url: '/public/blogs/top',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getStaffPicks: builder.query<PageResponse<PublicBlogSummary>, { page?: number; size?: number }>({
      query: (params) => ({
        url: '/public/blogs/staff-picks',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getPlatformStats: builder.query<PlatformStats, void>({
      query: () => '/public/blogs/stats',
      providesTags: ['Blog'],
    }),
    getTopAuthors: builder.query<any[], void>({
      query: () => '/public/authors/top',
    }),
    getAuthorProfile: builder.query<any, string>({
      query: (username) => `/public/authors/${username}`,
    }),
    getBlogBySlug: builder.query<BlogDraft, string>({
      query: (slug) => `/public/blogs/${slug}`,
    }),
    getUserBlogs: builder.query<BlogDraft[], void>({
      query: () => '/blogs',
      providesTags: ['Blog'],
    }),
    updateBlog: builder.mutation<BlogDraft, { id: string; rawMarkdown?: string; title?: string }>({
      query: ({ id, ...body }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Blog'],
    }),
    reviseBlog: builder.mutation<BlogDraft, { id: string; instruction: string }>({
      query: ({ id, instruction }) => ({
        url: `/blogs/${id}/revise`,
        method: 'POST',
        body: { instruction },
      }),
      invalidatesTags: ['Blog'],
    }),
    publishMyBlog: builder.mutation<BlogDraft, { id: string; seoDescription?: string; seoKeywords?: string; category?: string }>({
      query: ({ id, ...body }) => ({
        url: `/blogs/${id}/publish`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Blog'],
    }),
    requestReview: builder.mutation<BlogDraft, { id: string; seoDescription: string; seoKeywords?: string; category: string }>({
      query: ({ id, ...body }) => ({
        url: `/blogs/${id}/request-review`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Blog'],
    }),
    deleteBlog: builder.mutation<void, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
    }),
    toggleBookmark: builder.mutation<void, { blogId: string; isBookmarked: boolean }>({
      query: ({ blogId, isBookmarked }) => ({
        url: `/bookmarks/${blogId}`,
        method: isBookmarked ? 'POST' : 'DELETE',
      }),
      invalidatesTags: ['Bookmark'],
    }),
    toggleStaffPick: builder.mutation<void, { id: string; isStaffPick: boolean }>({
      query: ({ id, isStaffPick }) => ({
        url: `/admin/blogs/${id}/staff-pick`,
        method: 'PUT',
        body: { isStaffPick },
      }),
      invalidatesTags: ['Blog'],
    }),
    getMyBookmarks: builder.query<PageResponse<PublicBlogSummary>, { page?: number; size?: number }>({
      query: (params) => ({
        url: '/bookmarks',
        params,
      }),
      providesTags: ['Bookmark'],
    }),
    getMyBookmarkedBlogIds: builder.query<string[], void>({
      query: () => '/bookmarks/ids',
      providesTags: ['Bookmark'],
    }),
  }),
});

export const { 
  useGetPublicBlogsQuery, 
  useGetTrendingBlogsQuery,
  useGetTopBlogsQuery,
  useGetStaffPicksQuery,
  useGetPlatformStatsQuery,
  useGetTopAuthorsQuery,
  useGetAuthorProfileQuery,
  useGetBlogBySlugQuery, 
  useGetUserBlogsQuery,
  useUpdateBlogMutation,
  usePublishMyBlogMutation,
  useRequestReviewMutation,
  useReviseBlogMutation,
  useDeleteBlogMutation,
  useToggleBookmarkMutation,
  useToggleStaffPickMutation,
  useGetMyBookmarksQuery,
  useGetMyBookmarkedBlogIdsQuery,
} = blogApi;
