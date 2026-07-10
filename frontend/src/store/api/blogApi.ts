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
  tags: string[];
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
    getPublicBlogs: builder.query<PageResponse<PublicBlogSummary>, { page?: number; size?: number }>({
      query: (params) => ({
        url: '/public/blogs',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getTrendingBlogs: builder.query<PageResponse<PublicBlogSummary>, { page?: number; size?: number }>({
      query: (params) => ({
        url: '/public/blogs/trending',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getPlatformStats: builder.query<PlatformStats, void>({
      query: () => '/public/blogs/stats',
      providesTags: ['Blog'],
    }),
    getBlogBySlug: builder.query<BlogDraft, string>({
      query: (slug) => `/public/blogs/${slug}`,
    }),
    getUserBlogs: builder.query<BlogDraft[], void>({
      query: () => '/blogs',
      providesTags: ['Blog'],
    }),
    updateBlog: builder.mutation<BlogDraft, { id: string; rawMarkdown: string }>({
      query: ({ id, rawMarkdown }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: { rawMarkdown },
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
        method: isBookmarked ? 'DELETE' : 'POST',
      }),
      invalidatesTags: ['Bookmark'],
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
  useGetPlatformStatsQuery,
  useGetBlogBySlugQuery, 
  useGetUserBlogsQuery,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useToggleBookmarkMutation,
  useGetMyBookmarksQuery,
  useGetMyBookmarkedBlogIdsQuery,
} = blogApi;
