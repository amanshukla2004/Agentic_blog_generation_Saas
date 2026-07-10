import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { systemLog } from '../../utils/logger';

export const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      systemLog('baseApi.ts', 'prepareHeaders', 'Injecting JWT authentication token into request headers');
      headers.set('authorization', `Bearer ${token}`);
    } else {
      systemLog('baseApi.ts', 'prepareHeaders', 'No JWT token found, proceeding with unauthenticated request');
    }
    return headers;
  },
});
