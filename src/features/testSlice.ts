import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { answer, courseStudentTest, question, questionType, test, testQuestionType, testState } from '../types/utilities';
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

export const fetchTest = createAsyncThunk<test, number>(
    'user/fetchTest',
    async (test_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/test/test/${test_id}`);
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);


export const fetchTests = createAsyncThunk<test[], number>(
    'user/fetchTests',
    async (course_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/test/tests/${course_id}`);
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchQuestions = createAsyncThunk<question[], { test_id: number, question_type_id: number }>(
    'user/fetchQuestions',
    async ({ test_id, question_type_id }, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/test/questions/${test_id}`, {
                question_type_id: question_type_id
            });
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
// Acción para Crear una Examen
export const createTest = createAsyncThunk<test, { course_id: number, duration: number, min_score: number }>(
    'questionTypes/createTest',
    async (testData, { rejectWithValue }) => {
        try {
            const response = await axiosPostDefault(`api/test/test`, testData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
// Acción para actualizar una Examen
export const updateTest = createAsyncThunk<test, test>(
    'questionTypes/updateTest',
    async (testData, { rejectWithValue }) => {
        try {
            const response = await axiosPutDefault(`api/test/test`, testData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
// Acción para actualizar una pregunta
export const updateQuestionTest = createAsyncThunk<question, question>(
    'questionTypes/updateQuestion',
    async (questionData, { rejectWithValue }) => {
        try {
            const response = await axiosPutDefault(`api/test/questionTest`, questionData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
// Acción para actualizar una Respuesta
export const updateAnswerQuestionTest = createAsyncThunk<question, { answerData: answer, question_id: number }>(
    'questionTypes/updateAnswerQuestionTest',
    async ({ answerData, question_id }, { rejectWithValue }) => {
        try {
            const response = await axiosPutDefault(`api/test/answerQuestionTest/${question_id}`, answerData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateTestQuestionTypes = createAsyncThunk<test, testQuestionType>(
    'questionTypes/updateTestQuestionTypes',
    async (testQuestionTypeData, { rejectWithValue }) => {
        try {
            const response = await axiosPutDefault(`api/test/testQuestionTypes`, testQuestionTypeData);
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

            // Reducers para la acción fetchTests
            .addCase(fetchTests.pending, (state) => {
                state.status = 'loading';
            }).addCase(fetchTests.fulfilled, (state, action: PayloadAction<test[]>) => {
                state.status = 'succeeded';
                state.testList = action.payload;
            })
            .addCase(fetchTests.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción fetchTest
            .addCase(fetchTest.pending, (state) => {
                state.status = 'loading';
            }).addCase(fetchTest.fulfilled, (state, action: PayloadAction<test>) => {
                state.status = 'succeeded';
                state.testSelected = action.payload;
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
            .addCase(updateQuestionTypes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción createTest
            .addCase(createTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createTest.fulfilled, (state, action: PayloadAction<test>) => {
                const newTest = action.payload;
                state.status = 'succeeded';
                state.testList.push(newTest);
            })
            .addCase(createTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateTest
            .addCase(updateTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateTest.fulfilled, (state, action: PayloadAction<test>) => {
                const testEdited = action.payload;
                state.status = 'succeeded';
                const index = state.testList.findIndex((TE) => TE.id === testEdited.id);
                if (index !== -1) {
                    state.testList[index] = testEdited;
                }
            })
            .addCase(updateTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


            // Reducers para la acción updateQuestionTest
            .addCase(updateQuestionTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateQuestionTest.fulfilled, (state, action: PayloadAction<question>) => {
                const questionEdited = action.payload;
                state.status = 'succeeded';
                const index = state.questionList.findIndex((QE) => QE.id === questionEdited.id);
                if (index !== -1) {
                    state.questionList[index] = questionEdited;
                }
            })
            .addCase(updateQuestionTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


            // Reducers para la acción updateAnswerQuestionTest
            .addCase(updateAnswerQuestionTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateAnswerQuestionTest.fulfilled, (state, action: PayloadAction<question>) => {
                const questionEdited = action.payload;
                state.status = 'succeeded';
                const index = state.questionList.findIndex((QE) => QE.id === questionEdited.id);
                if (index !== -1) {
                    state.questionList[index] = questionEdited;
                }
            })
            .addCase(updateAnswerQuestionTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateTestQuestionTypes
            .addCase(updateTestQuestionTypes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateTestQuestionTypes.fulfilled, (state, action: PayloadAction<test>) => {
                const editedTest = action.payload;
                state.status = 'succeeded';
                const index = state.testList.findIndex((QT) => QT.id === editedTest.id);
                if (index !== -1) {
                    state.testList[index] = editedTest;
                }
            })
            .addCase(updateTestQuestionTypes.rejected, (state, action) => {
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

