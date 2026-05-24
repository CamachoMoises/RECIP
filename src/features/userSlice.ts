import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { axiosGetSlice, axiosPostSlice, axiosPutSlice } from '../services/axios';
import { StatusParam, UserState, user, suggestion } from '../types/utilities';



const initialState: UserState = {
	status: 'idle',
	userLogged: null,
	userSelected: null,
	usersList: [],
	studentList: [],
	instructorList: [],
	suggestionList: [],
	suggestionSelected: null,
	error: null,
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

export const disableRole = createAsyncThunk<void, { user_id: number; role: string }>(
	'user/disableRole',
	async ({ user_id, role }, { rejectWithValue }) => {
		try {
			await axiosPutSlice('api/users/disable-role', { user_id, role });
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

export const fetchSuggestions = createAsyncThunk<suggestion[]>(
	'user/fetchSuggestions',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosGetSlice('api/suggestions');
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchSuggestion = createAsyncThunk<suggestion, number>(
	'user/fetchSuggestion',
	async (id, { rejectWithValue }) => {
		try {
			const response = await axiosGetSlice(`api/suggestions/${id}`);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchSuggestionsByUser = createAsyncThunk<suggestion[], number>(
	'user/fetchSuggestionsByUser',
	async (user_id, { rejectWithValue }) => {
		try {
			const response = await axiosGetSlice(`api/suggestions/user/${user_id}`);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const createSuggestion = createAsyncThunk<suggestion, { user_id: number; title: string; description: string }>(
	'user/createSuggestion',
	async (suggestionData, { rejectWithValue }) => {
		try {
			const response = await axiosPostSlice('api/suggestions', suggestionData);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateSuggestion = createAsyncThunk<suggestion, { id: number; user_id: number; title: string; description: string }>(
	'user/updateSuggestion',
	async (suggestionData, { rejectWithValue }) => {
		try {
			const response = await axiosPutSlice('api/suggestions', suggestionData);
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
			})

			// Reducers para suggestions
			.addCase(fetchSuggestions.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchSuggestions.fulfilled, (state, action: PayloadAction<suggestion[]>) => {
				state.status = 'succeeded';
				state.suggestionList = action.payload;
			})
			.addCase(fetchSuggestions.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})
			.addCase(fetchSuggestion.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchSuggestion.fulfilled, (state, action: PayloadAction<suggestion>) => {
				state.status = 'succeeded';
				state.suggestionSelected = action.payload;
			})
			.addCase(fetchSuggestion.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})
			.addCase(fetchSuggestionsByUser.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchSuggestionsByUser.fulfilled, (state, action: PayloadAction<suggestion[]>) => {
				state.status = 'succeeded';
				state.suggestionList = action.payload;
			})
			.addCase(fetchSuggestionsByUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})
			.addCase(createSuggestion.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(createSuggestion.fulfilled, (state, action: PayloadAction<suggestion>) => {
				state.status = 'succeeded';
				state.suggestionList.push(action.payload);
			})
			.addCase(createSuggestion.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})
			.addCase(updateSuggestion.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(updateSuggestion.fulfilled, (state, action: PayloadAction<suggestion>) => {
				state.status = 'succeeded';
				const index = state.suggestionList.findIndex((s) => s.id === action.payload.id);
				if (index !== -1) {
					state.suggestionList[index] = action.payload;
				}
			})
			.addCase(updateSuggestion.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			});
	},
});

export default userSlice.reducer;
