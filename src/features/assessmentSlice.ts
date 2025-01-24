import { axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";
import { assessmentState, courseStudentAssessment, courseStudentAssessmentDay, courseStudentAssessmentLessonDay, subject } from '../types/utilities';
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState: assessmentState = {
    status: 'idle',
    error: null,
    subjectList: null,
    courseStudentAssessmentSelected: null,
    courseStudentAssessmentDayList: [],
    courseStudentAssessmentDaySelected: null,
    courseStudentAssessmentLessonDayList: [],
    courseStudentAssessmentLessonDaySelected: null,
    day: 1,
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
            .addCase(updateCourseStudentAssessmentDay.pending, (state) => {
                console.log('Cargando');

                state.status = 'loading';
            })
            .addCase(updateCourseStudentAssessmentDay.fulfilled, (state, action: PayloadAction<courseStudentAssessmentDay>) => {
                state.status = 'succeeded';

                state.courseStudentAssessmentDaySelected = action.payload;
            })
            .addCase(updateCourseStudentAssessmentDay.rejected, (state, action) => {
                state.status = 'failed';
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
            .addCase(changeCourseStudentAssessmentLessonDay.pending, (state) => {
                state.status = 'loading';
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
                state.status = 'failed';
                state.error = action.payload as string;
            })


    },
});

export default assessmentSlice.reducer;

