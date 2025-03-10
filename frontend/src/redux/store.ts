import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Aquí puedes agregar más reducers según sea necesario
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora acciones no serializables como promesas
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled', 'auth/refreshToken/fulfilled']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
