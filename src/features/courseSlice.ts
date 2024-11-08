import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CourseState, course } from '../types/utilidades';
import { axiosGetDefault, axiosPostDefault, axiosPutDefault } from "../services/axios";


const initialState: CourseState = {
    status: 'idle',
    courseList: [],
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
//
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

const courseSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        setLastCreatedId: (state, action: PayloadAction<number | null>) => {
            state.lastCreatedId = action.payload;
        },
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
            });



    },
});
export const { setLastCreatedId } = courseSlice.actions;
export default courseSlice.reducer;