import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyTypeReducer from './slices/propertyTypeSlice';
import propertyConditionReducer from './slices/propertyConditionSlice';
import landmarkReducer from './slices/landmarkSlice';
import leadReducer from './slices/leadSlice';
import leadImportExportReducer from './slices/leadImportExportSlice';
import builderReducer from './slices/builderSlice';
import investorReducer from './slices/investorSlice';
import userReducer from './slices/userSlice';
import whatsappReducer from './slices/whatsappSlice';
import { setStore } from './storeAccessor';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  propertyTypes: propertyTypeReducer,
  propertyConditions: propertyConditionReducer,
  landmarks: landmarkReducer,
  leads: leadReducer,
  leadImportExport: leadImportExportReducer,
  builders: builderReducer,
  investors: investorReducer,
  users: userReducer,
  whatsapp: whatsappReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
setStore(store);
export default store;
