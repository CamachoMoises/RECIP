import { configureStore } from '@reduxjs/toolkit';
import authSlice from './features/authSlice.ts';
import assessmentSlice from './features/assessmentSlice.ts';
import counterReducer from './features/counter/counterSlice';
import userReducer from './features/userSlice';
import courseSlice from './features/courseSlice';
import subjectSlice from './features/subjectSlice';
import testSlice from './features/testSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
	key: 'root',
	storage,
	// whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, authSlice);
const store = configureStore({
	reducer: {
		auth: persistedReducer,
		counter: counterReducer,
		assessment: assessmentSlice,
		users: userReducer,
		courses: courseSlice,
		subjects: subjectSlice,
		tests: testSlice,
	},
});
const persistor = persistStore(store);
export { store, persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
