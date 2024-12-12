import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { answer, courseStudentTest, question, test, testState } from '../types/utilities';
import { axiosGetDefault, axiosPostDefault } from "../services/axios";


const initialState: testState = {
    status: 'idle',
    testList: [],
    testSelected: null,
    questionList: [],
    questionSelected: null,
    answerList: [],
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
    async (test_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/test/questions/${test_id}`);
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

// Acción para mostrar la evaluacion de un piloto
export const createCourseStudentTest = createAsyncThunk<courseStudentTest, { test_id: number, course_student_id: number, date: string }>(
    'course/createCourseStudentTest',
    async ({ course_student_id, test_id, date }, { rejectWithValue }) => {
        try {
            const response = await axiosPostDefault(`api/test/courseStudentTest/${course_student_id}/${test_id}`,
                {
                    date: date
                }
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchCourseStudentTest = createAsyncThunk<courseStudentTest, number>(
    'user/fetchCourseStudentTest',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/test/courseStudentTest/${id}`);
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
            // Reducers para la acción createCourseStudent
            .addCase(createCourseStudentTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCourseStudentTest.fulfilled, (state, action: PayloadAction<courseStudentTest>) => {
                const newCourseStudentTest = action.payload;

                state.status = 'succeeded';
                state.courseStudentTestSelected = newCourseStudentTest;
            })
            .addCase(createCourseStudentTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción fetchQuestions
            .addCase(fetchQuestions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<question[]>) => {
                const newQuestions = action.payload;

                state.status = 'succeeded';
                state.questionList = newQuestions;
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción createCourseStudent
            .addCase(fetchCourseStudentTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseStudentTest.fulfilled, (state, action: PayloadAction<courseStudentTest>) => {
                const newCourseStudentTest = action.payload;

                state.status = 'succeeded';
                state.courseStudentTestSelected = newCourseStudentTest;
            })
            .addCase(fetchCourseStudentTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

    }
})

export default testSlice.reducer;

