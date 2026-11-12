import { axiosDeleteSlice, axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";
import { assessmentState, courseStudentAssessment, courseStudentAssessmentDay, courseStudentAssessmentLessonDay, courseStudentAssessmentLessonDayDeleteParams, courseStudentAssessmentLessonDayDeleteResult, subject } from '../types/utilities';
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/**
 * `error.message` de Axios solo dice "Request failed with status code 404".
 * El motivo real viaja en el body y el backend de assessment usa `{ error }`
 * en el DELETE (y `{ message }` en los POST/PUT).
 */
const backendErrorMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    return (
        (typeof data === 'string' ? data : data?.error || data?.message) ||
        error?.message ||
        fallback
    );
};

const initialState: assessmentState = {
    status: 'idle',
    error: null,
    subjectList: null,
    courseStudentAssessmentSelected: null,
    courseStudentAssessmentDayList: [],
    courseStudentAssessmentDaySelected: null,
    courseStudentAssessmentLessonDayList: [],
    courseStudentAssessmentLessonDaySelected: null,
    daysSubjectList: null,
    day: 1,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
    signatureStatus: 'idle',
}

export const fetchCourseStudentAssessment = createAsyncThunk<courseStudentAssessment, number>(
    'assessment/fetchCourseStudentAssessment',
    async (course_student_assessment_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/assessment/courseStudentAssessment/${course_student_assessment_id}`
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


export const fetchAssessmentData = createAsyncThunk<{ CSA: courseStudentAssessment, CASD: subject[] }, number>(
    'assessment/fetchAssessmentData',
    async (course_student_assessment_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/assessment/fetchAssessmentData`,
                { CSA_id: course_student_assessment_id }
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
export const createCourseStudentAssessment = createAsyncThunk<courseStudentAssessment, { course_id: number, student_id: number, course_student_id: number }>(
    'assessment/createCourseStudentAssessment',
    async (data, { rejectWithValue }) => {
        try {

            const response = await axiosPostSlice(`api/assessment/createCourseStudentAssessment`, data);

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchCourseStudentAssessmentDay = createAsyncThunk<courseStudentAssessmentDay, { CSA_id: number, day: number, course_id: number, student_id: number, course_student_id: number }>(
    'assessment/fetchCourseStudentAssessmentDay',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/assessment/courseStudentAssessmentDay`,
                data
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCourseStudentAssessmentDay = createAsyncThunk<courseStudentAssessmentDay, courseStudentAssessmentDay>(
    'assessment/updateCourseStudentAssessmentDay',
    async (CSAD, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/assessment/updateCourseStudentAssessmentDay`, CSAD);
            if (CSAD.ifr_time !== undefined || CSAD.vfr_time !== undefined) {
                console.log('CSAD payload:', JSON.stringify(CSAD));
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)


export const changeCourseStudentAssessmentLessonDay = createAsyncThunk<subject, courseStudentAssessmentLessonDay>(
    'assessment/changeCourseStudentAssessmentLessonDay',
    async (CSALD, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/assessment/changeCourseStudentAssessmentLessonDay`, CSALD);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

/**
 * Borra registros de `course_student_assessment_lesson_day` (borrado físico).
 * Con `id` elimina una calificación puntual; con
 * `course_student_assessment_day_id` todas las del día de evaluación.
 */
export const deleteCourseStudentAssessmentLessonDay = createAsyncThunk<
    courseStudentAssessmentLessonDayDeleteResult,
    courseStudentAssessmentLessonDayDeleteParams
>(
    'assessment/deleteCourseStudentAssessmentLessonDay',
    async (params, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (params.id !== undefined) {
                query.set('id', String(params.id));
            }
            if (params.course_student_assessment_day_id !== undefined) {
                query.set(
                    'course_student_assessment_day_id',
                    String(params.course_student_assessment_day_id),
                );
            }
            const response = await axiosDeleteSlice(
                `api/assessment/courseStudentAssessmentLessonDay?${query.toString()}`,
            );
            return { ...params, ...response };
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(
                    error,
                    'Error al eliminar las calificaciones',
                ),
            );
        }
    }
);

export const fetchSubjectAssessment = createAsyncThunk<subject[], { day: number, course_id: number, student_id: number, course_student_id: number, course_student_assessment_id: number, course_student_assessment_day_id: number }>(
    'assessment/fetchSubjectAssessment',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/assessment/fetchSubjectAssessment/`, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const saveSignatures = createAsyncThunk<void, { CSAD_id: number; signature1?: string; signature2?: string; signature3?: string; }>
    (
        'assessment/saveSignatures',
        async (signatureData, { rejectWithValue }) => {
            try {
                await axiosPostSlice('api/assessment/saveSignatures', signatureData);
            } catch (error: any) {
                return rejectWithValue(error.message);
            }
        }
    );

export const deleteAssessmentSignature = createAsyncThunk<void, { CSAD_id: number; type: number }>(
    'assessment/deleteAssessmentSignature',
    async ({ CSAD_id, type }, { rejectWithValue }) => {
        try {
            await axiosDeleteSlice(`api/assessment/signature?CSAD_id=${CSAD_id}&type=${type}`);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const assessmentSlice = createSlice({
    name: 'assessment',
    initialState,
    reducers: {
        // Add your reducer functions here
    },
    extraReducers: (builder) => {
        builder
            // Reducers para la acción fetchCourseStudentAssessment
            .addCase(fetchCourseStudentAssessment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseStudentAssessment.fulfilled, (state, action: PayloadAction<courseStudentAssessment>) => {
                state.status = 'succeeded';
                state.courseStudentAssessmentSelected = action.payload;
            })
            .addCase(fetchCourseStudentAssessment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción fetchAssessmentData
            .addCase(fetchAssessmentData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAssessmentData.fulfilled, (state, action: PayloadAction<{
                CSA: courseStudentAssessment;
                CASD: subject[];
            }>) => {
                state.status = 'succeeded';
                state.courseStudentAssessmentSelected = action.payload.CSA;
                state.daysSubjectList = action.payload.CASD;
            })
            .addCase(fetchAssessmentData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción createCourseStudentAssessment
            .addCase(createCourseStudentAssessment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCourseStudentAssessment.fulfilled, (state, action: PayloadAction<courseStudentAssessment>) => {
                state.status = 'succeeded';
                state.courseStudentAssessmentSelected = action.payload;
            })
            .addCase(createCourseStudentAssessment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción fetchCourseStudentAssessmentDay
            .addCase(fetchCourseStudentAssessmentDay.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseStudentAssessmentDay.fulfilled, (state, action: PayloadAction<courseStudentAssessmentDay>) => {
                state.status = 'succeeded';
                state.courseStudentAssessmentDaySelected = action.payload;
            })
            .addCase(fetchCourseStudentAssessmentDay.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción updateCourseStudentAssessmentDay
            .addCase(updateCourseStudentAssessmentDay.pending, () => {
                // No global loading: evita recargar toda la vista
            })
            .addCase(updateCourseStudentAssessmentDay.fulfilled, (state, action: PayloadAction<courseStudentAssessmentDay>) => {
                state.status = 'succeeded';

                state.courseStudentAssessmentDaySelected = action.payload;
            })
            .addCase(updateCourseStudentAssessmentDay.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Reducers para la acción fetchSubjectAssessment
            .addCase(fetchSubjectAssessment.pending, (state) => {
                console.log('Cargando');

                state.status = 'loading';
            })
            .addCase(fetchSubjectAssessment.fulfilled, (state, action: PayloadAction<subject[]>) => {
                state.status = 'succeeded';

                state.subjectList = action.payload;
            })
            .addCase(fetchSubjectAssessment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción updateCourse
            .addCase(changeCourseStudentAssessmentLessonDay.pending, () => {
                // No global loading: evita recargar toda la vista
            })
            .addCase(changeCourseStudentAssessmentLessonDay.fulfilled, (state, action: PayloadAction<subject>) => {
                const editedSubject = action.payload;
                state.status = 'succeeded';
                if (state.subjectList) {
                    const index = state.subjectList.findIndex((subject) => subject.id === editedSubject.id);
                    if (index !== -1) {
                        state.subjectList[index] = editedSubject;
                    }
                }
            })
            .addCase(changeCourseStudentAssessmentLessonDay.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Reducers para la acción deleteCourseStudentAssessmentLessonDay
            .addCase(deleteCourseStudentAssessmentLessonDay.pending, () => {
                // No global loading: el borrado se refleja al volver la respuesta
            })
            .addCase(deleteCourseStudentAssessmentLessonDay.fulfilled, (state, action: PayloadAction<courseStudentAssessmentLessonDayDeleteResult>) => {
                state.status = 'succeeded';
                state.error = null;
                const deletedIds = new Set(action.payload.ids ?? []);
                if (!state.subjectList || deletedIds.size === 0) return;

                // Los detalles viven anidados en subjectList
                // (subject → subject_lessons → subject_lesson_days →
                // course_student_assessment_lesson_days): los quitamos en sitio
                // para que la grilla muestre la calificación vacía sin refetch.
                state.subjectList = state.subjectList.map((subjectItem) => ({
                    ...subjectItem,
                    subject_lessons: subjectItem.subject_lessons?.map((lesson) => ({
                        ...lesson,
                        subject_lesson_days: lesson.subject_lesson_days?.map((lessonDay) => ({
                            ...lessonDay,
                            course_student_assessment_lesson_days:
                                lessonDay.course_student_assessment_lesson_days?.filter(
                                    (detail) =>
                                        detail.id === undefined ||
                                        !deletedIds.has(detail.id),
                                ),
                        })),
                    })),
                }));
            })
            .addCase(deleteCourseStudentAssessmentLessonDay.rejected, (state, action) => {
                // Solo toast: no marcar status 'failed' (montaría ErrorPage)
                state.error = action.payload as string;
            })
            .addCase(saveSignatures.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(saveSignatures.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(saveSignatures.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(deleteAssessmentSignature.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteAssessmentSignature.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(deleteAssessmentSignature.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export default assessmentSlice.reducer;

