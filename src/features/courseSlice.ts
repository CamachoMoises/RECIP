import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CourseState, course, courseStudent, schedule } from '../types/utilities';
import { axiosGetDefault, axiosPostDefault, axiosPutDefault } from "../services/axios";


const initialState: CourseState = {
    status: 'idle',
    day: 1,
    courseList: [],
    courseSelected: null,
    courseStudent: null,
    courseStudentList: null,
    scheduleList: [],
    lastCourseStudentCreatedId: null,
    lastCreatedId: null, //
    error: null, // Inicializar como null
};
export const fetchCourses = createAsyncThunk<course[]>(
    'user/fetchCourses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault('api/courses');
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchCoursesStudents = createAsyncThunk<courseStudent[]>(
    'user/fetchCoursesStudents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault('api/courses/coursesStudents');
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchCourse = createAsyncThunk<course, number>(
    'user/fetchCourse',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/courses/course/${id}`);
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchCourseStudent = createAsyncThunk<courseStudent, number>(
    'user/fetchCourseStudent',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/courses/courseStudent/${id}`);
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchSchedule = createAsyncThunk<schedule[], number>(
    'user/fetchSchedule',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetDefault(`api/courses/schedule/${id}`);
            return response.resp;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);


// Acción para crear un curso
export const createCourse = createAsyncThunk<course, course>(
    'course/createCourse',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPostDefault('api/courses', courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
// Acción para crear un curso por piloto
export const createCourseStudent = createAsyncThunk<courseStudent, number>(
    'course/createCourseStudent',
    async (course_id, { rejectWithValue }) => {
        try {
            const response = await axiosPostDefault(`api/courses/courseStudent/${course_id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
// Acción para crear una actividad
export const createSchedule = createAsyncThunk<schedule, schedule>(
    'course/createSchedule',
    async (scheduleData, { rejectWithValue }) => {
        try {
            const response = await axiosPostDefault('api/courses/schedule', scheduleData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);



// Acción para actualizar un curso
export const updateCourse = createAsyncThunk<course, course>(
    'course/updateCourse',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPutDefault(`api/courses`, courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
// Acción para actualizar un curso por estudiante
export const updateCourseStudent = createAsyncThunk<courseStudent, { course_id: number, course_student_id: number, date: string | undefined, student_id: number | null | undefined, typeTrip: number, license: number, regulation: number }>(
    'course/updateCourseStudent',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPutDefault(`api/courses/courseStudent/${courseData.course_id}`, courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);
// Acción para actualizar una actividad
export const updateSchedule = createAsyncThunk<schedule, schedule>(
    'course/updateSchedule',
    async (scheduleData, { rejectWithValue }) => {
        try {
            const response = await axiosPutDefault(`api/courses/schedule`, scheduleData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

const courseSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        setLastCreatedId: (state, action: PayloadAction<number | null>) => {
            state.lastCreatedId = action.payload;
        },
        setLastCourseStudentCreatedId: (state, action: PayloadAction<number | null>) => {
            state.lastCourseStudentCreatedId = action.payload;
        },
        setDay: (state, action: PayloadAction<number>) => {
            state.day = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Reducers para la acción fetchCourses
            .addCase(fetchCourses.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<course[]>) => {
                state.status = 'succeeded';
                state.courseList = action.payload;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            //Reducers para la acción fetchCoursesStudents
            .addCase(fetchCoursesStudents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCoursesStudents.fulfilled, (state, action: PayloadAction<courseStudent[]>) => {
                state.status = 'succeeded';
                state.courseStudentList = action.payload;
            })
            .addCase(fetchCoursesStudents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción fetchCourse
            .addCase(fetchCourse.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourse.fulfilled, (state, action: PayloadAction<course>) => {
                state.status = 'succeeded';
                state.courseSelected = action.payload;
            })
            .addCase(fetchCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción fetchCourseStudent
            .addCase(fetchCourseStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseStudent.fulfilled, (state, action: PayloadAction<courseStudent>) => {
                state.status = 'succeeded';
                state.courseStudent = action.payload;
            })
            .addCase(fetchCourseStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción fetchSchedule
            .addCase(fetchSchedule.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSchedule.fulfilled, (state, action: PayloadAction<schedule[]>) => {
                state.status = 'succeeded';
                state.scheduleList = action.payload;
            })
            .addCase(fetchSchedule.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


            // Reducers para la acción createCourse
            .addCase(createCourse.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCourse.fulfilled, (state, action: PayloadAction<course>) => {
                const newCourse = action.payload;
                state.lastCreatedId = newCourse.id;
                state.status = 'succeeded';
                state.courseList.push(newCourse);
            })
            .addCase(createCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción createCourseStudent
            .addCase(createCourseStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCourseStudent.fulfilled, (state, action: PayloadAction<courseStudent>) => {
                const newCourseStudent = action.payload;
                state.lastCourseStudentCreatedId = newCourseStudent.id;
                state.status = 'succeeded';
                state.courseStudent = newCourseStudent;
            })
            .addCase(createCourseStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción createSchedule
            .addCase(createSchedule.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createSchedule.fulfilled, (state, action: PayloadAction<schedule>) => {
                const newSchedule = action.payload;
                state.status = 'succeeded';
                state.scheduleList.push(newSchedule);
            })
            .addCase(createSchedule.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateCourse
            .addCase(updateCourse.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCourse.fulfilled, (state, action: PayloadAction<course>) => {
                const editedCourse = action.payload;
                state.lastCreatedId = editedCourse.id;
                state.status = 'succeeded';
                const index = state.courseList.findIndex((course) => course.id === editedCourse.id);
                if (index !== -1) {
                    state.courseList[index] = editedCourse;
                }
            })
            .addCase(updateCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateCourse
            .addCase(updateCourseStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCourseStudent.fulfilled, (state, action: PayloadAction<courseStudent>) => {
                const editedCourse = action.payload;
                state.status = 'succeeded';
                state.courseStudent = editedCourse

            })
            .addCase(updateCourseStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateSchedule
            .addCase(updateSchedule.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateSchedule.fulfilled, (state, action: PayloadAction<schedule>) => {
                const editedCourse = action.payload;
                state.status = 'succeeded';
                const index = state.scheduleList.findIndex((schedule) => schedule.id === editedCourse.id);
                if (index !== -1) {
                    state.scheduleList[index] = editedCourse;
                }
            })
            .addCase(updateSchedule.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


    },
});
export const { setLastCreatedId, setLastCourseStudentCreatedId, setDay } = courseSlice.actions;
export default courseSlice.reducer;