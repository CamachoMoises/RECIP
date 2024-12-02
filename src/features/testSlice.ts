import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { answer, question, test, testState } from '../types/utilities';
import { axiosGetDefault } from "../services/axios";


const initialState: testState = {
    status: 'idle',
    testList: [],
    testSelected: null,
    questionList: [],
    questionSelected: null,
    answerList: [],
    courseStudentTestList: [],
    courseStudentTestSelected: null,
    courseStudentTestQuestionList: [],
    courseStudentTestQuestionSelected: null,
    lastCreatedId: null,
    error: null,
};

export const fetchTest = createAsyncThunk<test[], number>(
    'user/fetchTest',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/test/tests/${id}`);
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchQuestions = createAsyncThunk<question[], number>(
    'user/fetchQuestions',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/test/questions/${id}`);
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
export const fetchAnswers = createAsyncThunk<answer[], number>(
    'user/fetchAnswers',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/test/answers/${id}`);
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

const testSlice = createSlice({
    name: 'subject',
    initialState,
    reducers: {
        setLastCreatedId: (state, action: PayloadAction<number | null>) => {
            state.lastCreatedId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Reducers para la acción fetchTest
            .addCase(fetchTest.pending, (state) => {
                state.status = 'loading';
            }).addCase(fetchTest.fulfilled, (state, action: PayloadAction<test[]>) => {
                state.status = 'succeeded';
                state.testList = action.payload;
            })
            .addCase(fetchTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

    }
})

export default testSlice.reducer;

