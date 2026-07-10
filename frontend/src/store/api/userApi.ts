import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  bio: string | null;
  generationsCount: number;
  subscriptionTier: string;
  role: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQuery,
  tagTypes: ['UserProfile'],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/profile',
      providesTags: ['UserProfile'],
    }),
    updateProfile: builder.mutation<UserProfile, { username?: string; bio?: string }>({
      query: (body) => ({
        url: '/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
} = userApi;
