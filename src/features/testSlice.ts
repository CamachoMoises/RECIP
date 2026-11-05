import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { answer, cloneTestResult, courseStudentTest, question, questionDeleteResult, questionType, test, testCoursesResult, testImportResult, testLinkResult, testQuestionsDeleteResult, testQuestionType, testState, testUnlinkResult } from '../types/utilities';
import { axiosDeleteSlice, axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";

// Los endpoints de examen responden el motivo real en el body (`{ message }`
// o `{ error }`). `error.message` de Axios solo dice
// "Request failed with status code 4xx", así que se prioriza el body.
function backendErrorMessage(error: any, fallback: string): string {
    const data = error?.response?.data;
    return (
        (typeof data === 'string' ? data : data?.error || data?.message) ||
        error?.message ||
        fallback
    );
}

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
    studentTestList: [],
    lastCreatedId: null,
    error: null,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
};

// Acción asíncrona para obtener los tipos de preguntas
export const fetchQuestionTypes = createAsyncThunk<questionType[]>(
    'user/fetchQuestionTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/test/questionTypes');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTest = createAsyncThunk<test, number>(
    'user/fetchTest',
    async (test_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/test/test/${test_id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


export const fetchTests = createAsyncThunk<test[], number>(
    'user/fetchTests',
    async (course_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/test/tests/${course_id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Catálogo completo de exámenes (`GET /api/test/`). Lo usa el modal de
// "Vincular examen existente": el listado del curso solo trae los ya
// vinculados, no los candidatos de otros cursos.
export const fetchAllTests = createAsyncThunk<test[]>(
    'user/fetchAllTests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/test/');
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al cargar los exámenes'),
            );
        }
    }
);

// Vincula exámenes existentes al curso sin duplicarlos (`course_test`).
export const linkTestToCourse = createAsyncThunk<
    testLinkResult,
    { course_id: number; test_ids: number[] }
>(
    'test/linkTestToCourse',
    async ({ course_id, test_ids }, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice(
                `api/test/tests/${course_id}/link`,
                { test_ids },
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al vincular los exámenes'),
            );
        }
    }
);

// Desvincula el examen del curso. Nunca borra el examen ni su contenido.
export const unlinkTestFromCourse = createAsyncThunk<
    testUnlinkResult,
    { course_id: number; test_id: number }
>(
    'test/unlinkTestFromCourse',
    async ({ course_id, test_id }, { rejectWithValue }) => {
        try {
            const response = await axiosDeleteSlice(
                `api/test/tests/${course_id}/link/${test_id}`,
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al desvincular el examen'),
            );
        }
    }
);

// Cursos vinculados a un examen (dueño incluido).
export const fetchTestCourses = createAsyncThunk<testCoursesResult, number>(
    'test/fetchTestCourses',
    async (test_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(
                `api/test/test/${test_id}/courses`,
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(
                    error,
                    'Error al cargar los cursos del examen',
                ),
            );
        }
    }
);

// Clona un examen en otro curso: crea una variante independiente (copia del
// blueprint, preguntas y respuestas) que nace inactiva y solo se vincula al
// curso destino. No copia intentos ni vínculos del origen.
// `view_course_id` no viaja al backend: indica qué curso está abierto en la
// UI para insertar el clon en `testList` sin recargar la página.
export const cloneTest = createAsyncThunk<
    cloneTestResult,
    {
        test_id: number;
        course_id: number;
        view_course_id?: number;
        code?: string;
        duration?: number;
        min_score?: number;
    }
>(
    'test/cloneTest',
    async ({ test_id, course_id, code, duration, min_score }, { rejectWithValue }) => {
        try {
            // Solo se envían los campos con valor: los overrides vacíos deben
            // quedar fuera del body para que el backend copie los del origen.
            const body: {
                course_id: number;
                code?: string;
                duration?: number;
                min_score?: number;
            } = { course_id };

            if (typeof code === 'string' && code.trim()) {
                body.code = code.trim();
            }
            if (typeof duration === 'number') body.duration = duration;
            if (typeof min_score === 'number') body.min_score = min_score;

            const response = await axiosPostSlice(
                `api/test/clone/${test_id}`,
                body,
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al clonar el examen'),
            );
        }
    }
);

export const fetchQuestions = createAsyncThunk<question[], { test_id: number, question_type_id: number, test_question_type_id: number }>(
    'user/fetchQuestions',
    async ({ test_id, question_type_id, test_question_type_id }, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/test/questions/by-test/${test_id}`, {
                question_type_id,
                test_question_type_id
            });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAnswers = createAsyncThunk<answer[], number>(
    'user/fetchAnswers',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/test/answers/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Acción para actualizar una asignacion
export const updateQuestionTypes = createAsyncThunk<questionType, questionType>(
    'questionTypes/updateQuestionTypes',
    async (questionTypeData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/test/questionTypes`, questionTypeData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Acción para Crear una Examen
export const createTest = createAsyncThunk<test, { course_id: number, duration: number, min_score: number, course_ids?: number[] }>(
    'questionTypes/createTest',
    async (testData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice(`api/test/test`, testData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al crear el examen'),
            );
        }
    }
);
// Acción para actualizar una Examen
export const updateTest = createAsyncThunk<test, test>(
    'questionTypes/updateTest',
    async (testData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/test/test`, testData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al actualizar el examen'),
            );
        }
    }
);
// Acción para Crear una pregunta
export const createQuestionTest = createAsyncThunk<question, { course_id?: number, test_id: number, question_type_id: number, test_question_type_id: number, header: string }>(
    'questionTypes/createQuestionTest',
    async (questionTestData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice(`api/test/questionTest`, questionTestData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al crear la pregunta'),
            );
        }
    }
);


// Acción para actualizar una pregunta
export const updateQuestionTest = createAsyncThunk<question, question>(
    'questionTypes/updateQuestion',
    async (questionData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/test/questionTest`, questionData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Acción para Crear una pregunta
export const createAnswerQuestionTest = createAsyncThunk<question, { course_id?: number, test_id: number, question_type_id: number, question_id: number, value: string }>(
    'questionTypes/createAnswerQuestionTest',
    async (answerQuestionTestData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice(`api/test/answerQuestionTest`, answerQuestionTestData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al crear la respuesta'),
            );
        }
    }
);


// Acción para actualizar una Respuesta
export const updateAnswerQuestionTest = createAsyncThunk<question, { answerData: answer, question_id: number }>(
    'questionTypes/updateAnswerQuestionTest',
    async ({ answerData, question_id }, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/test/answerQuestionTest/${question_id}`, answerData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTestQuestionTypes = createAsyncThunk<test, testQuestionType>(
    'questionTypes/updateTestQuestionTypes',
    async (testQuestionTypeData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/test/testQuestionTypes`, testQuestionTypeData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(
                    error,
                    'Error al actualizar la cantidad de preguntas',
                ),
            );
        }
    }
);

// Acción para mostrar la evaluacion de un piloto
export const createCourseStudentTest = createAsyncThunk<courseStudentTest, { course_student_id: number, date: string }>(
    'course/createCourseStudentTest',
    async ({ course_student_id, date }, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice(`api/test/courseStudentTest/${course_student_id}`,
                {
                    date: date
                }
            );
            return response;
        } catch (error: any) {
            // El backend distingue 404 ("El curso no tiene un examen activo",
            // "Matrícula del alumno no encontrada") y 409 (curso eliminado).
            return rejectWithValue(
                backendErrorMessage(
                    error,
                    'Error al generar el examen',
                ),
            );
        }
    }
);

export const fetchCourseStudentTest = createAsyncThunk<courseStudentTest, number>(
    'user/fetchCourseStudentTest',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/test/courseStudentTest/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTestStudent = createAsyncThunk<courseStudentTest[], { student_id: number; course_student_id?: number }>(
    'user/fetchTestStudent',
    async ({ student_id, course_student_id }, { rejectWithValue }) => {
        try {

            const response = await axiosGetSlice(`api/test/student/${student_id}`, {
                course_student_id
            });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Importación masiva de preguntas desde Excel
export const importExcelQuestions = createAsyncThunk<testImportResult, { test_id: number, file: File, course_id: number, test_question_type_id: number, question_type_id?: number }>(
    'questionTypes/importExcelQuestions',
    async ({ test_id, file, course_id, test_question_type_id, question_type_id }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('excel_file', file);
            formData.append('course_id', String(course_id));
            formData.append('test_question_type_id', String(test_question_type_id));
            if (question_type_id !== undefined) {
                formData.append('question_type_id', String(question_type_id));
            }
            const response = await axiosPostSlice(`api/test/import-excel/${test_id}`, formData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Importación masiva de preguntas desde CSV
export const importCsvQuestions = createAsyncThunk<testImportResult, { test_id: number, file: File, course_id: number, test_question_type_id: number, question_type_id?: number }>(
    'questionTypes/importCsvQuestions',
    async ({ test_id, file, course_id, test_question_type_id, question_type_id }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('csv_file', file);
            formData.append('course_id', String(course_id));
            formData.append('test_question_type_id', String(test_question_type_id));
            if (question_type_id !== undefined) {
                formData.append('question_type_id', String(question_type_id));
            }
            const response = await axiosPostSlice(`api/test/import-csv?test_id=${test_id}`, formData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCourseStudentTestScore = createAsyncThunk<courseStudentTest, { course_student_test_id: number, course_student_test_answer_id: number, score: number }>(
    'user/updateCourseStudentTestScore',
    async ({ course_student_test_id, course_student_test_answer_id, score }, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/test/updateCourseStudentTestScore/`, {
                course_student_test_id,
                course_student_test_answer_id,
                score

            });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Acción para eliminar una pregunta (y sus respuestas) por su id.
export const deleteQuestionTest = createAsyncThunk<questionDeleteResult, number>(
    'questionTypes/deleteQuestionTest',
    async (question_id, { rejectWithValue }) => {
        try {
            await axiosDeleteSlice(`api/test/questions/${question_id}`);
            return { question_id };
        } catch (error: any) {
            return rejectWithValue(backendErrorMessage(error, 'Error al eliminar la pregunta'));
        }
    }
);

// Acción para eliminar TODAS las preguntas de un test (y sus respuestas).
// Borrado masivo e irreversible.
export const deleteQuestionsByTest = createAsyncThunk<testQuestionsDeleteResult, number>(
    'questionTypes/deleteQuestionsByTest',
    async (test_id, { rejectWithValue }) => {
        try {
            const response = await axiosDeleteSlice(`api/test/questions/by-test/${test_id}`);
            return { test_id, ...response };
        } catch (error: any) {
            return rejectWithValue(backendErrorMessage(error, 'Error al eliminar las preguntas'));
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
        clearReviewTest: (state) => {
            state.courseStudentTestSelected = null;
            state.testSelected = null;
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
                const newQuestions = [...action.payload].sort((a, b) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
                );

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
                // Un 409 (curso eliminado, dueño no teórico, conflicto de
                // examen activo) debe verse como toast, no como ErrorPage.
                state.status = 'succeeded';
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
                // 409 (todos los cursos eliminados / conflicto de activo) y
                // 404 se muestran como toast; dejar `status` en 'loading'
                // dejaría la página atrapada en LoadingPage.
                state.status = 'succeeded';
                state.error = action.payload as string;
            })

            // Reducers para la acción createQuestionTest
            .addCase(createQuestionTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createQuestionTest.fulfilled, (state, action: PayloadAction<question>) => {
                const newQuestion = action.payload;
                state.status = 'succeeded';
                state.questionList.unshift(newQuestion);
            })
            .addCase(createQuestionTest.rejected, (state, action) => {
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

            // Reducers para la acción createTest
            .addCase(createAnswerQuestionTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createAnswerQuestionTest.fulfilled, (state, action: PayloadAction<question>) => {
                const questionEdited = action.payload;
                state.status = 'succeeded';
                const index = state.questionList.findIndex((QE) => QE.id === questionEdited.id);
                if (index !== -1) {
                    state.questionList[index] = questionEdited;
                }
            })
            .addCase(createAnswerQuestionTest.rejected, (state, action) => {
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

            // Reducers para la acción deleteQuestionTest
            .addCase(deleteQuestionTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteQuestionTest.fulfilled, (state, action: PayloadAction<questionDeleteResult>) => {
                state.status = 'succeeded';
                state.questionList = state.questionList.filter((q) => q.id !== action.payload.question_id);
            })
            .addCase(deleteQuestionTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción deleteQuestionsByTest
            .addCase(deleteQuestionsByTest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteQuestionsByTest.fulfilled, (state) => {
                state.status = 'succeeded';
                state.questionList = [];
            })
            .addCase(deleteQuestionsByTest.rejected, (state, action) => {
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
                state.status = 'succeeded';
                state.error = action.payload as string;
            })

            // Vinculación / desvinculación de exámenes (`course_test`).
            // La respuesta trae el listado actualizado del curso, así que se
            // reemplaza `testList` sin un segundo `fetchTests`.
            .addCase(linkTestToCourse.fulfilled, (state, action: PayloadAction<testLinkResult>) => {
                state.status = 'succeeded';
                state.testList = action.payload.tests;
            })
            .addCase(linkTestToCourse.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(unlinkTestFromCourse.fulfilled, (state, action: PayloadAction<testUnlinkResult>) => {
                state.status = 'succeeded';
                state.testList = action.payload.tests;
            })
            .addCase(unlinkTestFromCourse.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Clonación de exámenes: variante independiente en otro curso.
            // No se toca `status` (la página ya está cargada) para no mostrar
            // `LoadingPage` ni `ErrorPage`; los errores se muestran como toast.
            .addCase(cloneTest.fulfilled, (state, action) => {
                const clone = action.payload;
                // Solo se inserta si el curso destino es el que está abierto:
                // clonar hacia otro curso no cambia este listado.
                if (
                    action.meta.arg.view_course_id === clone.course_id &&
                    !state.testList.some((T) => T.id === clone.id)
                ) {
                    state.testList.push(clone);
                }
            })
            .addCase(cloneTest.rejected, (state, action) => {
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
            // Reducers para la acción createCourseStudent
            .addCase(updateCourseStudentTestScore.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCourseStudentTestScore.fulfilled, (state, action: PayloadAction<courseStudentTest>) => {
                const newCourseStudentTest = action.payload;

                state.status = 'succeeded';
                state.courseStudentTestSelected = newCourseStudentTest;
            })
            .addCase(updateCourseStudentTestScore.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción fetchTestStudent
            .addCase(fetchTestStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTestStudent.fulfilled, (state, action: PayloadAction<courseStudentTest[]>) => {
                state.status = 'succeeded';
                state.studentTestList = action.payload;
            })
            .addCase(fetchTestStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

    }
})
export const { setLastCreatedId, clearReviewTest } = testSlice.actions;
export default testSlice.reducer;

