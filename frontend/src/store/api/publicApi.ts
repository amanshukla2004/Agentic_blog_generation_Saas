import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseApi';

export interface PublicSettings {
  maintenanceMode?: string;
  systemAnnouncementText?: string;
}

export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery,
  tagTypes: ['Settings'],
  endpoints: (builder) => ({
    getPublicSettings: builder.query<PublicSettings, void>({
      query: () => '/public/settings',
      providesTags: ['Settings'],
    }),
  }),
});

export const { useGetPublicSettingsQuery } = publicApi;
