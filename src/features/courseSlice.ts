import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CourseState, course } from "../types/utilidades";
import { axiosGetDefault, axiosPostDefault } from "../services/axios";


const initialState: CourseState = {
    status: 'idle',
    courseList: [],
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

const userSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {},
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
                state.status = 'succeeded';
                state.courseList.push(action.payload);
            })
            .addCase(createCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


        // .addCase(updateUser.pending, (state) => {
        //     state.status = 'loading';
        // })
        // .addCase(updateUser.fulfilled, (state, action: PayloadAction<user>) => {
        //     state.status = 'succeeded';
        //     const index = state.usersList.findIndex((user) => user.id === action.payload.id);
        //     if (index !== -1) {
        //         state.usersList[index] = action.payload;
        //     }
        // })
        // .addCase(updateUser.rejected, (state, action) => {
        //     state.status = 'failed';
        //     state.error = action.payload as string;
        // });



    },
});

export default userSlice.reducer;