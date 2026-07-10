import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';
import { blogApi, BlogDraft } from './blogApi';
import { systemLog } from '../../utils/logger';

export const generationApi = createApi({
  reducerPath: 'generationApi',
  baseQuery,
  endpoints: (builder) => ({
    generateMultimodal: builder.mutation<BlogDraft, FormData>({
      query: (formData) => ({
        url: '/gateway/generate-multimodal',
        method: 'POST',
        body: formData,
        // RTK Query automatically sets Content-Type to undefined for FormData,
        // allowing the browser to set it with the correct boundary
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        systemLog('generationApi.ts', 'generateMultimodal', 'Initiating blog generation request to gateway');
        try {
          await queryFulfilled;
          dispatch(blogApi.util.invalidateTags(['Blog']));
          systemLog('generationApi.ts', 'generateMultimodal', 'Blog generation request completed successfully');
        } catch (error) {
          systemLog('generationApi.ts', 'generateMultimodal', 'Blog generation request failed');
        }
      },
    }),
  }),
});

export const { useGenerateMultimodalMutation } = generationApi;
