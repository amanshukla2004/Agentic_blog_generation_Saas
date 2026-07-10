import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { blogApi } from './api/blogApi';
import { generationApi } from './api/generationApi';
import { masterApi } from './api/masterApi';
import { adminApi } from './api/adminApi';
import { userApi } from './api/userApi';
import { publicApi } from './api/publicApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [blogApi.reducerPath]: blogApi.reducer,
    [generationApi.reducerPath]: generationApi.reducer,
    [masterApi.reducerPath]: masterApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      blogApi.middleware,
      generationApi.middleware,
      masterApi.middleware,
      adminApi.middleware,
      userApi.middleware,
      publicApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
