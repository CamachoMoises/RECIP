import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { axiosGetDefault, axiosPostDefault, axiosPutDefault } from '../services/axios';
import { UserState, user } from '../types/utilidades';



const initialState: UserState = {
	status: 'idle',
	usersList: [],
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
			});



	},
});

export default userSlice.reducer;