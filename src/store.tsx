import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import userReducer from './features/userSlice';
import courseSlice from './features/courseSlice';
import subjectSlice from './features/subjectSlice';
import testSlice from './features/testSlice';

const store = configureStore({
	reducer: {
		counter: counterReducer,
		users: userReducer,
		courses: courseSlice,
		subjects: subjectSlice,
		tests: testSlice,
	},
});
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
