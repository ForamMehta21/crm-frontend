import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyTypeReducer from './slices/propertyTypeSlice';
import propertyConditionReducer from './slices/propertyConditionSlice';
import landmarkReducer from './slices/landmarkSlice';
import leadReducer from './slices/leadSlice';
import leadImportExportReducer from './slices/leadImportExportSlice';
import builderReducer from './slices/builderSlice';
import investorReducer from './slices/investorSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    propertyTypes: propertyTypeReducer,
    propertyConditions: propertyConditionReducer,
    landmarks: landmarkReducer,
    leads: leadReducer,
    leadImportExport: leadImportExportReducer,
    builders: builderReducer,
    investors: investorReducer,
  },
});

export default store;
