import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AttendanceState, attendance, attendanceStatus } from '../types/utilities';
import { axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";


const initialState: AttendanceState = {
    status: 'idle',
    attendanceList: null,
    attendanceSelected: null,
    attendanceStatusList: [],
    attendanceStatusSelected: null,
    error: null,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
};

export const fetchAttendances = createAsyncThunk<{ data: attendance[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }, { currentPage?: number, pageSize?: number, course_student_id?: number, attendance_status_id?: number, date_from?: string, date_to?: string }>(
    'attendance/fetchAttendances',
    async ({ currentPage = 1, pageSize = 10, course_student_id, attendance_status_id, date_from, date_to }, { rejectWithValue }) => {
        try {
            const params: { currentPage: number; pageSize: number; course_student_id?: number; attendance_status_id?: number; date_from?: string; date_to?: string } = {
                currentPage,
                pageSize,
            };
            if (course_student_id !== undefined) {
                params.course_student_id = course_student_id;
            }
            if (attendance_status_id !== undefined) {
                params.attendance_status_id = attendance_status_id;
            }
            if (date_from !== undefined) {
                params.date_from = date_from;
            }
            if (date_to !== undefined) {
                params.date_to = date_to;
            }
            const response = await axiosGetSlice('api/attendance', params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAttendanceById = createAsyncThunk<attendance, number>(
    'attendance/fetchAttendanceById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/attendance/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAttendanceByCourseStudent = createAsyncThunk<attendance[], number>(
    'attendance/fetchAttendanceByCourseStudent',
    async (course_student_id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/attendance/by-course-student', { course_student_id });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAttendanceByDateRange = createAsyncThunk<attendance[], { start_date: string, end_date: string }>(
    'attendance/fetchAttendanceByDateRange',
    async ({ start_date, end_date }, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/attendance/by-date-range', { start_date, end_date });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createAttendance = createAsyncThunk<attendance, { course_student_id: number, date: string, attendance_status_id: number, comments?: string }>(
    'attendance/createAttendance',
    async (attendanceData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/attendance', attendanceData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAttendance = createAsyncThunk<attendance, { id: number, course_student_id?: number, date?: string, attendance_status_id?: number, comments?: string }>(
    'attendance/updateAttendance',
    async (attendanceData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice('api/attendance', attendanceData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteAttendance = createAsyncThunk<number, number>(
    'attendance/deleteAttendance',
    async (id, { rejectWithValue }) => {
        try {
            await axiosGetSlice(`api/attendance/${id}`, { _method: 'DELETE' });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAttendanceStatuses = createAsyncThunk<attendanceStatus[]>(
    'attendance/fetchAttendanceStatuses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/attendance/statuses');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAttendanceStatusById = createAsyncThunk<attendanceStatus, number>(
    'attendance/fetchAttendanceStatusById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/attendance/statuses/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createAttendanceStatus = createAsyncThunk<attendanceStatus, { name: string, description?: string }>(
    'attendance/createAttendanceStatus',
    async (statusData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/attendance/statuses', statusData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAttendanceStatus = createAsyncThunk<attendanceStatus, { id: number, name?: string, description?: string }>(
    'attendance/updateAttendanceStatus',
    async (statusData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/attendance/statuses/${statusData.id}`, statusData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteAttendanceStatus = createAsyncThunk<number, number>(
    'attendance/deleteAttendanceStatus',
    async (id, { rejectWithValue }) => {
        try {
            await axiosGetSlice(`api/attendance/statuses/${id}`, { _method: 'DELETE' });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        setAttendanceSelected: (state, action: PayloadAction<attendance | null>) => {
            state.attendanceSelected = action.payload;
        },
        setAttendanceStatusSelected: (state, action: PayloadAction<attendanceStatus | null>) => {
            state.attendanceStatusSelected = action.payload;
        },
        clearAttendanceError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendances.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAttendances.fulfilled, (state, action: PayloadAction<{ data: attendance[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }>) => {
                state.status = 'succeeded';
                state.attendanceList = action.payload.data;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.pageSize = action.payload.pageSize;
                state.totalItems = action.payload.totalItems;
            })
            .addCase(fetchAttendances.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchAttendanceById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAttendanceById.fulfilled, (state, action: PayloadAction<attendance>) => {
                state.status = 'succeeded';
                state.attendanceSelected = action.payload;
            })
            .addCase(fetchAttendanceById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchAttendanceByCourseStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAttendanceByCourseStudent.fulfilled, (state, action: PayloadAction<attendance[]>) => {
                state.status = 'succeeded';
                state.attendanceList = action.payload;
            })
            .addCase(fetchAttendanceByCourseStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchAttendanceByDateRange.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAttendanceByDateRange.fulfilled, (state, action: PayloadAction<attendance[]>) => {
                state.status = 'succeeded';
                state.attendanceList = action.payload;
            })
            .addCase(fetchAttendanceByDateRange.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(createAttendance.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createAttendance.fulfilled, (state, action: PayloadAction<attendance>) => {
                state.status = 'succeeded';
                if (state.attendanceList) {
                    state.attendanceList.push(action.payload);
                }
                state.attendanceSelected = action.payload;
            })
            .addCase(createAttendance.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(updateAttendance.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateAttendance.fulfilled, (state, action: PayloadAction<attendance>) => {
                state.status = 'succeeded';
                const updatedAttendance = action.payload;
                if (state.attendanceList) {
                    const index = state.attendanceList.findIndex((a) => a.id === updatedAttendance.id);
                    if (index !== -1) {
                        state.attendanceList[index] = updatedAttendance;
                    }
                }
                state.attendanceSelected = updatedAttendance;
            })
            .addCase(updateAttendance.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(deleteAttendance.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteAttendance.fulfilled, (state, action: PayloadAction<number>) => {
                state.status = 'succeeded';
                if (state.attendanceList) {
                    state.attendanceList = state.attendanceList.filter((a) => a.id !== action.payload);
                }
                if (state.attendanceSelected?.id === action.payload) {
                    state.attendanceSelected = null;
                }
            })
            .addCase(deleteAttendance.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchAttendanceStatuses.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAttendanceStatuses.fulfilled, (state, action: PayloadAction<attendanceStatus[]>) => {
                state.status = 'succeeded';
                state.attendanceStatusList = action.payload;
            })
            .addCase(fetchAttendanceStatuses.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchAttendanceStatusById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAttendanceStatusById.fulfilled, (state, action: PayloadAction<attendanceStatus>) => {
                state.status = 'succeeded';
                state.attendanceStatusSelected = action.payload;
            })
            .addCase(fetchAttendanceStatusById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(createAttendanceStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createAttendanceStatus.fulfilled, (state, action: PayloadAction<attendanceStatus>) => {
                state.status = 'succeeded';
                state.attendanceStatusList.push(action.payload);
                state.attendanceStatusSelected = action.payload;
            })
            .addCase(createAttendanceStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(updateAttendanceStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateAttendanceStatus.fulfilled, (state, action: PayloadAction<attendanceStatus>) => {
                state.status = 'succeeded';
                const updatedStatus = action.payload;
                const index = state.attendanceStatusList.findIndex((s) => s.id === updatedStatus.id);
                if (index !== -1) {
                    state.attendanceStatusList[index] = updatedStatus;
                }
                state.attendanceStatusSelected = updatedStatus;
            })
            .addCase(updateAttendanceStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(deleteAttendanceStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteAttendanceStatus.fulfilled, (state, action: PayloadAction<number>) => {
                state.status = 'succeeded';
                state.attendanceStatusList = state.attendanceStatusList.filter((s) => s.id !== action.payload);
                if (state.attendanceStatusSelected?.id === action.payload) {
                    state.attendanceStatusSelected = null;
                }
            })
            .addCase(deleteAttendanceStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { setAttendanceSelected, setAttendanceStatusSelected, clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
