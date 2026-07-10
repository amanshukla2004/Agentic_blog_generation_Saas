import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';
import type { BlogDraft } from './blogApi';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['AdminBlog', 'UserBlog', 'PublicBlog'],
  endpoints: (builder) => ({
    getAllBlogs: builder.query<BlogDraft[], void>({
      query: () => '/admin/blogs',
      providesTags: ['AdminBlog'],
    }),
    deleteAdminBlog: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminBlog'],
    }),
    publishBlog: builder.mutation<BlogDraft, { id: string; seoDescription: string; seoKeywords?: string; category?: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/blogs/${id}/publish`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminBlog', 'UserBlog', 'PublicBlog'],
    }),
  }),
});

export const { useGetAllBlogsQuery, useDeleteAdminBlogMutation, usePublishBlogMutation } = adminApi;
