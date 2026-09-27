import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Typography,
} from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import {
	AlertCircle,
	CheckCircle,
	ChevronLeft,
	Loader,
	Printer,
	X,
} from 'lucide-react';
import { AppDispatch, RootState } from '../../../store';
import {
	clearTestReportAttempt,
	fetchReportAttemptAnswers,
	fetchReportCorrectAnswers,
	fetchReportQuestions,
	fetchReportResults,
} from '../../../features/testReportSlice';
import {
	testReportAnsweredQuestion,
	testReportQuestion,
	testReportResultRow,
	testReportRow,
} from '../../../types/utilities';
import TestListPagination from '../test/components/TestListPagination';
import {
	resultColor,
	typeBadgeColor,
	typeLabel,
} from '../test/components/questionTypeMeta';
import TestReportResultsPdf from './TestReportResultsPdf';

type Tab = 'questions' | 'correct' | 'results';

const TABS: { key: Tab; label: string }[] = [
	{ key: 'questions', label: 'Preguntas' },
	{ key: 'correct', label: 'Respuestas correctas' },
	{ key: 'results', label: 'Resultados' },
];

const QuestionCard = ({
	question,
	index,
	points,
	pointsScored,
	result,
	studentResponse,
}: {
	question: testReportQuestion;
	index: number;
	points?: number | null;
	pointsScored?: number | null;
	result?: string;
	studentResponse?: string;
}) => {
	const badge = typeBadgeColor(question.question_type_id);
	const verdict = resultColor(result);

	return (
		<div
			style={{
				background: 'var(--color-background-primary)',
				border: '0.5px solid var(--color-border-tertiary)',
				borderRadius: 'var(--border-radius-lg)',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 8,
					padding: '10px 14px',
					borderBottom: '0.5px solid var(--color-border-tertiary)',
					background: 'var(--color-background-secondary)',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<span
						style={{
							fontSize: 12,
							fontWeight: 500,
							color: 'var(--color-text-secondary)',
						}}
					>
						#{index + 1}
					</span>
					<span
						style={{
							fontSize: 11,
							padding: '2px 8px',
							borderRadius: 999,
							background: badge.bg,
							color: badge.text,
						}}
					>
						{typeLabel(question.question_type_id)}
					</span>
					{!question.status && (
						<span
							style={{
								fontSize: 11,
								padding: '2px 8px',
								borderRadius: 999,
								background: 'var(--color-background-secondary)',
								color: 'var(--color-text-secondary)',
							}}
						>
							Inactiva
						</span>
					)}
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					{result && (
						<span
							style={{
								fontSize: 11,
								fontWeight: 600,
								padding: '2px 8px',
								borderRadius: 999,
								background: verdict.bg,
								color: verdict.text,
							}}
						>
							{result}
						</span>
					)}
					<span
						style={{
							fontSize: 12,
							fontWeight: 500,
							color: 'var(--color-text-primary)',
						}}
					>
						{pointsScored ?? 0} / {points ?? '—'} pts
					</span>
				</div>
			</div>

			<div
				style={{
					padding: 14,
					display: 'flex',
					flexDirection: 'column',
					gap: 12,
				}}
			>
				<p
					style={{
						fontSize: 13,
						color: 'var(--color-text-primary)',
						margin: 0,
					}}
				>
					{question.header}
				</p>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns:
							studentResponse !== undefined ? '1fr 1fr' : '1fr',
						gap: 10,
					}}
				>
					<div
						style={{
							borderRadius: 'var(--border-radius-md)',
							padding: '10px 12px',
							background: '#EAF3DE',
							border: '0.5px solid #C0DD97',
						}}
					>
						<p
							style={{
								fontSize: 11,
								fontWeight: 500,
								color: '#3B6D11',
								margin: '0 0 6px',
								display: 'flex',
								alignItems: 'center',
								gap: 4,
							}}
						>
							<CheckCircle size={12} /> Correcta
						</p>
						{question.correct_answers?.length ? (
							question.correct_answers.map((ca, i) => (
								<p
									key={ca.id}
									style={{
										fontSize: 12,
										color: '#27500A',
										margin: 0,
									}}
								>
									{question.correct_answers.length > 1
										? `(${i + 1}): `
										: ''}
									{ca.value}
								</p>
							))
						) : (
							<p
								style={{
									fontSize: 12,
									color: '#27500A',
									margin: 0,
								}}
							>
								—
							</p>
						)}
					</div>

					{studentResponse !== undefined && (
						<div
							style={{
								borderRadius: 'var(--border-radius-md)',
								padding: '10px 12px',
								background: verdict.bg,
								border: `0.5px solid ${verdict.border}`,
							}}
						>
							<p
								style={{
									fontSize: 11,
									fontWeight: 500,
									color: verdict.text,
									margin: '0 0 6px',
								}}
							>
								Respuesta del alumno
							</p>
							<p
								style={{
									fontSize: 12,
									color: 'var(--color-text-primary)',
									margin: 0,
									whiteSpace: 'pre-wrap',
									wordBreak: 'break-word',
								}}
							>
								{studentResponse || '—'}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const ResultRow = ({
	row,
	minScore,
	onOpen,
}: {
	row: testReportResultRow;
	minScore: number | null;
	onOpen: (attempt_id: number) => void;
}) => {
	const score = row.score ?? 0;
	const approved =
		minScore !== null && minScore !== undefined && score >= minScore;

	return (
		<tr
			className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
		>
			<td className="py-2 px-2">{row.attempt_code}</td>
			<td className="py-2 px-2">
				{row.student?.user
					? `${row.student.user.name} ${row.student.user.last_name}`
					: '—'}
			</td>
			<td className="py-2 px-2">{row.attempts}</td>
			<td className="py-2 px-2">
				{row.date ? new Date(row.date).toLocaleDateString() : '—'}
			</td>
			<td className="py-2 px-2">
				<span
					className={`font-medium ${
						approved ? 'text-green-600' : 'text-red-600'
					}`}
				>
					{score}
				</span>
				<span className="text-xs text-gray-400">
					{' '}
					/ {row.total_possible ?? '—'}
				</span>
			</td>
			<td className="py-2 px-2 text-gray-500">
				{row.score_computed ?? '—'}
			</td>
			<td className="py-2 px-2">
				{row.finished ? 'Finalizado' : 'En curso'}
			</td>
			<td className="py-2 px-2 text-center">
				<Button
					size="sm"
					color="blue"
					variant="text"
					onClick={() => onOpen(row.attempt_id)}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Ver detalle
				</Button>
			</td>
		</tr>
	);
};

const TestReportDetailDialog = ({
	open,
	onClose,
	test,
}: {
	open: boolean;
	onClose: () => void;
	test: testReportRow | null;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const { questions, attempt, results, status, error } = useSelector(
		(state: RootState) => state.testReports,
	);
	const [tab, setTab] = useState<Tab>('questions');
	const [page, setPage] = useState(1);
	const [printAttempt, setPrintAttempt] = useState(false);
	const componentRef = useRef<HTMLDivElement>(null);
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Reporte-${test?.code ?? 'examen'}-${attempt?.code ?? ''}`,
	});

	const minScore = results?.min_score ?? test?.min_score ?? null;

	const loadResults = useMemo(
		() => (targetPage: number) => {
			if (!test) return;
			dispatch(
				fetchReportResults({
					test_id: test.id,
					currentPage: targetPage,
					pageSize: 10,
				}),
			);
		},
		[dispatch, test],
	);

	useEffect(() => {
		if (!open || !test) return;
		setPage(1);
		dispatch(clearTestReportAttempt());
		if (tab === 'questions') {
			dispatch(fetchReportQuestions({ test_id: test.id }));
		} else if (tab === 'correct') {
			dispatch(fetchReportCorrectAnswers({ test_id: test.id }));
		} else {
			loadResults(1);
		}
	}, [open, test, tab, dispatch, loadResults]);

	if (!test) return null;

	const openAttempt = (attempt_id: number) => {
		dispatch(
			fetchReportAttemptAnswers({ test_id: test.id, course_student_test_id: attempt_id }),
		);
	};

	const closeAttempt = () => {
		dispatch(clearTestReportAttempt());
		setPrintAttempt(false);
	};

	const goToPage = (targetPage: number) => {
		setPage(targetPage);
		loadResults(targetPage);
	};

	return (
		<Dialog
			open={open}
			handler={onClose}
			size="xl"
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			className="max-w-full sm:max-w-5xl max-h-[90vh] flex flex-col"
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="shrink-0"
			>
				<div className="flex items-center justify-between gap-2">
					<div>
						<p className="text-base font-semibold text-gray-800">
							Reporte de examen {test.code}
						</p>
						<p className="text-xs text-gray-500">
							{test.course?.name ?? '—'} · {test.question_count}{' '}
							preguntas · {test.attempt_count} intentos
						</p>
					</div>
					<button onClick={onClose} aria-label="Cerrar">
						<X size={18} />
					</button>
				</div>
			</DialogHeader>

			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex-1 min-h-0 overflow-y-auto"
			>
				{printAttempt && attempt ? (
					<div className="flex flex-col gap-3">
						<Button
							size="sm"
							color="blue"
							variant="outlined"
							className="self-start flex items-center gap-2"
							onClick={closeAttempt}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<ChevronLeft size={14} /> Volver a los resultados
						</Button>

						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<p className="text-sm font-medium text-gray-700">
								Intento {attempt.code} — {attempt.student?.user?.name}{' '}
								{attempt.student?.user?.last_name}
							</p>
							<Button
								size="sm"
								color="blue"
								className="flex items-center gap-2 self-start"
								onClick={() => handlePrint()}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Printer size={14} /> Imprimir / Guardar PDF
							</Button>
						</div>

						<div className="flex flex-col gap-2">
							{attempt.questions?.map((q: testReportAnsweredQuestion, i) => (
								<QuestionCard
									key={q.id}
									question={q}
									index={i}
									points={q.points_possible}
									pointsScored={q.points_scored}
									result={q.result}
									studentResponse={q.student_response}
								/>
							))}
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap items-center gap-2">
							{TABS.map((t) => (
								<Button
									key={t.key}
									size="sm"
									color="blue"
									variant={tab === t.key ? 'filled' : 'outlined'}
									onClick={() => setTab(t.key)}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{t.label}
								</Button>
							))}
						</div>

						{status === 'loading' && (
							<div className="flex justify-center py-6">
								<Loader className="w-6 h-6 animate-spin" />
							</div>
						)}

						{status === 'failed' && (
							<div className="flex items-center gap-2 justify-center py-6">
								<AlertCircle className="w-5 h-5 text-red-500" />
								<Typography
									variant="small"
									color="red"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{error}
								</Typography>
							</div>
						)}

						{status !== 'loading' && tab !== 'results' && (
							<div className="flex flex-col gap-3">
								{questions && (
									<div className="flex flex-wrap gap-4 text-xs text-gray-500">
										{(questions.question_types ?? []).map((qt) => (
											<span
												key={qt.id}
												className="flex items-center gap-1"
											>
												{typeLabel(qt.question_type_id)}:{' '}
												<strong>{qt.value}</strong> pts ×{' '}
												{qt.amount}
											</span>
										))}
									</div>
								)}
								{questions?.questions?.length ? (
									questions.questions.map((q: testReportQuestion, i) => (
										<QuestionCard
											key={q.id}
											question={q}
											index={i}
											points={q.points}
										/>
									))
								) : (
									<Typography
										variant="h6"
										color="gray"
										className="text-center"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{questions
											? 'No hay preguntas para este filtro'
											: 'Sin datos'}
									</Typography>
								)}
							</div>
						)}

						{status !== 'loading' && tab === 'results' && (
							<div className="flex flex-col gap-3">
								{results && (
									<Typography
										variant="small"
										color="gray"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Puntaje mínimo para aprobar:{' '}
										{minScore ?? '—'}
									</Typography>
								)}
								{results?.data?.length ? (
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b border-gray-300 dark:border-gray-600">
													<th className="text-center py-2 px-2 font-medium">
														Intento
													</th>
													<th className="text-center py-2 px-2 font-medium">
														Alumno
													</th>
													<th className="text-center py-2 px-2 font-medium">
														Intento n°
													</th>
													<th className="text-center py-2 px-2 font-medium">
														Fecha
													</th>
													<th className="text-center py-2 px-2 font-medium">
														Puntaje
													</th>
													<th className="text-center py-2 px-2 font-medium">
														Calculado
													</th>
													<th className="text-center py-2 px-2 font-medium">
														Estado
													</th>
													<th className="text-center py-2 px-2 font-medium">
														Acción
													</th>
												</tr>
											</thead>
											<tbody>
												{results.data.map((row) => (
													<ResultRow
														key={row.attempt_id}
														row={row}
														minScore={minScore}
														onOpen={(id) => {
															openAttempt(id);
															setPrintAttempt(true);
														}}
													/>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<Typography
										variant="h6"
										color="gray"
										className="text-center"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{results
											? 'No hay intentos registrados'
											: 'Sin datos'}
									</Typography>
								)}

								{(results?.totalPages ?? 0) > 1 && (
									<TestListPagination
										active={page}
										totalPages={results?.totalPages ?? 0}
										totalItems={results?.totalItems ?? 0}
										getItemProps={(index: number) => ({
											variant: page === index ? 'filled' : 'text',
											color: 'gray',
											onClick: () => goToPage(index),
											className: 'rounded-full',
										}) as any}
										onPrev={() => goToPage(Math.max(1, page - 1))}
										onNext={() =>
											goToPage(
												Math.min(results?.totalPages ?? 1, page + 1),
											)
										}
									/>
								)}
							</div>
						)}
					</div>
				)}
			</DialogBody>

			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="shrink-0"
			>
				<Button
					color="red"
					variant="outlined"
					onClick={onClose}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cerrar
				</Button>
			</DialogFooter>

			{printAttempt && attempt && (
				<div style={{ display: 'none' }}>
					<div ref={componentRef} className="flex flex-col w-full">
						<TestReportResultsPdf
							attempt={attempt}
							test={test}
						/>
					</div>
				</div>
			)}
		</Dialog>
	);
};

export default TestReportDetailDialog;
