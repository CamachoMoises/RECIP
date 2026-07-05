import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './features/authSlice.ts';
import assessmentSlice from './features/assessmentSlice.ts';
import counterReducer from './features/counter/counterSlice';
import userReducer from './features/userSlice';
import courseSlice from './features/courseSlice';
import subjectSlice from './features/subjectSlice';
import testSlice from './features/testSlice';
import themeReducer from './features/themeSlice';
import attendanceSlice from './features/attendanceSlice';
import courseGroupReducer from './features/courseGroupSlice';
import emailReducer from './features/emailSlice';

const persistConfig = {
	key: 'root',
	storage,
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
		theme: themeReducer,
		attendance: attendanceSlice,
		courseGroups: courseGroupReducer,
		emailHistory: emailReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

const persistor = persistStore(store);
export { store, persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;