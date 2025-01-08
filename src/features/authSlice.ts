import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authState, credentials } from "../types/utilities";
import { axiosPostDefault } from "../services/axios";


const initialState: authState = {
    status: 'idle',
    token: null,
    error: null,
    user: null
};
export const loginUser = createAsyncThunk<credentials, credentials>('auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosPostDefault('auth/', credentials);
            console.log(response);

            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    });


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.status = 'idle';
            state.token = null;
            state.error = null;
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Add reducers for other actions here
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<credentials>) => {
                state.status = 'succeeded';
                console.log(action.payload);

                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
    },
})


export const { logout } = authSlice.actions;
export default authSlice.reducer;