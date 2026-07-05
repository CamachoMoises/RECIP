import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EmailHistoryState, emailHistory } from '../types/utilities';
import { axiosDeleteSlice, axiosGetSlice, axiosPostSlice } from "../services/axios";

const initialState: EmailHistoryState = {
    emailList: [],
    status: 'idle',
    error: null,
};

export const fetchEmailHistory = createAsyncThunk<emailHistory[], { user_id?: number }>(
    'email/fetchEmailHistory',
    async ({ user_id }, { rejectWithValue }) => {
        try {
            const params: { user_id?: number } = {};
            if (user_id !== undefined) params.user_id = user_id;
            const response = await axiosGetSlice('api/email_history', params);
            return response.data || response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createEmailHistory = createAsyncThunk<emailHistory, {
    user_id?: number;
    nombre_archivo: string;
    fecha: string;
    tipo?: string;
    descripcion: string;
    modulo: string;
}>(
    'email/createEmailHistory',
    async (data, { rejectWithValue }) => {
        try {
            const payload = {
                ...data,
                tipo: data.tipo || 'correo',
            };
            const response = await axiosPostSlice('api/email_history', payload);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteEmailHistory = createAsyncThunk<number, number>(
    'email/deleteEmailHistory',
    async (id, { rejectWithValue }) => {
        try {
            await axiosDeleteSlice(`api/email_history/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const emailSlice = createSlice({
    name: 'emailHistory',
    initialState,
    reducers: {
        clearEmailHistory: (state) => {
            state.emailList = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmailHistory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEmailHistory.fulfilled, (state, action: PayloadAction<emailHistory[]>) => {
                state.status = 'succeeded';
                state.emailList = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchEmailHistory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(createEmailHistory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createEmailHistory.fulfilled, (state, action: PayloadAction<emailHistory>) => {
                state.status = 'succeeded';
                if (!Array.isArray(state.emailList)) state.emailList = [];
                state.emailList.push(action.payload);
            })
            .addCase(createEmailHistory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(deleteEmailHistory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteEmailHistory.fulfilled, (state, action: PayloadAction<number>) => {
                state.status = 'succeeded';
                if (!Array.isArray(state.emailList)) state.emailList = [];
                state.emailList = state.emailList.filter(e => e.id !== action.payload);
            })
            .addCase(deleteEmailHistory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearEmailHistory } = emailSlice.actions;
export default emailSlice.reducer;
