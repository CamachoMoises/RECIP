import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { axiosGetDefault, axiosPostDefault, axiosPutDefault } from '../services/axios';
import { UserState, user } from '../types/utilidades';



const initialState: UserState = {
	status: 'idle',
	usersList: [],
	studentList: [],
	instructorList: [],
	error: null, // Inicializar como null
};

// Acción asíncrona para obtener los usuarios
export const fetchUsers = createAsyncThunk<user[]>(
	'user/fetchUsers',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosGetDefault('api/users');
			return response.resp;
		} catch (error: any) {
			return rejectWithValue(error.response.data);
		}
	}
);


export const fetchStudents = createAsyncThunk<user[]>(
	'user/fetchStudents',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosGetDefault('api/users/student');
			return response.resp;
		} catch (error: any) {
			return rejectWithValue(error.response.data);
		}
	}
);
export const fetchInstructors = createAsyncThunk<user[]>(
	'user/fetchInstructors',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosGetDefault('api/users/instructor');
			return response.resp;
		} catch (error: any) {
			return rejectWithValue(error.response.data);
		}
	}
);


// Acción para crear un usuario
export const createUser = createAsyncThunk<user, user>(
	'user/createUser',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosPostDefault('api/users', userData);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response.data);
		}
	}
);

// 
export const updateUser = createAsyncThunk<user, user>(
	'user/updateUser',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosPutDefault(`api/users`, userData);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response.data);
		}
	}
);

export const userStudent = createAsyncThunk<user, number>(
	'user/userStudent',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosPostDefault(`api/users/student`, { user_id: userData });
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response.data);
		}
	}
);

export const userInstructor = createAsyncThunk<user, number>(
	'user/userInstructor',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosPostDefault(`api/users/instructor`, { user_id: userData });
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response.data);
		}
	}
);

const userSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			// Reducers para la acción fetchUsers
			.addCase(fetchUsers.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<user[]>) => {
				state.status = 'succeeded';
				state.usersList = action.payload;
			})
			.addCase(fetchUsers.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})
			// Reducers para la acción fetchStudents
			.addCase(fetchStudents.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchStudents.fulfilled, (state, action: PayloadAction<user[]>) => {
				state.status = 'succeeded';
				state.studentList = action.payload;
			})
			.addCase(fetchStudents.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})

			// Reducers para la acción fetchInstructors
			.addCase(fetchInstructors.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchInstructors.fulfilled, (state, action: PayloadAction<user[]>) => {
				state.status = 'succeeded';
				state.instructorList = action.payload;
			})
			.addCase(fetchInstructors.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})
			// Reducers para la acción createUser
			.addCase(createUser.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(createUser.fulfilled, (state, action: PayloadAction<user>) => {
				state.status = 'succeeded';
				state.usersList.push(action.payload);
			})
			.addCase(createUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})

			// Reducers para la acción updateUser
			.addCase(updateUser.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(updateUser.fulfilled, (state, action: PayloadAction<user>) => {
				state.status = 'succeeded';
				const index = state.usersList.findIndex((user) => user.id === action.payload.id);
				if (index !== -1) {
					state.usersList[index] = action.payload;
				}
			})
			.addCase(updateUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})

			// Reducers para la acción userStudent
			.addCase(userStudent.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(userStudent.fulfilled, (state, action: PayloadAction<user>) => {
				state.status = 'succeeded';
				const index = state.usersList.findIndex((user) => user.id === action.payload.id);
				if (index !== -1) {
					state.usersList[index] = action.payload;
				}
			})
			.addCase(userStudent.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})

			// Reducers para la acción userInstructor
			.addCase(userInstructor.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(userInstructor.fulfilled, (state, action: PayloadAction<user>) => {
				state.status = 'succeeded';
				const index = state.usersList.findIndex((user) => user.id === action.payload.id);
				if (index !== -1) {
					state.usersList[index] = action.payload;
				}
			})
			.addCase(userInstructor.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			});
	},
});

export default userSlice.reducer;
