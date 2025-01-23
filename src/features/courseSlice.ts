import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CourseState, course, courseStudent, schedule } from '../types/utilities';
import { axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";


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
    'course/fetchCourses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/courses');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCoursesStudents = createAsyncThunk<courseStudent[]>(
    'course/fetchCoursesStudents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/courses/coursesStudents');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCoursesStudentsTests = createAsyncThunk<courseStudent[], number>(
    'course/fetchCoursesStudentsTests',
    async (course_type_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/courses/coursesStudents',
                { course_type_id: course_type_id }
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCourse = createAsyncThunk<course, number>(
    'course/fetchCourse',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/courses/course/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCourseStudent = createAsyncThunk<courseStudent, number>(
    'course/fetchCourseStudent',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/courses/courseStudent/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSchedule = createAsyncThunk<schedule[], number>(
    'course/fetchSchedule',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/courses/schedule/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


// Acción para crear un curso
export const createCourse = createAsyncThunk<course, course>(
    'course/createCourse',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/courses', courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Acción para crear un curso por piloto
export const createCourseStudent = createAsyncThunk<courseStudent, number>(
    'course/createCourseStudent',
    async (course_id, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice(`api/courses/courseStudent/${course_id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Acción para crear una actividad
export const createSchedule = createAsyncThunk<schedule, schedule>(
    'course/createSchedule',
    async (scheduleData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/courses/schedule', scheduleData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);



// Acción para actualizar un curso
export const updateCourse = createAsyncThunk<course, course>(
    'course/updateCourse',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/courses`, courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Acción para actualizar un curso por estudiante
export const updateCourseStudent = createAsyncThunk<courseStudent, { course_id: number, course_student_id: number, date: string | undefined, student_id: number | null | undefined, typeTrip: number, license: number, regulation: number }>(
    'course/updateCourseStudent',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/courses/courseStudent/${courseData.course_id}`, courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Acción para actualizar una actividad
export const updateSchedule = createAsyncThunk<schedule, schedule>(
    'course/updateSchedule',
    async (scheduleData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/courses/schedule`, scheduleData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
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


            //Reducers para la acción fetchCoursesStudentsTests
            .addCase(fetchCoursesStudentsTests.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCoursesStudentsTests.fulfilled, (state, action: PayloadAction<courseStudent[]>) => {
                state.status = 'succeeded';
                state.courseStudentList = action.payload;
            })
            .addCase(fetchCoursesStudentsTests.rejected, (state, action) => {
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