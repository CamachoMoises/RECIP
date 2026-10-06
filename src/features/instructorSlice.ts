import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosGetSlice } from '../services/axios';


export const PARTICIPATION_PAGE_SIZE = 500;

type NamedUserRef = {
	id?: number;
	name?: string;
	last_name?: string;
	email?: string;
};


export interface PilotIdentity {
	student_id?: number;
	pilot_name?: string | null;
	user?: NamedUserRef | null;

	student?: { user?: NamedUserRef | null; status?: boolean } | null;
}

/** Objeto `course` anidado. Puede no venir si el include se perdió. */
export interface GroupedCourse {
	id?: number;
	name?: string;
	code?: string;
	uses_sessions?: boolean;
	days?: number;
	sessions?: number;
	course_type?: { id: number; name: string };
	course_level?: { id: number; name: string };
}


export interface GroupedCourseRef {
	course_id?: number;
	course_name?: string;
	course_code?: string;
	course?: GroupedCourse | null;
}

export const courseIdOfGrouped = (
	row: GroupedCourseRef | null | undefined,
): number | null => row?.course_id ?? row?.course?.id ?? null;

export const courseLabelOfGrouped = (
	row: GroupedCourseRef | null | undefined,
): string =>
	[row?.course_name ?? row?.course?.name, row?.course_code ?? row?.course?.code]
		.filter(Boolean)
		.join(' - ');

export interface ScheduleGroupedItem extends PilotIdentity, GroupedCourseRef {
	course_student_id: number;
	schedules: ScheduleItem[];
}

export interface ScheduleItem {
	id?: number;
	date: string;
	hour: string;
	classTime?: number;
	subject_id?: number;
	/** Nombre de la materia duplicado como campo plano. */
	subject_name?: string;
	subject_day?: {
		id?: number;
		day: number;
		classTime?: number;
		status?: boolean;
	} | null;
	subject?: {
		id?: number;
		name?: string;
		order?: number;
		status?: boolean;
	} | null;
	subject_lesson?: {
		id?: number;
		name?: string;
		order?: number;
		status?: boolean;
	} | null;
	subject_lesson_days?: {
		id?: number;
		day: number;
		classTime?: number;
		status?: boolean;
	} | null;
}

export interface TestParticipationItem {
	id: number;
	course_student_test_id?: number;
	score?: number;
	approve?: boolean;
	attempts?: number;
	date?: string;
	code?: string;
	status?: boolean;
	finished?: boolean;
	test: {
		id: number;
		name?: string;
		code?: string;
		duration?: number;
		min_score?: number;
		status?: boolean;
		course_id?: number;
	};
	course_student: {
		id?: number;
		code?: string;
		course_id?: number;
		status?: boolean;
		student?: {
			id?: number;
			user?: { id?: number; name: string; last_name: string };
		};
	};
	course_student_test_questions?: TestParticipationQuestion[];
}

export interface TestParticipationQuestion {
	id: number;
	Answered?: boolean;
	question?: {
		id?: number;
		header?: string;
		question_type?: { id?: number; name?: string };
	};
	course_student_test_answer?: {
		id?: number;
		resp?: string;
		score?: number;
	} | null;
}

export interface AttendanceGroupedItem extends PilotIdentity, GroupedCourseRef {
	course_student_id: number;
	schedulesDates?: string[];
	attendances: AttendanceItem[];
}

export interface AttendanceItem {
	id?: number;
	/** Alias explícito del id de `attendance`, que el endpoint duplica. */
	attendance_id?: number;
	date: string;
	day: number;
	hour?: string;
	classTime?: number;
	comments?: string;
	attendance_status_id?: number;
	attendance_status?: {
		id?: number;
		name?: string;
		description?: string | null;
	} | null;
	attendance_signature?: {
		signature_url?: string;
	} | null;
	subject_id?: number;
	subject_name?: string;
	subject?: { id?: number; name?: string } | null;
	/** Ordinal día/sesión resuelto por el backend. */
	subject_day?: number | null;
}

export interface EvaluationGroupedItem extends GroupedCourseRef {
	course_student_id: number;
	created_at?: string;
	/**
	 * Opcional: si el backend pierde el include, el nombre se resuelve contra
	 * `CSA.student.user` o `CSA.user` (ver `pilotName`).
	 */
	course_student?: {
		id?: number;
		code?: string;
		status?: boolean;
		student?: { user?: NamedUserRef | null } | null;
	} | null;
	CSA?: {
		id?: number;
		course_id?: number;
		student_id?: number;
		student?: { user?: NamedUserRef | null } | null;
		course_student_id?: number;
		course_student?: {
			student?: { user?: NamedUserRef | null } | null;
		} | null;
		CourseStudentAssessmentDays?: unknown[];
		score?: number;
		approve?: boolean;
		date?: string;
		code?: string;
		status?: boolean;
		finished?: boolean;
		comments?: string;
		course_score_average?: number | null;
	};
}

interface InstructorState {
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
	schedulesGrouped: ScheduleGroupedItem[];
	testsParticipation: TestParticipationItem[];
	attendanceGrouped: AttendanceGroupedItem[];
	evaluationsGrouped: EvaluationGroupedItem[];
}

const initialState: InstructorState = {
	status: 'idle',
	error: null,
	schedulesGrouped: [],
	testsParticipation: [],
	attendanceGrouped: [],
	evaluationsGrouped: [],
};

/**
 * Los endpoints agrupados no son uniformes: `schedule/grouped`,
 * `attendance/grouped` y `evaluations/grouped` devuelven un array directo,
 * mientras que `tests/with-participation` devuelve el sobre paginado
 * `{ data, totalItems, currentPage, pageSize, totalPages }`. `axiosGetSlice`
 * ya viene desempaquetado de axios, así que solo hay que normalizar la forma.
 */
/**
 * Los tres endpoints agrupados de instructor devuelven un array directo y
 * `tests/with-participation` viene paginado. `axiosGetSlice` ya devuelve
 * `res.data` desempaquetado, así que solo hay que normalizar la forma.
 */
const toRows = <T,>(response: unknown): T[] => {
	const body = (response ?? {}) as Record<string, unknown>;
	const rows = Array.isArray(response)
		? response
		: Array.isArray(body.data)
			? body.data
			: [];

	return rows as T[];
};

export const fetchSchedulesGrouped = createAsyncThunk<
	ScheduleGroupedItem[],
	{ instructor_id: number },
	{ rejectValue: string }
>('instructor/fetchSchedulesGrouped', async ({ instructor_id }, { rejectWithValue }) => {
	try {
		const response = await axiosGetSlice(`api/instructor/schedule/grouped/${instructor_id}`);
		return toRows<ScheduleGroupedItem>(response);
	} catch (error: any) {
		return rejectWithValue(error.message || 'Error al cargar schedules agrupados');
	}
});

export const fetchTestsWithParticipation = createAsyncThunk<
	TestParticipationItem[],
	{ instructor_id: number },
	{ rejectValue: string }
>('instructor/fetchTestsWithParticipation', async ({ instructor_id }, { rejectWithValue }) => {
	try {
		// Es el único de los cuatro que viene paginado: sin `pageSize` el backend
		// devuelve solo 10 filas y el resto de intentos se pierde.
		const response = await axiosGetSlice(
			`api/instructor/tests/with-participation/${instructor_id}`,
			{ pageSize: PARTICIPATION_PAGE_SIZE },
		);
		return toRows<TestParticipationItem>(response);
	} catch (error: any) {
		return rejectWithValue(error.message || 'Error al cargar tests con participación');
	}
});

export const fetchAttendanceGrouped = createAsyncThunk<
	AttendanceGroupedItem[],
	{ instructor_id: number },
	{ rejectValue: string }
>('instructor/fetchAttendanceGrouped', async ({ instructor_id }, { rejectWithValue }) => {
	try {
		const response = await axiosGetSlice(`api/instructor/attendance/grouped/${instructor_id}`);
		return toRows<AttendanceGroupedItem>(response);
	} catch (error: any) {
		return rejectWithValue(error.message || 'Error al cargar asistencias agrupadas');
	}
});

export const fetchEvaluationsGrouped = createAsyncThunk<
	EvaluationGroupedItem[],
	{ instructor_id: number },
	{ rejectValue: string }
>('instructor/fetchEvaluationsGrouped', async ({ instructor_id }, { rejectWithValue }) => {
	try {
		const response = await axiosGetSlice(`api/instructor/evaluations/grouped/${instructor_id}`);
		return toRows<EvaluationGroupedItem>(response);
	} catch (error: any) {
		return rejectWithValue(error.message || 'Error al cargar evaluaciones agrupadas');
	}
});

const instructorSlice = createSlice({
	name: 'instructor',
	initialState,
	reducers: {
		clearInstructorError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSchedulesGrouped.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchSchedulesGrouped.fulfilled, (state, action: PayloadAction<ScheduleGroupedItem[]>) => {
				state.status = 'succeeded';
				state.schedulesGrouped = action.payload;
			})
			.addCase(fetchSchedulesGrouped.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})

			.addCase(fetchTestsWithParticipation.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchTestsWithParticipation.fulfilled, (state, action: PayloadAction<TestParticipationItem[]>) => {
				state.status = 'succeeded';
				state.testsParticipation = action.payload;
			})
			.addCase(fetchTestsWithParticipation.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})

			.addCase(fetchAttendanceGrouped.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchAttendanceGrouped.fulfilled, (state, action: PayloadAction<AttendanceGroupedItem[]>) => {
				state.status = 'succeeded';
				state.attendanceGrouped = action.payload;
			})
			.addCase(fetchAttendanceGrouped.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			})

			.addCase(fetchEvaluationsGrouped.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchEvaluationsGrouped.fulfilled, (state, action: PayloadAction<EvaluationGroupedItem[]>) => {
				state.status = 'succeeded';
				state.evaluationsGrouped = action.payload;
			})
			.addCase(fetchEvaluationsGrouped.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload as string;
			});
	},
});

export const { clearInstructorError } = instructorSlice.actions;
export default instructorSlice.reducer;