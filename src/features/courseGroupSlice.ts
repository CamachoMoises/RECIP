import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CourseGroupState, courseGroup, courseStudent } from '../types/utilities';
import { axiosDeleteSlice, axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";

const initialState: CourseGroupState = {
    courseGroupList: [],
    courseGroupSelected: null,
    courseGroupStudents: [],
    status: 'idle',
    error: null,
};

export const fetchCourseGroups = createAsyncThunk<courseGroup[], { course_id?: number; status?: boolean }>(
    'courseGroup/fetchCourseGroups',
    async ({ course_id, status }, { rejectWithValue }) => {
        try {
            const params: { course_id?: number; status?: boolean } = {};
            if (course_id !== undefined) params.course_id = course_id;
            if (status !== undefined) params.status = status;
            const response = await axiosGetSlice('api/course-groups', params);
            return response.data || [];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCourseGroup = createAsyncThunk<courseGroup, number>(
    'courseGroup/fetchCourseGroup',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/course-groups/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createCourseGroup = createAsyncThunk<courseGroup, { title: string; date?: string; user_code?: string; course_id?: number; status?: boolean }>(
    'courseGroup/createCourseGroup',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/course-groups', data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCourseGroup = createAsyncThunk<courseGroup, { id: number; title?: string; date?: string; user_code?: string; status?: boolean }>(
    'courseGroup/updateCourseGroup',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice('api/course-groups', data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const toggleCourseGroupStatus = createAsyncThunk<courseGroup, { id: number; status: boolean }>(
    'courseGroup/toggleCourseGroupStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice('api/course-groups', { id, status });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteCourseGroup = createAsyncThunk<number, number>(
    'courseGroup/deleteCourseGroup',
    async (id, { rejectWithValue }) => {
        try {
            await axiosDeleteSlice(`api/course-groups/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCourseGroupStudents = createAsyncThunk<courseStudent[], number>(
    'courseGroup/fetchCourseGroupStudents',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/course-groups/${id}/students`);
            return response.data || [];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const assignStudentsToGroup = createAsyncThunk<courseStudent[], { groupId: number; courseStudentIds: number[]; course_id: number }>(
    'courseGroup/assignStudentsToGroup',
    async ({ groupId, courseStudentIds, course_id }, { rejectWithValue }) => {
        try {
            const promises = courseStudentIds.map(course_student_id =>
                axiosPutSlice(`api/courses/courseStudent/${course_id}`, {
                    course_student_id,
                    courseGroupId: groupId,
                })
            );
            const responses = await Promise.all(promises);
            return responses.flat() || [];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeStudentFromGroup = createAsyncThunk<number, { groupId: number; courseStudentId: number }>(
    'courseGroup/removeStudentFromGroup',
    async ({ groupId, courseStudentId }, { rejectWithValue }) => {
        try {
            await axiosDeleteSlice(`api/course-groups/${groupId}/students?course_student_ids=${courseStudentId}`);
            return courseStudentId;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const courseGroupSlice = createSlice({
    name: 'courseGroups',
    initialState,
    reducers: {
        clearCourseGroupSelected: (state) => {
            state.courseGroupSelected = null;
        },
        clearCourseGroupStudents: (state) => {
            state.courseGroupStudents = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourseGroups.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseGroups.fulfilled, (state, action: PayloadAction<courseGroup[]>) => {
                state.status = 'succeeded';
                state.courseGroupList = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchCourseGroups.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchCourseGroup.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseGroup.fulfilled, (state, action: PayloadAction<courseGroup>) => {
                state.status = 'succeeded';
                state.courseGroupSelected = action.payload;
            })
            .addCase(fetchCourseGroup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(createCourseGroup.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCourseGroup.fulfilled, (state, action: PayloadAction<courseGroup>) => {
                state.status = 'succeeded';
                if (!Array.isArray(state.courseGroupList)) state.courseGroupList = [];
                state.courseGroupList.push(action.payload);
            })
            .addCase(createCourseGroup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(updateCourseGroup.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCourseGroup.fulfilled, (state, action: PayloadAction<courseGroup>) => {
                state.status = 'succeeded';
                if (!Array.isArray(state.courseGroupList)) state.courseGroupList = [];
                const index = state.courseGroupList.findIndex(g => g.id === action.payload.id);
                if (index !== -1) {
                    state.courseGroupList[index] = action.payload;
                }
                if (state.courseGroupSelected?.id === action.payload.id) {
                    state.courseGroupSelected = action.payload;
                }
            })
            .addCase(updateCourseGroup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(toggleCourseGroupStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(toggleCourseGroupStatus.fulfilled, (state, action: PayloadAction<courseGroup>) => {
                state.status = 'succeeded';
                if (!Array.isArray(state.courseGroupList)) state.courseGroupList = [];
                const index = state.courseGroupList.findIndex(g => g.id === action.payload.id);
                if (index !== -1) {
                    state.courseGroupList[index] = action.payload;
                }
                if (state.courseGroupSelected?.id === action.payload.id) {
                    state.courseGroupSelected = action.payload;
                }
            })
            .addCase(toggleCourseGroupStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(deleteCourseGroup.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteCourseGroup.fulfilled, (state, action: PayloadAction<number>) => {
                state.status = 'succeeded';
                if (!Array.isArray(state.courseGroupList)) state.courseGroupList = [];
                state.courseGroupList = state.courseGroupList.filter(g => g.id !== action.payload);
                if (state.courseGroupSelected?.id === action.payload) {
                    state.courseGroupSelected = null;
                }
            })
            .addCase(deleteCourseGroup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchCourseGroupStudents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseGroupStudents.fulfilled, (state, action: PayloadAction<courseStudent[]>) => {
                state.status = 'succeeded';
                state.courseGroupStudents = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchCourseGroupStudents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(assignStudentsToGroup.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(assignStudentsToGroup.fulfilled, (state, action: PayloadAction<courseStudent[]>) => {
                state.status = 'succeeded';
                if (!Array.isArray(state.courseGroupStudents)) state.courseGroupStudents = [];
                const payload = Array.isArray(action.payload) ? action.payload : [];
                payload.forEach(updatedStudent => {
                    const index = state.courseGroupStudents.findIndex(s => s.id === updatedStudent.id);
                    if (index !== -1) {
                        state.courseGroupStudents[index] = updatedStudent;
                    } else {
                        state.courseGroupStudents.push(updatedStudent);
                    }
                });
            })
            .addCase(assignStudentsToGroup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(removeStudentFromGroup.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(removeStudentFromGroup.fulfilled, (state, action: PayloadAction<number>) => {
                state.status = 'succeeded';
                if (!Array.isArray(state.courseGroupStudents)) state.courseGroupStudents = [];
                state.courseGroupStudents = state.courseGroupStudents.filter(s => s.id !== action.payload);
            })
            .addCase(removeStudentFromGroup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearCourseGroupSelected, clearCourseGroupStudents } = courseGroupSlice.actions;
export default courseGroupSlice.reducer;
