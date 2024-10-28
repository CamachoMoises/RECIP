import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import userReducer from './features/userSlice';
import courseSlice from './features/courseSlice';

const store = configureStore({
	reducer: {
		counter: counterReducer,
		users: userReducer,
		courses: courseSlice,
	},
});
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
