import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
	TestReportState,
	testReportAttemptAnswers,
	testReportQuestions,
	testReportResults,
	testReportRow,
} from '../types/utilities';
import { axiosGetSlice } from '../services/axios';

const initialState: TestReportState = {
	testList: [],
	questions: null,
	attempt: null,
	results: null,
	status: 'idle',
	error: null,
	currentPage: 1,
	pageSize: 10,
	totalPages: 0,
	totalItems: 0,
};

const errorMessage = (error: any): string =>
	error?.response?.data?.error ?? error?.message ?? 'Error al cargar el reporte';

type ReportQuery = {
	status?: boolean;
	course_id?: number;
	question_type_id?: number;
};

export const fetchReportTests = createAsyncThunk<
	testReportRow[],
	ReportQuery | undefined
>(
	'testReport/fetchTests',
	async (query, { rejectWithValue }) => {
		try {
			const params: ReportQuery = {};
			if (query?.status !== undefined) params.status = query.status;
			if (query?.course_id !== undefined)
				params.course_id = query.course_id;
			return await axiosGetSlice('api/test/reports/tests', params);
		} catch (error: any) {
			return rejectWithValue(errorMessage(error));
		}
	},
);

type QuestionsQuery = ReportQuery & { test_id: number };

const questionsPayload = ({
	test_id,
	status,
	question_type_id,
}: QuestionsQuery) => {
	const params: ReportQuery = {};
	if (status !== undefined) params.status = status;
	if (question_type_id !== undefined)
		params.question_type_id = question_type_id;
	return { test_id, params };
};

export const fetchReportQuestions = createAsyncThunk<
	testReportQuestions,
	QuestionsQuery
>(
	'testReport/fetchQuestions',
	async (query, { rejectWithValue }) => {
		try {
			const { test_id, params } = questionsPayload(query);
			return await axiosGetSlice(
				`api/test/reports/tests/${test_id}/questions`,
				params,
			);
		} catch (error: any) {
			return rejectWithValue(errorMessage(error));
		}
	},
);

export const fetchReportCorrectAnswers = createAsyncThunk<
	testReportQuestions,
	QuestionsQuery
>(
	'testReport/fetchCorrectAnswers',
	async (query, { rejectWithValue }) => {
		try {
			const { test_id, params } = questionsPayload(query);
			return await axiosGetSlice(
				`api/test/reports/tests/${test_id}/correct-answers`,
				params,
			);
		} catch (error: any) {
			return rejectWithValue(errorMessage(error));
		}
	},
);

type AttemptQuery = ReportQuery & {
	test_id: number;
	course_student_test_id: number;
};

export const fetchReportAttemptAnswers = createAsyncThunk<
	testReportAttemptAnswers,
	AttemptQuery
>(
	'testReport/fetchAttemptAnswers',
	async (query, { rejectWithValue }) => {
		try {
			const { test_id, course_student_test_id, status, question_type_id } =
				query;
			const params: ReportQuery = {};
			if (status !== undefined) params.status = status;
			if (question_type_id !== undefined)
				params.question_type_id = question_type_id;
			return await axiosGetSlice(
				`api/test/reports/tests/${test_id}/attempts/${course_student_test_id}/answers`,
				params,
			);
		} catch (error: any) {
			return rejectWithValue(errorMessage(error));
		}
	},
);

type ResultsQuery = {
	test_id: number;
	student_id?: number;
	finished?: boolean;
	currentPage?: number;
	pageSize?: number;
};

export const fetchReportResults = createAsyncThunk<
	testReportResults,
	ResultsQuery
>(
	'testReport/fetchResults',
	async (query, { rejectWithValue }) => {
		try {
			const {
				test_id,
				student_id,
				finished,
				currentPage = 1,
				pageSize = 10,
			} = query;
			return await axiosGetSlice(`api/test/reports/tests/${test_id}/results`, {
				student_id,
				finished,
				currentPage,
				pageSize,
			});
		} catch (error: any) {
			return rejectWithValue(errorMessage(error));
		}
	},
);

const testReportSlice = createSlice({
	name: 'testReport',
	initialState,
	reducers: {
		resetTestReport: (state) => {
			state.testList = [];
			state.questions = null;
			state.attempt = null;
			state.results = null;
			state.status = 'idle';
			state.error = null;
			state.currentPage = 1;
			state.totalPages = 0;
			state.totalItems = 0;
		},
		clearTestReportAttempt: (state) => {
			state.attempt = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchReportTests.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(fetchReportTests.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.testList = action.payload ?? [];
			})
			.addCase(fetchReportTests.rejected, (state, action) => {
				state.status = 'failed';
				state.error = (action.payload as string) ?? null;
			});

		[fetchReportQuestions, fetchReportCorrectAnswers].forEach((thunk) => {
			builder
				.addCase(thunk.pending, (state) => {
					state.status = 'loading';
					state.error = null;
				})
				.addCase(thunk.fulfilled, (state, action) => {
					state.status = 'succeeded';
					state.questions = action.payload;
				})
				.addCase(thunk.rejected, (state, action) => {
					state.status = 'failed';
					state.questions = null;
					state.error = (action.payload as string) ?? null;
				});
		});

		builder
			.addCase(fetchReportAttemptAnswers.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(fetchReportAttemptAnswers.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.attempt = action.payload;
			})
			.addCase(fetchReportAttemptAnswers.rejected, (state, action) => {
				state.status = 'failed';
				state.attempt = null;
				state.error = (action.payload as string) ?? null;
			});

		builder
			.addCase(fetchReportResults.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(fetchReportResults.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.results = action.payload;
				state.currentPage = action.payload?.currentPage ?? 1;
				state.pageSize = action.payload?.pageSize ?? 10;
				state.totalPages = action.payload?.totalPages ?? 0;
				state.totalItems = action.payload?.totalItems ?? 0;
			})
			.addCase(fetchReportResults.rejected, (state, action) => {
				state.status = 'failed';
				state.results = null;
				state.error = (action.payload as string) ?? null;
			});
	},
});

export const { resetTestReport, clearTestReportAttempt } =
	testReportSlice.actions;

export default testReportSlice.reducer;
