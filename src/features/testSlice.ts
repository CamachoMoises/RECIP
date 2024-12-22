import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { answer, courseStudentTest, question, questionType, test, testState } from '../types/utilities';
import { axiosGetDefault, axiosPostDefault, axiosPutDefault } from "../services/axios";


const initialState: testState = {
    status: 'idle',
    testList: [],
    questionTypes: [],
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

// Acción asíncrona para obtener los tipos de preguntas
export const fetchQuestionTypes = createAsyncThunk<questionType[]>(
    'user/fetchQuestionTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault('api/test/questionTypes');
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

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
// Acción para actualizar una asignacion
export const updateQuestionTypes = createAsyncThunk<questionType, questionType>(
    'questionTypes/updateQuestionTypes',
    async (questionTypeData, { rejectWithValue }) => {
        try {
            const response = await axiosPutDefault(`api/test/questionTypes`, questionTypeData);
            return response;
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
            // Reducers para la acción fetchQuestionTypes
            .addCase(fetchQuestionTypes.pending, (state) => {
                state.status = 'loading';
            }).addCase(fetchQuestionTypes.fulfilled, (state, action: PayloadAction<questionType[]>) => {
                state.status = 'succeeded';
                state.questionTypes = action.payload;
            })
            .addCase(fetchQuestionTypes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
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
            // Reducers para la acción updateQuestionTypes
            .addCase(updateQuestionTypes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateQuestionTypes.fulfilled, (state, action: PayloadAction<questionType>) => {
                const editedQuestionType = action.payload;
                state.status = 'succeeded';
                const index = state.questionTypes.findIndex((QT) => QT.id === editedQuestionType.id);
                if (index !== -1) {
                    state.questionTypes[index] = editedQuestionType;
                }
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

