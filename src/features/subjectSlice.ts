import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { subject, subjectLesson, subjectState } from '../types/utilities';
import { axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";

/**
 * `error.message` de Axios solo dice "Request failed with status code 400".
 * `PUT /api/subjects/lesson/order` responde `{ message }` en los 400/404
 * (`Parámetro ids inválido`, `La lista de ids tiene duplicados`,
 * `Lección no encontrada: <ids>`), así que hay que leer el body para que el
 * toast muestre el motivo real.
 */
const backendErrorMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    return (
        (typeof data === 'string' ? data : data?.error || data?.message) ||
        error?.message ||
        fallback
    );
};

const initialState: subjectState = {
    status: 'idle',
    subjectList: [],
    lastCreatedId: null,
    maxOrderSubject: null,
    maxOrderLesson: null,
    error: null,
    subjectSelected: null,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
};

export const fetchSubjects = createAsyncThunk<subject[], { course_id: number, status: boolean, is_schedulable: boolean }>(
    'user/fetchSubjects',
    async ({ course_id, status, is_schedulable }, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/subjects/course/${course_id}`,
                {
                    status,
                    is_schedulable
                }
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSubject = createAsyncThunk<subject, number>(
    'user/fetchSubject',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/subjects/subject/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Acción para crear una asignacion
export const createSubject = createAsyncThunk<subject, subject>(
    'subject/createSubject',
    async (subjectData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/subjects', subjectData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al crear la sección'),
            );
        }
    }
);

// Acción para crear un tema
export const createSubjectLesson = createAsyncThunk<subject, subjectLesson>(
    'subject/createSubjectLesson',
    async (subjectLessonData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/subjects/lesson', subjectLessonData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al crear el tema'),
            );
        }
    }
);

// Acción para actualizar una asignacion
export const updateSubject = createAsyncThunk<subject, subject>(
    'subject/updateSubject',
    async (subjectData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/subjects`, subjectData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al actualizar la sección'),
            );
        }
    }
);


// Acción para actualizar un tema
export const updateSubjectLesson = createAsyncThunk<subject, subjectLesson>(
    'subject/updateSubjectLesson',
    async (subjectLessonData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/subjects/lesson`, subjectLessonData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al actualizar el tema'),
            );
        }
    }
);

// Reordena los temas de una sección. `ids` es la lista COMPLETA de lecciones
// de esa sección en el orden final; el backend reasigna `order = 1..N` y
// devuelve las lecciones ya ordenadas (`order ASC, id ASC`).
export const reorderSubjectLessons = createAsyncThunk<subjectLesson[], { subject_id: number; ids: number[] }>(
    'subject/reorderSubjectLessons',
    async ({ subject_id, ids }, { rejectWithValue }) => {
        try {
            return await axiosPutSlice('api/subjects/lesson/order', { subject_id, ids });
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(
                    error,
                    'Error al guardar el orden de los temas',
                ),
            );
        }
    }
);

const subjectSlice = createSlice({
    name: 'subject',
    initialState,
    reducers: {
        setLastCreatedId: (state, action: PayloadAction<number | null>) => {
            state.lastCreatedId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Reducers para la acción fetchSubjects
            .addCase(fetchSubjects.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSubjects.fulfilled, (state, action: PayloadAction<subject[]>) => {
                state.status = 'succeeded';
                state.subjectList = action.payload;
                if (state.subjectList.length > 0) {
                    const maxOrder = Math.max(...state.subjectList.map(subject => subject.order))
                    state.maxOrderSubject = maxOrder;
                }
                else {
                    state.maxOrderSubject = 0;
                }
            })
            .addCase(fetchSubjects.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción fetchSubject
            .addCase(fetchSubject.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSubject.fulfilled, (state, action: PayloadAction<subject>) => {
                state.status = 'succeeded';
                state.subjectSelected = action.payload;
                const subject_lessons = action.payload.subject_lessons ? action.payload.subject_lessons : [];
                state.maxOrderLesson = subject_lessons.length;

            })
            .addCase(fetchSubject.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


            // Reducers para la acción createSubjectLesson
            // No se toca `status`: `courseDetail.tsx` monta `LoadingPage` cuando
            // `subject.status === 'loading'` y `ErrorPage` cuando es `failed`,
            // lo que desmontaría el modal de la sección al crear/editar un tema.
            // Los errores los muestra el toast del modal (`unwrap()`).
            .addCase(createSubjectLesson.fulfilled, (state, action: PayloadAction<subject>) => {
                state.status = 'succeeded';
                state.subjectSelected = action.payload;
                const subject_lessons = action.payload.subject_lessons ? action.payload.subject_lessons : [];
                state.maxOrderLesson = subject_lessons.length;

            })
            .addCase(createSubjectLesson.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Reducers para la acción updateSubjectLesson (misma regla que
            // createSubjectLesson: sin `loading`/`failed` para no cerrar el modal).
            .addCase(updateSubjectLesson.fulfilled, (state, action: PayloadAction<subject>) => {
                state.status = 'succeeded';
                state.subjectSelected = action.payload;
                const subject_lessons = action.payload.subject_lessons ? action.payload.subject_lessons : [];
                state.maxOrderLesson = subject_lessons.length;

            })
            .addCase(updateSubjectLesson.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Reordenamiento de temas. No se toca `status` en `pending`:
            // `courseDetail.tsx` monta `LoadingPage` cuando
            // `subject.status === 'loading'`, lo que desmontaría el modal de la
            // sección en cada clic. `rejected` solo guarda el error para el
            // toast (un 400/404 no debe dejar la pantalla en error).
            .addCase(reorderSubjectLessons.fulfilled, (state, action: PayloadAction<subjectLesson[]>) => {
                state.status = 'succeeded';
                if (state.subjectSelected) {
                    state.subjectSelected.subject_lessons = action.payload;
                }
            })
            .addCase(reorderSubjectLessons.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Reducers para la acción createSubject
            .addCase(createSubject.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createSubject.fulfilled, (state, action: PayloadAction<subject>) => {
                const newSubject = action.payload;
                state.lastCreatedId = newSubject.id;
                state.maxOrderSubject = newSubject.order
                state.status = 'succeeded';
                state.subjectList.push(newSubject);
            })
            .addCase(createSubject.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


            // Reducers para la acción updateSubject
            .addCase(updateSubject.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateSubject.fulfilled, (state, action: PayloadAction<subject>) => {
                const editedSubject = action.payload;
                state.lastCreatedId = editedSubject.id;
                state.status = 'succeeded';
                const index = state.subjectList.findIndex((subject) => subject.id === editedSubject.id);
                if (index !== -1) {
                    state.subjectList[index] = editedSubject;
                }
            })
            .addCase(updateSubject.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });


    }
})

export default subjectSlice.reducer;

