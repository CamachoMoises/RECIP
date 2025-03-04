import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { subject, subjectLesson, subjectState } from '../types/utilities';
import { axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";

const initialState: subjectState = {
    status: 'idle',
    subjectList: [],
    lastCreatedId: null,
    maxOrderSubject: null,
    maxOrderLesson: null,
    error: null,
    subjectSelected: null,
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

export const fetchSubjectsLesson = createAsyncThunk<subject[], number>(
    'user/fetchSubjectsLesson',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/subjects/lesson/course/${id}`);
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
            return rejectWithValue(error.message);
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
            return rejectWithValue(error.message);
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
            return rejectWithValue(error.message);
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
            return rejectWithValue(error.message);
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

            // Reducers para la acción fetchSubjectsLesson

            .addCase(fetchSubjectsLesson.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSubjectsLesson.fulfilled, (state, action: PayloadAction<subject[]>) => {
                state.status = 'succeeded';
                state.subjectList = action.payload;

            })
            .addCase(fetchSubjectsLesson.rejected, (state, action) => {
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
            .addCase(createSubjectLesson.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createSubjectLesson.fulfilled, (state, action: PayloadAction<subject>) => {
                state.status = 'succeeded';
                state.subjectSelected = action.payload;
                const subject_lessons = action.payload.subject_lessons ? action.payload.subject_lessons : [];
                state.maxOrderLesson = subject_lessons.length;

            })
            .addCase(createSubjectLesson.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateSubjectLesson
            .addCase(updateSubjectLesson.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateSubjectLesson.fulfilled, (state, action: PayloadAction<subject>) => {
                state.status = 'succeeded';
                state.subjectSelected = action.payload;
                const subject_lessons = action.payload.subject_lessons ? action.payload.subject_lessons : [];
                state.maxOrderLesson = subject_lessons.length;

            })
            .addCase(updateSubjectLesson.rejected, (state, action) => {
                state.status = 'failed';
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

