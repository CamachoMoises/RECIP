import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { subject, subjectState } from "../types/utilidades";
import { axiosGetDefault } from "../services/axios";

const initialState: subjectState = {
    status: 'idle',
    subjectList: [],
    lastCreatedId: null, //
    error: null, // Inicializar como null
};

export const fetchCourses = createAsyncThunk<subject[]>(
    'user/fetchCourses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault('api/subjects');
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

const subjectSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        setLastCreatedId: (state, action: PayloadAction<number | null>) => {
            state.lastCreatedId = action.payload;
        },
    },
})

export default subjectSlice.reducer;

