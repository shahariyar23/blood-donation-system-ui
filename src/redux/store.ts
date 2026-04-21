import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import userReducer from "./slices/userSlice";
import donorReducer from "./slices/donorSlice";
import hospitalReducer from "./slices/hospitalSlice";

//  Persist config
const persistConfig = {
  key: "user",
  version: 1,
  storage,
  blacklist: ["token", "isLoading"],
};

//  Wrap reducer
const persistedReducer = persistReducer(persistConfig, userReducer);

const hospitalPersistConfig = {
  key: "hospital",
  version: 1,
  storage,
  blacklist: ["token", "isLoading"],
};

const persistedHospitalReducer = persistReducer(
  hospitalPersistConfig,
  hospitalReducer
);

// 🔥 Store
export const store = configureStore({
  reducer: {
    user: persistedReducer,
    hospital: persistedHospitalReducer,
    donors: donorReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;