import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { axiosGetSlice, axiosPostSlice, axiosPutSlice } from '../services/axios';
import { StatusParam, UserState, user } from '../types/utilities';



const initialState: UserState = {
	status: 'idle',
	userLogged: null,
	userSelected: null,
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
			const response = await axiosGetSlice('api/users');
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);
// Nuevo thunk para obtener el usuario logueado
export const fetchCurrentUser = createAsyncThunk<user>(
	"user/fetchCurrentUser",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosGetSlice('api/users/me');
			return response;

		} catch (error: any) {
			return rejectWithValue(error.response?.data || "Error al obtener usuario");
		}
	}
);
export const fetchUser = createAsyncThunk<user, number>(
	'user/fetchUser',
	async (user_id, { rejectWithValue }) => {
		try {
			const response = await axiosGetSlice(`api/users/user/${user_id}`);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchStudents = createAsyncThunk<user[], StatusParam | undefined>(
	'user/fetchStudents',
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await axiosGetSlice(`api/users/student`, params);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);
export const fetchInstructors = createAsyncThunk<user[], StatusParam | undefined>(
	'user/fetchInstructors',
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await axiosGetSlice(`api/users/instructor`, params);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Acción para crear un usuario
export const createUser = createAsyncThunk<user, user>(
	'user/createUser',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosPostSlice('api/users', userData);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// 
export const updateUser = createAsyncThunk<user, user>(
	'user/updateUser',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosPutSlice(`api/users`, userData);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const userStudent = createAsyncThunk<user, number>(
	'user/userStudent',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosPostSlice(`api/users/student`, { user_id: userData });
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const userInstructor = createAsyncThunk<user, number>(
	'user/userInstructor',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosPostSlice(`api/users/instructor`, { user_id: userData });
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
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
			// Reducers para la acción fetchUsers
			.addCase(fetchCurrentUser.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<user>) => {
				state.status = 'succeeded';
				state.userLogged = action.payload;
			})
			.addCase(fetchCurrentUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})
			// Reducers para la acción fetchUsers
			.addCase(fetchUser.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchUser.fulfilled, (state, action: PayloadAction<user>) => {
				state.status = 'succeeded';
				state.userSelected = action.payload;
			})
			.addCase(fetchUser.rejected, (state, action) => {
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
